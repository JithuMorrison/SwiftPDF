import React, { useState } from 'react';
import { degrees, PDFDocument } from 'pdf-lib';

const PDFRotate = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [rotationPages, setRotationPages] = useState('');
  const [direction, setDirection] = useState(null);
  const [rotatedPdfUrl, setRotatedPdfUrl] = useState(null);
  const [pdf, setPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setIsLoading(true);
      try {
        setPdfFile(file);
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await PDFDocument.load(arrayBuffer);
        setPdf(pdfDoc);
        const fileUrl = URL.createObjectURL(file);
        setRotatedPdfUrl(fileUrl);
      } catch (error) {
        console.error("Error loading PDF:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      handleFileChange({ target: { files: [file] } });
    }
  };

  const handleRotatePdf = async () => {
    if (!pdf || !rotationPages || direction === null) return;
    
    setIsLoading(true);
    try {
      const pages = pdf.getPages();
      
      const pageNumbers = rotationPages
        .split(',')
        .map((num) => parseInt(num.trim(), 10) - 1)
        .filter((num) => num >= 0 && num < pages.length);

      for (const pageNumber of pageNumbers) {
        const page = pages[pageNumber];
        const currentRotation = page.getRotation().angle;
        const newRotation =
          direction === 'left'
            ? currentRotation - 90
            : currentRotation + 90;
        page.setRotation(degrees(newRotation % 360));
      }

      const rotatedPdfBytes = await pdf.save();
      const rotatedBlob = new Blob([rotatedPdfBytes], { type: 'application/pdf' });
      const rotatedPdfUrl = URL.createObjectURL(rotatedBlob);

      setRotatedPdfUrl(rotatedPdfUrl);
    } catch (error) {
      console.error("Error rotating PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.mainContainer}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>PDF Page Rotator</h1>
        <p style={styles.headerSubtitle}>Rotate specific pages in your PDF document</p>
      </div>

      <div style={styles.contentWrapper}>
        <div style={styles.controlsColumn}>
          <div 
            style={{
              ...styles.uploadContainer,
              borderColor: isDragging ? '#4f46e5' : '#e0e0e0',
              backgroundColor: isDragging ? '#f5f3ff' : '#ffffff'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={styles.uploadContent}>
              <svg style={styles.uploadIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <p style={styles.uploadText}>Drag & drop PDF file here or</p>
              <label style={styles.uploadButton}>
                Browse PDF
                <input 
                  type="file" 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  style={styles.fileInput} 
                />
              </label>
              <p style={styles.fileTypeHint}>Only PDF files are accepted</p>
            </div>
          </div>

          {pdfFile && (
            <div style={styles.rotationControls}>
              <div style={styles.inputGroup}>
                <label style={styles.inputLabel}>Pages to rotate (e.g., 1,3,5)</label>
                <input
                  type="text"
                  placeholder="Enter page numbers"
                  value={rotationPages}
                  onChange={(e) => setRotationPages(e.target.value)}
                  style={styles.textInput}
                />
              </div>

              <div style={styles.rotationButtons}>
                <button 
                  onClick={() => setDirection('left')} 
                  style={{
                    ...styles.rotateButton,
                    backgroundColor: direction === 'left' ? '#4f46e5' : '#e0e7ff',
                    color: direction === 'left' ? 'white' : '#4f46e5'
                  }}
                >
                  <svg style={styles.rotateIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,10H9.09C9.43,6.55 10.6,4 12,4C13.95,4 15,7.58 15,12C15,16.42 13.95,20 12,20C10.6,20 9.43,17.45 9.09,14H12L8,10L4,14H7.09C7.57,18.56 9.05,22 12,22C14.94,22 17,17.66 17,12C17,6.34 14.94,2 12,2C10.17,2 8.47,4.46 8.08,8H4L8,4L12,8Z" />
                  </svg>
                  Rotate Left
                </button>
                <button 
                  onClick={() => setDirection('right')} 
                  style={{
                    ...styles.rotateButton,
                    backgroundColor: direction === 'right' ? '#4f46e5' : '#e0e7ff',
                    color: direction === 'right' ? 'white' : '#4f46e5'
                  }}
                >
                  <svg style={styles.rotateIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M12,14H14.91C14.57,17.45 13.4,20 12,20C10.05,20 9,16.42 9,12C9,7.58 10.05,4 12,4C13.4,4 14.57,6.55 14.91,10H12L16,14L20,10H16.91C16.43,5.44 14.95,2 12,2C9.06,2 7,6.34 7,12C7,17.66 9.06,22 12,22C13.83,22 15.53,19.54 15.92,16H20L16,20L12,16Z" />
                  </svg>
                  Rotate Right
                </button>
              </div>

              <button 
                onClick={handleRotatePdf} 
                style={styles.applyButton}
                disabled={!rotationPages || direction === null || isLoading}
              >
                {isLoading ? (
                  <span style={styles.buttonLoading}>
                    <span style={styles.spinner}></span>
                    Applying...
                  </span>
                ) : 'Apply Rotation'}
              </button>
            </div>
          )}

          {rotatedPdfUrl && (
            <div style={styles.resultContainer}>
              <svg style={styles.successIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
              </svg>
              <h3 style={styles.resultTitle}>PDF Rotated Successfully!</h3>
              <a 
                href={rotatedPdfUrl} 
                download="rotated.pdf" 
                style={styles.downloadButton}
              >
                Download Rotated PDF
              </a>
            </div>
          )}
        </div>

        <div style={styles.previewColumn}>
          <div style={styles.previewContainer}>
            <div style={styles.previewHeader}>
              <svg style={styles.previewIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M12,9A3,3 0 0,0 9,12A3,3 0 0,0 12,15A3,3 0 0,0 15,12A3,3 0 0,0 12,9M12,17A5,5 0 0,1 7,12A5,5 0 0,1 12,7A5,5 0 0,1 17,12A5,5 0 0,1 12,17M12,4.5C7,4.5 2.73,7.61 1,12C2.73,16.39 7,19.5 12,19.5C17,19.5 21.27,16.39 23,12C21.27,7.61 17,4.5 12,4.5Z" />
              </svg>
              <h3 style={styles.previewTitle}>PDF Preview</h3>
            </div>
            
            <div style={styles.previewContent}>
              {rotatedPdfUrl ? (
                <object
                  data={rotatedPdfUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  style={styles.pdfViewer}
                >
                  <p style={styles.pdfFallback}>
                    Your browser doesn't support PDF preview. 
                    <a href={rotatedPdfUrl} style={styles.pdfFallbackLink}>Download the PDF</a> instead.
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
    </div>
  );
};

const styles = {
  mainContainer: {
    maxWidth: '1400px',
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
  contentWrapper: {
    display: 'flex',
    gap: '30px',
    '@media (maxWidth: 1024px)': {
      flexDirection: 'column'
    }
  },
  controlsColumn: {
    flex: '1',
    minWidth: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  },
  previewColumn: {
    width: '500px',
    '@media (maxWidth: 1024px)': {
      width: '100%'
    }
  },
  uploadContainer: {
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  uploadContent: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  },
  uploadIcon: {
    width: '60px',
    height: '60px',
    color: '#4f46e5',
    marginBottom: '10px'
  },
  uploadText: {
    fontSize: '1.1rem',
    color: '#555',
    margin: '0'
  },
  uploadButton: {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    '&:hover': {
      backgroundColor: '#4338ca'
    }
  },
  fileInput: {
    display: 'none'
  },
  fileTypeHint: {
    fontSize: '0.9rem',
    color: '#888',
    margin: '0'
  },
  rotationControls: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    gap: '20px'
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  inputLabel: {
    fontSize: '0.95rem',
    fontWeight: '500',
    color: '#1e293b'
  },
  textInput: {
    width: '96%',
    padding: '12px 15px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    fontSize: '1rem',
    '&:focus': {
      outline: 'none',
      borderColor: '#4f46e5',
      boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.1)'
    }
  },
  rotationButtons: {
    display: 'flex',
    gap: '15px',
    justifyContent: 'center'
  },
  rotateButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 20px',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: 'none',
    flex: '1'
  },
  rotateIcon: {
    width: '20px',
    height: '20px'
  },
  applyButton: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    '&:disabled': {
      backgroundColor: '#c7d2fe',
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      backgroundColor: '#4338ca'
    }
  },
  buttonLoading: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  spinner: {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite',
    '@keyframes spin': {
      'to': { transform: 'rotate(360deg)' }
    }
  },
  resultContainer: {
    backgroundColor: '#e8f5e9',
    borderRadius: '12px',
    padding: '30px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px',
    textAlign: 'center'
  },
  successIcon: {
    width: '50px',
    height: '50px',
    color: '#4CAF50'
  },
  resultTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#2E7D32',
    margin: '0'
  },
  downloadButton: {
    padding: '12px 24px',
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    textDecoration: 'none',
    display: 'inline-block',
    '&:hover': {
      backgroundColor: '#3e8e41'
    }
  },
  previewContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    height: '100%',
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
    margin: '0',
    flex: '1'
  },
  previewContent: {
    flex: '1',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '500px'
  },
  pdfViewer: {
    width: '100%',
    height: '100%',
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

export default PDFRotate;