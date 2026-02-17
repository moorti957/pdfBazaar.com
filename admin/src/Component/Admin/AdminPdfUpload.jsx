import React, { useState } from "react";

export default function AdminPdfUpload() {
  const [pdf, setPdf] = useState(null);
  const [uploaded, setUploaded] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      alert("Sirf PDF upload kare ❌");
      return;
    }

    setPdf(file);
  };

  const uploadPdf = async () => {
    if (!pdf) {
      alert("Pehle PDF select karo");
      return;
    }

    const formData = new FormData();
    formData.append("file", pdf);

    try {
      setLoading(true);

      // 👉 Yahan apni backend API lagao
      const res = await fetch("https://your-backend-url/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok) {
        setUploaded([...uploaded, data.fileUrl || pdf.name]);
        alert("PDF Successfully Upload Ho Gayi 🎉");
        setPdf(null);
      } else {
        alert("Upload Failed ❌");
      }
    } catch (err) {
      alert("Server Error 😥");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2>🛠 Admin PDF Upload Panel</h2>

      <div style={styles.box}>
        <input type="file" accept="application/pdf" onChange={handleFile} />

        <button onClick={uploadPdf} style={styles.button} disabled={loading}>
          {loading ? "Uploading..." : "Upload PDF"}
        </button>
      </div>

      <h3>📄 Uploaded PDFs</h3>
      <ul>
        {uploaded.map((item, index) => (
          <li key={index}>
            <a href={item} target="_blank" rel="noopener noreferrer">
              {item}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    width: "60%",
    margin: "40px auto",
    padding: "20px",
    borderRadius: "12px",
    background: "#f5f5f5",
    textAlign: "center",
  },
  box: {
    padding: "20px",
    marginBottom: "20px",
    border: "2px dashed gray",
    borderRadius: "10px",
  },
  button: {
    marginTop: "10px",
    padding: "10px 20px",
    borderRadius: "5px",
    border: "none",
    cursor: "pointer",
    background: "blue",
    color: "white",
    fontSize: "16px",
  },
};
