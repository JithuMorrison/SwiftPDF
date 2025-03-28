import React, { useState } from 'react';

function PPTtoPDF() {
  const [file, setFile] = useState(null);
  const [pdfBlob, setPdfBlob] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('http://localhost:5000/convert/ppt-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Conversion failed');

      const blob = await response.blob();
      setPdfBlob(blob);
    } catch (error) {
      console.error('Conversion failed', error);
    }
  };

  const handleDownload = () => {
    if (!pdfBlob) return;
    const url = URL.createObjectURL(pdfBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name.replace(/\.(pptx?|PPTX?)$/, '.pdf'); // Rename extension
    a.click();
    URL.revokeObjectURL(url); // Clean up
  };

  return (
    <div style={{ color: 'white' }}>
      <h2>Convert PPT to PDF</h2>
      <input type="file" accept=".ppt,.pptx" onChange={handleFileChange} />
      <button onClick={handleConvert}>Convert</button>

      {pdfBlob && (
        <div>
          <h3>Converted PDF:</h3>
          <button onClick={handleDownload}>Download PDF</button>
        </div>
      )}
    </div>
  );
}

export default PPTtoPDF;
