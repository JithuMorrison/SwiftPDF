import React, { useState } from 'react';

const ExcelToPdf = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet') {
        if (file.size > 10 * 1024 * 1024) {
          alert('File size must be less than 10 MB.');
          setSelectedFile(null);
        } else {
          setSelectedFile(file);
          setErrorMessage('');
        }
      } else {
        alert('Please upload a valid .xlsx file.');
        setSelectedFile(null);
      }
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert('Please select a file first.');
      return;
    }

    setIsConverting(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://trauma-chi.vercel.app/convert/excel-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'converted.pdf');
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
      setSelectedFile(null);
      document.getElementById('file-input').value = '';
    }
  };

  return (
    <div style={{ backgroundColor: 'white', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)', borderRadius: '16px', padding: '32px', width: '100%', maxWidth: '400px' }}>
      <h1 style={{ fontSize: '24px', fontWeight: '600', textAlign: 'center', color: '#333', marginBottom: '16px' }}>
        Excel to PDF Converter
      </h1>
      <label
        htmlFor="file-input"
        style={{ display: 'block', color: '#555', fontWeight: '500', fontSize: '14px', marginBottom: '8px' }}
      >
        Upload a .xlsx file
      </label>
      <input
        id="file-input"
        type="file"
        onChange={handleFileChange}
        accept=".xlsx"
        style={{ display: 'block', width: '100%', fontSize: '14px', color: '#666', border: '1px solid #ccc', borderRadius: '8px', padding: '8px', cursor: 'pointer', outline: 'none' }}
      />
      <button
        onClick={handleUpload}
        disabled={isConverting || !selectedFile}
        aria-busy={isConverting}
        style={{ marginTop: '16px', width: '100%', padding: '12px', color: 'white', borderRadius: '8px', border: 'none', cursor: isConverting || !selectedFile ? 'not-allowed' : 'pointer', backgroundColor: isConverting || !selectedFile ? '#bbb' : '#007bff', transition: 'background 0.3s' }}
      >
        {isConverting ? 'Converting...' : 'Convert & Download'}
      </button>
      {errorMessage && <p style={{ marginTop: '12px', color: 'red', fontSize: '14px' }}>{errorMessage}</p>}
    </div>
  );
};

export default ExcelToPdf;