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
    <div>
      <h1>Excel to PDF Converter</h1>
      <input
        id="file-input"
        type="file"
        onChange={handleFileChange}
        accept=".xlsx"
        aria-describedby="file-input-help"
      />
      <small id="file-input-help">Upload a .xlsx file</small>
      <button
        onClick={handleUpload}
        disabled={isConverting || !selectedFile}
        aria-busy={isConverting}
      >
        {isConverting ? 'Converting...' : 'Convert & Download'}
      </button>
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
    </div>
  );
};

export default ExcelToPdf;