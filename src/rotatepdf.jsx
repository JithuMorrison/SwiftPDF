import React, { useState } from 'react';
import { degrees, PDFDocument } from 'pdf-lib';

const PDFRotate = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [rotationPages, setRotationPages] = useState('');
  const [direction, setDirection] = useState(null);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState(null);
  const [pdf,setPdf] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
        setPdfFile(file);
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPdf(pdfDoc);

        const fileUrl = URL.createObjectURL(file);
        setRotatedPdfUrl(fileUrl);
    }
  };

  const handleRotatePdf = async () => {
    if (!pdf|| !rotationPages || direction === null) return;
    alert('hi');
    const pages = pdf.getPages();
    
    const pageNumbers = rotationPages
      .split(',')
      .map((num) => parseInt(num.trim(), 10) - 1)
      .filter((num) => num >= 0 && num < pages.length);

    for (const pageNumber of pageNumbers) {
      const page = pages[pageNumber];
      const currentRotation = page.getRotation().angle;
      alert(currentRotation);
      const newRotation =
        direction === 'left'
          ? currentRotation - 90
          : currentRotation + 90; // Rotate left or right
      page.setRotation(degrees(newRotation % 360)); // Normalize rotation to 0, 90, 180, 270
    }

    const rotatedPdfBytes = await pdf.save();
    const rotatedBlob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
    const rotatedPdfUrl = URL.createObjectURL(rotatedBlob);

    setRotatedPdfUrl(rotatedPdfUrl);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
    <div style={styles.container}>
      <h2 style={styles.title}>Rotate PDF Pages</h2>
      <label style={styles.uploadLabel}>
        Select a PDF File
        <input type="file" accept="application/pdf" onChange={handleFileChange} style={styles.fileInput} />
      </label>
      <input
        type="text"
        placeholder="Enter page numbers (e.g., 1,3,5)"
        value={rotationPages}
        onChange={(e) => setRotationPages(e.target.value)}
        style={styles.input}
      />
      <div style={styles.buttonContainer}>
        <button onClick={() => setDirection('left')} style={styles.rotateButton}>
          Rotate Left ⟲
        </button>
        <button onClick={() => setDirection('right')} style={styles.rotateButton}>
          Rotate Right ⟳
        </button>
      </div>
      <button onClick={handleRotatePdf} style={styles.submitButton}>
        Apply Rotation
      </button>
      {rotatedPdfUrl && (
        <div style={styles.previewContainer}>
          <h3>Rotated PDF</h3>
          <a href={rotatedPdfUrl} download="rotated.pdf" style={styles.downloadLink}>
            Download Rotated PDF
          </a>
        </div>
      )}
    </div>
    <div style={styles.previewContainer1}>
        <h3 style={styles.previewTitle}>PDF Preview</h3>
        {rotatedPdfUrl ? (
          <object
            data={rotatedPdfUrl}
            type="application/pdf"
            width="100%"
            height="88%"
          >
            <p>Alternative text - include a link <a href={rotatedPdfUrl}>to the PDF</a>!</p>
          </object>
        ) : (
          <p>No PDF Selected</p>
        )}
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ccc',
    borderRadius: '10px',
    width: '400px',
  },
  title: {
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
  },
  uploadLabel: {
    marginBottom: '10px',
    cursor: 'pointer',
    color: '#007BFF',
  },
  fileInput: {
    display: 'none',
  },
  input: {
    width: '100%',
    padding: '10px',
    marginBottom: '20px',
  },
  buttonContainer: {
    display: 'flex',
    gap: '10px',
  },
  rotateButton: {
    padding: '10px 20px',
    backgroundColor: '#28A745',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
  },
  submitButton: {
    marginTop: '20px',
    padding: '10px 20px',
    backgroundColor: '#FF5733',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
  },
  previewContainer: {
    marginTop: '20px',
    textAlign: 'center',
  },
  downloadLink: {
    textDecoration: 'none',
    color: '#fff',
    backgroundColor: '#007BFF',
    padding: '10px 20px',
    borderRadius: '5px',
  },
  previewContainer1: {
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

export default PDFRotate;
