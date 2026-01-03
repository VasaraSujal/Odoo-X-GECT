import React, { useState, useRef, useEffect } from "react";
import * as faceapi from "face-api.js";
import { useSelector } from "react-redux";
import { Camera } from "lucide-react";

const RegisterFace = () => {
    const { user } = useSelector((state) => state.auth);
    const videoRef = useRef();
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [isScanning, setIsScanning] = useState(false);
    const [message, setMessage] = useState("");

    useEffect(() => {
        loadModels();
    }, []);

    const loadModels = async () => {
        try {
            const MODEL_URL = window.location.origin + "/models";
            await Promise.all([
                faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
                faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
            ]);
            setModelsLoaded(true);
        } catch (err) {
            console.error(err);
            setMessage(`❌ Load Error: ${err.message || "Models not found"}`);
        }
    };

    const startVideo = () => {
        setIsScanning(true);
        navigator.mediaDevices
            .getUserMedia({ video: {} })
            .then((stream) => {
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            })
            .catch((err) => setMessage("❌ Webcam access denied"));
    };

    const handleCapture = async () => {
        if (!videoRef.current) return;

        const detections = await faceapi.detectSingleFace(videoRef.current)
            .withFaceLandmarks()
            .withFaceDescriptor();

        if (detections) {
            const descriptor = Array.from(detections.descriptor);

            // Send to backend
            try {
                const userIdToSend = user._id || user.user_id || user.id;
                console.log("Registering face for user ID:", userIdToSend);

                const res = await fetch("http://localhost:5500/api/register-face", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_id: userIdToSend,
                        descriptor
                    }),
                });

                const data = await res.json();
                if (res.ok) {
                    setMessage("✅ Face Registered Successfully!");
                    setIsScanning(false);
                    // Stop video
                    const stream = videoRef.current.srcObject;
                    const tracks = stream.getTracks();
                    tracks.forEach(track => track.stop());
                } else {
                    setMessage("❌ " + data.message);
                }
            } catch (err) {
                setMessage("❌ Server Error");
            }
        } else {
            setMessage("❌ No face detected. Please hold still.");
        }
    };

    return (
        <div className="flex flex-col items-center">
            <h1 className="text-3xl font-bold mb-8 text-gray-800">Register Face ID</h1>

            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-lg text-center border border-gray-100">
                <div className="bg-black rounded-xl h-80 mb-6 overflow-hidden relative shadow-inner ring-4 ring-gray-50">
                    {isScanning ? (
                        <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400 bg-gray-900">
                            <Camera size={48} className="mb-4 opacity-50" />
                            <p>Camera is currently off</p>
                        </div>
                    )}
                </div>

                {!isScanning ? (
                    <button
                        onClick={startVideo}
                        disabled={!modelsLoaded}
                        className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-indigo-700 transition-all disabled:bg-gray-400 shadow-lg hover:shadow-indigo-500/20"
                    >
                        {modelsLoaded ? "🚀 Start Face Scanner" : "⏳ Loading AI Models..."}
                    </button>
                ) : (
                    <button
                        onClick={handleCapture}
                        className="w-full bg-green-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/20"
                    >
                        📸 Capture Face Descriptor
                    </button>
                )}

                {message && (
                    <div className={`mt-6 p-4 rounded-xl font-semibold ${message.includes("✅") ? "bg-green-50 text-green-700 border border-green-100" :
                        message.includes("❌") ? "bg-red-50 text-red-700 border border-red-100" :
                            "bg-gray-50 text-gray-600 border border-gray-100"
                        }`}>
                        {message}
                    </div>
                )}
            </div>
        </div>
    );
};

export default RegisterFace;
