import { useState } from 'react';
import axios from 'axios';
import './App.css'; // Assume basic styling

function App() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setError('');
  };

  const handleUpload = async () => {
    if (!file) return;

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Call YOUR Backend, not pdfRest directly
      const response = await axios.post('http://localhost:5000/convert', formData, {
        responseType: 'blob', // Important: Tells axios this is a file
      });

      // Create a download link automatically
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `converted_${file.name}.pdf`);
      document.body.appendChild(link);
      link.click();
      
      setLoading(false);
    } catch (err) {
      console.error(err);
      setError("Conversion failed. Check server logs.");
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '50px', textAlign: 'center' }}>
      <h1>AnyFile PDF Converter</h1>
      
      <div className="upload-box" style={{ border: '2px dashed #ccc', padding: '40px' }}>
        <input type="file" onChange={handleFileChange} accept=".docx,.doc,.xlsx" />
      </div>

      <br />

      <button 
        onClick={handleUpload} 
        disabled={!file || loading}
        style={{ padding: '10px 20px', fontSize: '16px' }}
      >
        {loading ? 'Converting...' : 'Convert to PDF'}
      </button>

      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
}

export default App;