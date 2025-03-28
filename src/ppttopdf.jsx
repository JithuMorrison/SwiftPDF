import React, { useState } from 'react';

function PPTtoPDF() {
  const [file, setFile] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file); // Match Flask route expecting 'file'

    try {
      const response = await fetch('http://localhost:5000/convert/ppt-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
    } catch (error) {
      console.error('Conversion failed', error);
    }
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Convert PPT to PDF</h2>
      <input type="file" accept=".ppt,.pptx" onChange={handleFileChange} />
      <button onClick={handleConvert}>Convert</button>

      {pdfUrl && (
        <div>
          <h3>Converted PDF:</h3>
          <a href={pdfUrl} target="_blank" rel="noopener noreferrer">Download PDF</a>
        </div>
      )}
    </div>
  );
}

export default PPTtoPDF;
