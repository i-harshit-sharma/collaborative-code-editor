import React, { useState } from "react";
import axios from "axios";

function TestEditor() {
  const [uploading, setUploading] = useState(false);

  const handleUpload = async (e) => {
    const files = e.target.files;
    const formData = new FormData();
    const containerId = "ee9afd4b176ba82fe8d37406aafbb719f795cb99b691a736ee02d31402f99be5";
    formData.append("containerId", containerId);

    for (let i = 0; i < files.length; i++) {
      formData.append("files", files[i]);
    }

    setUploading(true);
    try {
      await axios.post("http://localhost:4000/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      alert("Files uploaded successfully");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
    setUploading(false);
  };

  return (
    <div className="p-4 border rounded shadow">
      <h2 className="text-lg font-semibold mb-2">Upload Files/Folders</h2>
      <input
        type="file"
        webkitdirectory="true"
        directory=""
        multiple
        onChange={handleUpload}
        className="mb-2"
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
}

export default TestEditor;
