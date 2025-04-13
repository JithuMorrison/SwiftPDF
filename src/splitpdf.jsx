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
    <div style={styles.mainContainer}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>PDF Splitter</h1>
        <p style={styles.headerSubtitle}>Split your PDF documents by page ranges</p>
      </div>

      <div style={styles.contentContainer}>
        <div style={styles.controlPanel}>
          <div style={styles.uploadCard}>
            <div style={styles.uploadHeader}>
              <svg style={styles.uploadIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <h3 style={styles.uploadTitle}>Select PDF</h3>
            </div>
            <label style={styles.uploadButton}>
              Choose File
              <input 
                type="file" 
                accept="application/pdf" 
                onChange={handleFileChange} 
                style={styles.fileInput} 
              />
            </label>
            {pdfFile && (
              <p style={styles.fileInfo}>
                <span style={styles.fileName}>{pdfFile.name}</span>
                <span style={styles.fileSize}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</span>
              </p>
            )}
          </div>

          <div style={styles.splitControls}>
            <div style={styles.sectionHeader}>
              <svg style={styles.splitIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,17H21V19H19V17M19,13H21V15H19V13M3,3H15V5H3V3M19,9H21V11H19V9M19,5H21V7H19V5M3,7H15V9H3V7M3,11H15V13H3V11M3,15H15V17H3V15M3,19H15V21H3V19Z" />
              </svg>
              <h3 style={styles.sectionTitle}>Split Ranges</h3>
            </div>
            
            <button 
              onClick={handleAddSplit} 
              style={styles.addButton}
              disabled={!pdfFile}
            >
              <svg style={styles.plusIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
              </svg>
              Add Range
            </button>

            <div style={styles.splitList}>
              {splits.map((split, index) => (
                <div key={index} style={styles.splitItem}>
                  <div style={styles.rangeInputs}>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>Start Page</label>
                      <input
                        type="number"
                        placeholder="1"
                        value={split.start}
                        onChange={(e) => handleSplitChange(index, 'start', e.target.value)}
                        style={styles.numberInput}
                        min="1"
                        max={pdfPageCount}
                      />
                    </div>
                    <div style={styles.inputGroup}>
                      <label style={styles.inputLabel}>End Page</label>
                      <input
                        type="number"
                        placeholder={pdfPageCount}
                        value={split.end}
                        onChange={(e) => handleSplitChange(index, 'end', e.target.value)}
                        style={styles.numberInput}
                        min="1"
                        max={pdfPageCount}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button 
              onClick={handleSplitPdf} 
              style={styles.splitButton}
              disabled={splits.length === 0}
            >
              {splitUrls.length > 0 ? 'Split Again' : 'Split PDF'}
            </button>
          </div>

          {splitUrls.length > 0 && (
            <div style={styles.resultsSection}>
              <div style={styles.sectionHeader}>
                <svg style={styles.downloadIcon} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                </svg>
                <h3 style={styles.sectionTitle}>Download Splits</h3>
              </div>
              
              <div style={styles.downloadGrid}>
                {splitUrls.map((url, index) => (
                  <div key={index} style={styles.downloadCard}>
                    <div style={styles.downloadInfo}>
                      <span style={styles.downloadNumber}>Split {index + 1}</span>
                      <span style={styles.downloadPages}>
                        Pages {splits[index]?.start || '?'} - {splits[index]?.end || '?'}
                      </span>
                    </div>
                    <a 
                      href={url} 
                      download={`split-${index + 1}.pdf`} 
                      style={styles.downloadButton}
                    >
                      Download
                    </a>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={styles.previewContainer}>
          <div style={styles.previewHeader}>
            <svg style={styles.previewIcon} viewBox="0 0 24 24">
              <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
            </svg>
            <h3 style={styles.previewTitle}>PDF Preview</h3>
          </div>
          
          <div style={styles.previewContent}>
            {previewUrl ? (
              <object
                data={previewUrl}
                type="application/pdf"
                width="100%"
                height="100%"
                style={styles.pdfViewer}
              >
                <p style={styles.pdfFallback}>
                  Your browser doesn't support PDF preview. 
                  <a href={previewUrl} style={styles.pdfFallbackLink}>Download the PDF</a> instead.
                </p>
              </object>
            ) : (
              <div style={styles.emptyPreview}>
                <svg style={styles.emptyIcon} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                </svg>
                <p style={styles.emptyText}>No PDF selected</p>
                <p style={styles.emptyHint}>Upload a PDF to preview it here</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const styles = {
  mainContainer: {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#333'
  },
  header: {
    textAlign: 'center',
    marginBottom: '40px'
  },
  headerTitle: {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '10px',
    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  headerSubtitle: {
    fontSize: '1.1rem',
    color: '#64748b',
    fontWeight: '400'
  },
  contentContainer: {
    display: 'flex',
    gap: '30px',
  },
  controlPanel: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px',
    minWidth: '400px'
  },
  uploadCard: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  uploadHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  uploadIcon: {
    width: '32px',
    height: '32px',
    color: '#4f46e5'
  },
  uploadTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0'
  },
  uploadButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    textAlign: 'center',
    width: '91%',
    '&:hover': {
      backgroundColor: '#4338ca'
    }
  },
  fileInput: {
    display: 'none'
  },
  fileInfo: {
    display: 'flex',
    justifyContent: 'space-between',
    marginTop: '15px',
    fontSize: '0.9rem',
    color: '#64748b'
  },
  fileName: {
    fontWeight: '500',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '70%'
  },
  fileSize: {
    color: '#94a3b8'
  },
  splitControls: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  splitIcon: {
    width: '28px',
    height: '28px',
    color: '#4f46e5'
  },
  sectionTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    padding: '10px 16px',
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    width: '100%',
    marginBottom: '20px',
    '&:hover': {
      backgroundColor: '#c7d2fe'
    },
    '&:disabled': {
      backgroundColor: '#f1f5f9',
      color: '#94a3b8',
      cursor: 'not-allowed'
    }
  },
  plusIcon: {
    width: '20px',
    height: '20px'
  },
  splitList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    marginBottom: '25px'
  },
  splitItem: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid #e2e8f0'
  },
  rangeInputs: {
    display: 'flex',
    gap: '15px',
    '@media (max-width: 480px)': {
      flexDirection: 'column'
    }
  },
  inputGroup: {
    flex: '1'
  },
  inputLabel: {
    display: 'block',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#64748b',
    marginBottom: '5px'
  },
  numberInput: {
    width: '90%',
    padding: '10px 12px',
    border: '1px solid #e2e8f0',
    borderRadius: '6px',
    fontSize: '0.95rem',
    '&:focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)'
    }
  },
  splitButton: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    width: '100%',
    '&:hover': {
      backgroundColor: '#4338ca'
    },
    '&:disabled': {
      backgroundColor: '#c7d2fe',
      cursor: 'not-allowed'
    }
  },
  resultsSection: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0'
  },
  downloadIcon: {
    width: '28px',
    height: '28px',
    color: '#4f46e5'
  },
  downloadGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))',
    gap: '15px'
  },
  downloadCard: {
    backgroundColor: '#f8fafc',
    borderRadius: '8px',
    padding: '15px',
    border: '1px solid #e2e8f0',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  downloadInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  downloadNumber: {
    fontWeight: '600',
    color: '#1e293b'
  },
  downloadPages: {
    fontSize: '0.85rem',
    color: '#64748b'
  },
  downloadButton: {
    padding: '8px 16px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '0.9rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    textDecoration: 'none',
    '&:hover': {
      backgroundColor: '#4338ca'
    }
  },
  previewContainer: {
    flex: '1',
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
    border: '1px solid #e2e8f0',
    minWidth: '400px',
    display: 'flex',
    flexDirection: 'column'
  },
  previewHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    borderBottom: '1px solid #e2e8f0'
  },
  previewIcon: {
    width: '28px',
    height: '28px',
    color: '#4f46e5'
  },
  previewTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0'
  },
  previewContent: {
    flex: '1',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  },
  pdfViewer: {
    width: '100%',
    height: '100%',
    minHeight: '500px',
    border: 'none',
    borderRadius: '8px'
  },
  pdfFallback: {
    textAlign: 'center',
    color: '#64748b'
  },
  pdfFallbackLink: {
    color: '#4f46e5',
    textDecoration: 'none',
    fontWeight: '500',
    '&:hover': {
      textDecoration: 'underline'
    }
  },
  emptyPreview: {
    textAlign: 'center',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  },
  emptyIcon: {
    width: '60px',
    height: '60px',
    color: '#cbd5e1',
    marginBottom: '10px'
  },
  emptyText: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#475569',
    margin: '0'
  },
  emptyHint: {
    fontSize: '0.9rem',
    margin: '0'
  }
};

export default PDFSplitter;