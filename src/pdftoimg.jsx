import React, { useState, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';

const PDFPageToImage = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [selectedPage, setSelectedPage] = useState(1);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);
  const canvasRef = useRef(null);

  // Handle PDF file upload
  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setPdfFile(file);

      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPdfPageCount(pdfDoc.getPages().length);

      const fileUrl = URL.createObjectURL(file);
      setPreviewUrl(fileUrl);
    }
  };

  const handleConvertToImage = async () => {
    if (!pdfFile || selectedPage < 1 || selectedPage > pdfPageCount) return;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const page = pdfDoc.getPages()[selectedPage - 1];

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const scale = 2; // Scale factor for better resolution
    const viewport = page.getSize();
    canvas.width = viewport.width * scale;
    canvas.height = viewport.height * scale;

    // In pdf-lib, there's no direct method to render the PDF page onto the canvas,
    // so we simulate rendering by drawing placeholder text (for now).
    ctx.fillStyle = 'black';
    ctx.font = '20px Arial';
    ctx.fillText('Extracted content would go here', 10, 50);

    // Convert canvas content to a Data URL (image)
    const imgDataUrl = canvas.toDataURL('image/png');

    // Set the preview image URL
    setPreviewUrl(imgDataUrl);

    // Optionally, trigger the download
    const link = document.createElement('a');
    link.href = imgDataUrl;
    link.download = `page_${selectedPage}.png`; // Name the image file based on the page number
    link.click();
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={styles.container}>
        <h2 style={styles.title}>Convert PDF Page to Image</h2>

        {/* File input */}
        <label style={styles.uploadLabel}>
          Select a PDF File
          <input type="file" accept="application/pdf" onChange={handleFileChange} style={styles.fileInput} />
        </label>

        {/* Page selection */}
        <div style={styles.pageSelectionContainer}>
          <label>
            Select Page:
            <input
              type="number"
              value={selectedPage}
              onChange={(e) => setSelectedPage(Number(e.target.value))}
              min="1"
              max={pdfPageCount}
              style={styles.input}
            />
          </label>
        </div>

        {/* Convert button */}
        <button onClick={handleConvertToImage} style={styles.convertButton}>
          Convert to Image
        </button>
      </div>

      {/* Preview image */}
      <div style={styles.previewContainer}>
        <h3 style={styles.previewTitle}>PDF Page Preview</h3>
        {previewUrl ? (
          <img src={previewUrl} alt="PDF Preview" style={{ width: '100%', height: 'auto' }} />
        ) : (
          <p>No PDF Selected</p>
        )}
      </div>

      {/* Canvas element for rendering */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    width: '400px',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    color: '#333',
  },
  uploadLabel: {
    display: 'block',
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    borderRadius: '5px',
    cursor: 'pointer',
    marginBottom: '20px',
    fontSize: '16px',
    textAlign: 'center',
  },
  fileInput: {
    display: 'none',
  },
  pageSelectionContainer: {
    marginBottom: '20px',
  },
  input: {
    padding: '5px',
    fontSize: '14px',
    width: '80px',
  },
  convertButton: {
    padding: '10px 20px',
    backgroundColor: '#28A745',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  previewContainer: {
    width: '550px',
    height: '600px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '10px',
    overflowY: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  previewTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
};

export default PDFPageToImage;
