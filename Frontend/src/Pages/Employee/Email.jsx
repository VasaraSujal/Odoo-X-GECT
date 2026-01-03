import React, { useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { useParams } from "react-router-dom";

const SetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const { id } = useParams(); 
  console.log("id from url is", id);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [userId, setUserId] = useState(""); // user ID for image upload
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");

  // Handle password form submit
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (!token) return setMessage("❌ Invalid or missing token.");
    if (password !== confirmPassword)
      return setMessage("❌ Passwords do not match.");

    setLoading(true);
    setMessage("");

    try {
      const res = await fetch("https://attendance-and-payroll-management.onrender.com/api/set-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Password set successfully. Redirecting...");
       
      } else {
        setMessage(`❌ ${data.message}`);
      }
    } catch (err) {
      setMessage("❌ Something went wrong. Try again.");
    } finally {
      setLoading(false);
    }
  };

  // Handle image upload
  const handleUploadSubmit = async (e) => {
    e.preventDefault();

    if (!userId || !image) return alert("Please enter User ID and select an image.");

    if (userId !== id) {
      return setUploadMessage("❌ User ID does not match");
    }
    const formData = new FormData();
    formData.append("user_id", userId);
    formData.append("image", image);

    try {
      const response = await axios.post("https://attendance-and-payroll-management.onrender.com/api/upload-image", formData);
      setImageUrl(response.data.imageUrl);
      setUploadMessage("✅ Profile image uploaded successfully.");
    } catch (error) {
      setUploadMessage("❌ Upload failed.");
      console.error("Upload error:", error);
    }
  };

  const handleImageChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setImage(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
    }
  };
  const handleSave = () => {
    setTimeout(() => navigate("/"), 2500);
  };

  return (
    <div style={styles.container}>
      <h2>Set Your Password</h2>
      <form onSubmit={handlePasswordSubmit} style={styles.form}>
        <input
          type="password"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="password"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          style={styles.input}
        />
        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? "Setting..." : "Set Password"}
        </button>
      </form>

      <hr style={styles.divider} />

      <h2>Upload Profile Picture</h2>
      <form onSubmit={handleUploadSubmit} style={styles.form}>
        <input
          type="text"
          placeholder="Enter User ID"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          required
          style={styles.input}
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            style={{ width: "150px", borderRadius: "8px", marginTop: "10px" }}
          />
        )}
        <button type="submit" style={styles.button}>
          Upload Photo
        </button>
        
      </form>
        <button type="submit" style={styles.button} onClick={handleSave}>
          Click here to save your data
        </button>
      {uploadMessage && <p style={styles.success}>{uploadMessage}</p>}
      {imageUrl && (
        <div>
          <h4>Uploaded Image:</h4>
          <img src={imageUrl} alt="Profile" width="150" style={{ borderRadius: "8px" }} />
        </div>
      )}

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "500px",
    margin: "auto",
    padding: "40px 20px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    background: "#f9f9f9",
    borderRadius: "10px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    marginBottom: "20px",
  },
  input: {
    padding: "10px",
    fontSize: "16px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    padding: "12px",
    backgroundColor: "#007bff",
    color: "white",
    fontSize: "16px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  message: {
    color: "crimson",
    marginTop: "10px",
    fontWeight: "bold",
  },
  success: {
    color: "green",
    marginTop: "10px",
    fontWeight: "bold",
  },
  divider: {
    margin: "30px 0",
    borderTop: "1px solid #ccc",
  },
};

export default SetPassword;
