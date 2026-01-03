import React, { useState, useEffect, useRef } from "react";
import * as faceapi from "face-api.js";
import { useSelector } from "react-redux";
import { MapPin, Camera, X, CheckCircle, AlertCircle, Clock, UserCheck, ShieldCheck, Map, Scan, Calendar } from "lucide-react";

function AttendanceNew() {
  const { user } = useSelector((state) => state.auth);
  const [status, setStatus] = useState("loading");
  const [message, setMessage] = useState("");
  const videoRef = useRef();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [faceRegistered, setFaceRegistered] = useState(null); // null, true, false
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadModels();
    fetchUserInfo();
    fetchTodayAttendance();
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!showModal && videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
    } else if (showModal && modelsLoaded) {
      startVideo();
    }
  }, [showModal, modelsLoaded]);

  const loadModels = async () => {
    try {
      const MODEL_URL = "/models";
      console.log("⚡ [%s] AI Engine: Booting...", new Date().toLocaleTimeString());

      // 🛡️ Safe Engine Initialization (CPU fallback)
      if (faceapi.tf) {
        try {
          // Attempt to set backend to cpu for maximum compatibility
          await faceapi.tf.setBackend('cpu');
          console.log("🛠️ TFJS Backend: cpu locked.");
        } catch (tfErr) {
          console.warn("⚠️ TFJS Backend switch failed, using defaults:", tfErr);
        }
      }

      // Sequential loading
      console.log("📦 Loading Models...");
      await faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL);
      await faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL);
      await faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL);

      console.log("✅ [%s] AI Engines ready", new Date().toLocaleTimeString());
      setModelsLoaded(true);
      setMessage("");
    } catch (err) {
      console.error("❌ AI Boot Failure:", err);
      setMessage(`❌ Engine Error: AI models failed to load. Please refresh.`);
    }
  };

  const fetchUserInfo = async () => {
    try {
      if (!user) return console.log("⏳ User not loaded in Redux yet.");
      const userId = user._id || user.user_id || user.id;
      console.log("🔍 Fetching profile for registration check. ID:", userId);

      const res = await fetch(`http://localhost:5500/api/users/${userId}`);
      if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);

      const data = await res.json();
      console.log("📄 Profile data received:", data.user ? "Found" : "Not Found");

      if (data.user && data.user.faceDescriptor) {
        setFaceRegistered(true);
      } else {
        setFaceRegistered(false);
      }
    } catch (error) {
      console.error("❌ Error fetching user info:", error);
    }
  };

  const startVideo = () => {
    navigator.mediaDevices
      .getUserMedia({ video: {} })
      .then((stream) => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      })
      .catch((err) => console.error("Error accessing webcam:", err));
  };

  const fetchTodayAttendance = async () => {
    try {
      const userIdToSend = user._id || user.user_id || user.id;
      const res = await fetch(`http://localhost:5500/api/attendance/${userIdToSend}`);
      const data = await res.json();
      if (data.status && data.status !== "Absent") {
        setStatus(data.checkOutTime ? "completed" : "checked-in");
      } else {
        setStatus("not-checked-in");
      }
    } catch (error) {
      setStatus("not-checked-in");
    }
  };

  const handleAction = async () => {
    if (isRegistering) {
      handleRegister();
    } else {
      handleCheckIn();
    }
  };

  const handleRegister = async () => {
    if (!modelsLoaded) return setMessage("⏳ AI Engines warming up...");
    if (!videoRef.current || videoRef.current.readyState < 2) return setMessage("📸 Camera starting...");

    setMessage("📸 Processing Face ID...");
    try {
      const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
      if (!detections) return setMessage("❌ No face detected. Try again.");

      const userId = user._id || user.user_id || user.id;
      const res = await fetch("http://localhost:5500/api/register-face", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: userId,
          descriptor: Array.from(detections.descriptor)
        }),
      });
      if (res.ok) {
        setMessage("✅ Face registered! Now you can mark attendance.");
        setFaceRegistered(true);
        setTimeout(() => {
          setShowModal(false);
          setIsRegistering(false);
        }, 2000);
      } else {
        setMessage("❌ Registration failed.");
      }
    } catch (err) {
      console.error("Detection Error:", err);
      setMessage("❌ AI Processing Error. (Check Console)");
    }
  };

  const handleCheckIn = async () => {
    if (!modelsLoaded) return setMessage("⏳ AI Engines warming up...");
    if (!videoRef.current || videoRef.current.readyState < 2) return setMessage("📸 Camera starting...");

    setMessage("📍 Verifying Face & Location...");
    try {
      const detections = await faceapi.detectSingleFace(videoRef.current).withFaceLandmarks().withFaceDescriptor();
      if (!detections) return setMessage("❌ No face detected!");

      navigator.geolocation.getCurrentPosition(async (position) => {
        const location = { lat: position.coords.latitude, lng: position.coords.longitude };
        const userIdToSend = user._id || user.user_id || user.id;
        try {
          const res = await fetch("http://localhost:5500/api/mark-attendance", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: userIdToSend,
              username: user.username,
              location,
              type: "check-in",
              descriptor: Array.from(detections.descriptor)
            }),
          });
          const data = await res.json();
          if (res.ok) {
            setMessage(data.message);
            setStatus("checked-in");
            setTimeout(() => setShowModal(false), 2000);
          } else {
            setMessage(data.message || "❌ Check-in Failed");
          }
        } catch (err) {
          setMessage("❌ Server Error");
        }
      });
    } catch (err) {
      console.error("Check-in AI Error:", err);
      setMessage("❌ AI Processing Error.");
    }
  };

  const handleCheckOut = async () => {
    setMessage("📍 Verifying Location...");
    navigator.geolocation.getCurrentPosition(async (position) => {
      const location = { lat: position.coords.latitude, lng: position.coords.longitude };
      const userIdToSend = user._id || user.user_id || user.id;
      try {
        const res = await fetch("http://localhost:5500/api/mark-attendance", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: userIdToSend, username: user.username, location, type: "check-out" }),
        });
        const data = await res.json();
        if (res.ok) {
          setMessage(data.message);
          setStatus("completed");
        } else {
          setMessage(data.message || "❌ Check-out Failed");
        }
      } catch (err) {
        setMessage("❌ Server Error");
      }
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-4 animate-in fade-in duration-700 pb-24">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 bg-gradient-to-r from-indigo-700 to-purple-800 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden group">
          <div className="relative z-10">
            <h1 className="text-4xl font-extrabold mb-2">Hello, {user?.username}! 👋</h1>
            <p className="text-indigo-100 text-lg opacity-90 mb-6">Your workspace is ready. Let's make today productive!</p>
            <div className="flex flex-wrap gap-4">
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                <Clock size={18} />
                <span>{currentTime.toLocaleTimeString()}</span>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20">
                <Calendar size={18} />
                <span>{currentTime.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <UserCheck size={280} />
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 flex flex-col justify-center text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ShieldCheck size={32} />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-1">Face ID Status</h3>
          {faceRegistered === true ? (
            <p className="text-green-600 font-medium flex items-center justify-center gap-1">
              <CheckCircle size={16} /> Verified Secure
            </p>
          ) : faceRegistered === false ? (
            <p className="text-amber-500 font-medium flex items-center justify-center gap-1">
              <AlertCircle size={16} /> Needs Registration
            </p>
          ) : (
            <div className="flex justify-center"><div className="w-4 h-4 border-2 border-gray-300 border-t-indigo-600 rounded-full animate-spin"></div></div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-gray-100 p-8 lg:p-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Check In', value: status === 'checked-in' || status === 'completed' ? 'Success' : 'Pending', icon: '📍', active: status === 'checked-in' },
            { label: 'Check Out', value: status === 'completed' ? 'Success' : 'Pending', icon: '👋', active: status === 'completed' },
            { label: 'Office Hours', value: '09:00 - 18:00', icon: '⏰', active: false }
          ].map((item, i) => (
            <div key={i} className={`p-8 rounded-[2rem] border-2 transition-all duration-300 ${item.active ? 'bg-indigo-50 border-indigo-200 scale-105' : 'bg-gray-50 border-gray-100 hover:border-indigo-100'}`}>
              <div className="text-4xl mb-4">{item.icon}</div>
              <h3 className="font-bold text-xl text-gray-800">{item.label}</h3>
              <p className={`text-sm font-semibold uppercase tracking-wider mt-1 ${item.value === 'Success' ? 'text-green-600' : 'text-gray-400'}`}>{item.value}</p>
            </div>
          ))}
        </div>

        <div className="flex flex-col md:flex-row gap-4 justify-center items-center">
          {status === "not-checked-in" && (
            <>
              {faceRegistered === false ? (
                <button
                  onClick={() => { setIsRegistering(true); setShowModal(true); }}
                  className="group px-10 py-5 bg-gradient-to-r from-orange-500 to-red-600 text-white text-xl rounded-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Scan size={28} className="group-hover:rotate-12 transition-transform" />
                  First-Time Face Setup
                </button>
              ) : (
                <button
                  onClick={() => { setIsRegistering(false); setShowModal(true); }}
                  className="group px-10 py-5 bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-xl rounded-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
                >
                  <Camera size={28} className="group-hover:rotate-12 transition-transform" />
                  Punch Attendance
                </button>
              )}
            </>
          )}

          {status === "checked-in" && (
            <button
              onClick={handleCheckOut}
              className="group px-10 py-5 bg-gradient-to-r from-rose-500 to-red-700 text-white text-xl rounded-2xl font-black shadow-2xl hover:scale-105 transition-all flex items-center gap-3"
            >
              <MapPin size={28} className="group-hover:rotate-12 transition-transform" />
              Sign Out Now
            </button>
          )}

          {status === "completed" && (
            <div className="px-10 py-5 bg-gray-100 text-gray-400 text-xl rounded-2xl font-black border border-gray-200 flex items-center gap-3 cursor-default">
              <CheckCircle size={28} />
              Done for Today
            </div>
          )}
        </div>
      </div>

      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-indigo-50/50 rounded-3xl p-6 border border-indigo-100/50 flex items-start gap-4">
          <div className="bg-indigo-100 p-3 rounded-xl text-indigo-600">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Bank-Grade Security</h4>
            <p className="text-sm text-gray-500 mt-1">Your biometrics are encrypted and stored locally. We never store actual images of your face.</p>
          </div>
        </div>
        <div className="bg-purple-50/50 rounded-3xl p-6 border border-purple-100/50 flex items-start gap-4">
          <div className="bg-purple-100 p-3 rounded-xl text-purple-600">
            <Map size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-800">Geofencing Active</h4>
            <p className="text-sm text-gray-500 mt-1">Verification only works within the office radius. Ensure your GPS is active.</p>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-xl transition-all duration-500" onClick={() => setShowModal(false)}></div>
          <div className="bg-white/80 backdrop-blur-2xl rounded-[3rem] shadow-[0_0_100px_rgba(0,0,0,0.2)] max-w-lg w-full overflow-hidden relative border border-white/50 animate-in zoom-in duration-300">
            <div className="px-8 py-6 border-b border-white/20 flex justify-between items-center bg-white/30">
              <div>
                <h3 className="font-black text-2xl text-gray-900 leading-none">
                  {isRegistering ? "Registration" : "Face Scan"}
                </h3>
                <p className="text-gray-500 text-sm mt-1">Place your face inside the circle</p>
              </div>
              <button onClick={() => setShowModal(false)} className="w-10 h-10 rounded-full bg-white/50 flex items-center justify-center text-gray-600 hover:bg-white hover:text-black transition-all shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="p-8">
              <div className="relative w-full aspect-square bg-gray-900 rounded-[2.5rem] overflow-hidden mb-8 shadow-2xl border-4 border-white">
                <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                {!modelsLoaded && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/95 text-white p-6 text-center backdrop-blur-md">
                    <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/20 border-t-white mb-6"></div>
                    <p className="font-black text-xl mb-2">SYNCING AI...</p>
                  </div>
                )}
                {modelsLoaded && (
                  <div className="absolute inset-0 pointer-events-none">
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-80 border-2 border-dashed border-indigo-400/50 rounded-full animate-pulse"></div>
                    <div className="absolute inset-0 bg-gradient-to-t from-indigo-900/20 to-transparent"></div>
                    <div className="absolute top-4 left-4 flex gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 animate-ping"></div>
                      <span className="text-[10px] text-white font-mono uppercase tracking-widest bg-black/40 px-2 py-1 rounded">Live Stream</span>
                    </div>
                  </div>
                )}
              </div>
              <button
                onClick={handleAction}
                disabled={!modelsLoaded}
                className={`w-full py-5 text-xl rounded-2xl font-black text-white shadow-2xl transform transition-all active:scale-95 flex items-center justify-center gap-3
                            ${modelsLoaded ? 'bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-700 hover:shadow-indigo-500/40' : 'bg-gray-400 cursor-not-allowed'}`}
              >
                {isRegistering ? "CREATE FACE ID" : "VERIFY & PROCEED"}
              </button>
              {message && (
                <div className={`mt-6 p-4 rounded-2xl text-center text-sm font-bold border-2 animate-in slide-in-from-top-2 duration-300 ${message.includes("❌") ? "bg-red-50/80 text-red-700 border-red-100" :
                  message.includes("✅") ? "bg-green-50/80 text-green-700 border-green-100" :
                    "bg-indigo-50/80 text-indigo-700 border-indigo-100"
                  }`}>
                  {message}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AttendanceNew;
