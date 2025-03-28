import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';

const PDFSplitter = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [splits, setSplits] = useState([]);
  const [splitUrls, setSplitUrls] = useState([]);
  const [pdfPageCount, setPdfPageCount] = useState(0);
  const [previewUrl, setPreviewUrl] = useState(null);

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

  const handleAddSplit = () => {
    setSplits((prevSplits) => [...prevSplits, { start: '', end: '' }]);
  };

  const handleSplitChange = (index, field, value) => {
    setSplits((prevSplits) =>
      prevSplits.map((split, i) => (i === index ? { ...split, [field]: value } : split))
    );
  };

  const handleSplitPdf = async () => {
    if (!pdfFile || splits.length === 0) return;

    const arrayBuffer = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(arrayBuffer);
    const splitResults = [];

    for (const { start, end } of splits) {
      const startIndex = parseInt(start, 10);
      const endIndex = parseInt(end, 10);

      if (startIndex >= 1 && endIndex <= pdfDoc.getPages().length && startIndex <= endIndex) {

        const splitPdf = await PDFDocument.create();
        const pagesToCopy = pdfDoc.getPages().slice(startIndex - 1, endIndex);
        const copiedPages = await splitPdf.copyPages(pdfDoc, pagesToCopy.map((page) => pdfDoc.getPages().indexOf(page)));
        copiedPages.forEach((page) => splitPdf.addPage(page));

        const splitPdfBytes = await splitPdf.save();
        const splitBlob = new Blob([splitPdfBytes], { type: 'application/pdf' });
        const splitUrl = URL.createObjectURL(splitBlob);

        splitResults.push(splitUrl);
      }
    }

    setSplitUrls(splitResults);
  };

  return (
    <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start' }}>
      <div style={styles.container}>
        <h2 style={styles.title}>PDF Splitter</h2>
        <label style={styles.uploadLabel}>
          Select a PDF File
          <input type="file" accept="application/pdf" onChange={handleFileChange} style={styles.fileInput} />
        </label>
        <button onClick={handleAddSplit} style={styles.addSplitButton} disabled={!pdfFile}>
          Add Split Range
        </button>
        <div style={styles.splitList}>
          {splits.map((split, index) => (
            <div key={index} style={styles.splitRange}>
              <input
                type="number"
                placeholder="Start Page"
                value={split.start}
                onChange={(e) => handleSplitChange(index, 'start', e.target.value)}
                style={styles.input}
                min="1"
                max={pdfPageCount}
              />
              <input
                type="number"
                placeholder="End Page"
                value={split.end}
                onChange={(e) => handleSplitChange(index, 'end', e.target.value)}
                style={styles.input}
                min="1"
                max={pdfPageCount}
              />
            </div>
          ))}
        </div>
        <button onClick={handleSplitPdf} style={styles.splitButton} disabled={splits.length === 0}>
          Split PDF
        </button>
        {splitUrls.map((url, index) => (
          <div key={index} style={styles.downloadContainer}>
            <h4>Split {index + 1}</h4>
            <a href={url} download={`split-${index + 1}.pdf`} style={styles.downloadLink}>
              Download Split PDF
            </a>
          </div>
        ))}
      </div>
      <div style={styles.previewContainer(previewUrl)}>
        <h3 style={styles.previewTitle}>PDF Preview</h3>
        {previewUrl ? (
          <object
            data={previewUrl}
            type="application/pdf"
            width="100%"
            height="88%"
          >
            <p>Alternative text - include a link <a href={previewUrl}>to the PDF</a>!</p>
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
    color: 'white',
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
  addSplitButton: {
    padding: '10px 20px',
    backgroundColor: '#28A745',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  splitList: {
    width: '100%',
    marginTop: '20px',
    marginLeft: '200px',
  },
  splitRange: {
    display: 'flex',
    gap: '10px',
    marginBottom: '10px',
  },
  input: {
    width: '80px',
    padding: '5px',
    fontSize: '14px',
  },
  splitButton: {
    padding: '10px 20px',
    backgroundColor: '#FF5733',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  downloadContainer: {
    marginTop: '20px',
  },
  downloadLink: {
    textDecoration: 'none',
    color: '#fff',
    backgroundColor: '#007BFF',
    padding: '10px 20px',
    borderRadius: '5px',
  },
  previewContainer: (previewUrl) => ({
    width: '550px',
    height: previewUrl ? '600px' : '277px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    padding: '10px',
    overflowY: 'auto',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  }),
  previewTitle: {
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
};

export default PDFSplitter;
