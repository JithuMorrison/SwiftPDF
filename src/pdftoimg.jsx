import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/SwiftPDF/pdf.worker.min.mjs';

const PdfToImage = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const canvasRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    }
  };

  const handlePageChange = (event) => {
    const page = parseInt(event.target.value, 10);
    if (page >= 1 && page <= totalPages) {
      setPageNum(page);
    }
  };

  const handlePrevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };

  const handleNextPage = () => {
    if (pageNum < totalPages) {
      setPageNum(pageNum + 1);
    }
  };

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) return;

      setIsLoading(true);
      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages);

        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.5 });

        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
          canvasContext: context,
          viewport: viewport,
        };
        await page.render(renderContext).promise;

        setImageSrc(canvas.toDataURL());
      } catch (error) {
        console.error('Error loading or rendering PDF:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [pdfUrl, pageNum]);

  return (
    <div style={styles.mainContainer}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>PDF to Image Converter</h1>
        <p style={styles.headerSubtitle}>Convert PDF pages to high-quality images</p>
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

          {pdfUrl && (
            <div style={styles.pageControls}>
              <div style={styles.pageNavigation}>
                <button 
                  onClick={handlePrevPage} 
                  style={styles.pageButton}
                  disabled={pageNum <= 1 || isLoading}
                >
                  <svg style={styles.arrowIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />
                  </svg>
                </button>
                <div style={styles.pageInfo}>
                  <span style={styles.currentPage}>{pageNum}</span>
                  <span style={styles.pageSeparator}>/</span>
                  <span style={styles.totalPages}>{totalPages}</span>
                </div>
                <button 
                  onClick={handleNextPage} 
                  style={styles.pageButton}
                  disabled={pageNum >= totalPages || isLoading}
                >
                  <svg style={styles.arrowIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />
                  </svg>
                </button>
              </div>
              <input
                type="range"
                min="1"
                max={totalPages}
                value={pageNum}
                onChange={handlePageChange}
                style={styles.pageSlider}
                disabled={isLoading}
              />
            </div>
          )}

          <canvas ref={canvasRef} style={{ display: 'none' }} />

          {isLoading ? (
            <div style={styles.loadingState}>
              <div style={styles.spinner}></div>
              <p style={styles.loadingText}>Loading page {pageNum}...</p>
            </div>
          ) : imageSrc ? (
            <div style={styles.resultContainer}>
              <div style={styles.imageContainer}>
                <img 
                  src={imageSrc} 
                  alt={`PDF Page ${pageNum}`} 
                  style={styles.imagePreview} 
                />
              </div>
              <a 
                href={imageSrc} 
                download={`pdf-page-${pageNum}.png`} 
                style={styles.downloadLink}
              >
                <button style={styles.downloadButton}>
                  <svg style={styles.downloadIcon} viewBox="0 0 24 24">
                    <path fill="currentColor" d="M5,20H19V18H5M19,9H15V3H9V9H5L12,16L19,9Z" />
                  </svg>
                  Download Page {pageNum}
                </button>
              </a>
            </div>
          ) : (
            <div style={styles.emptyState}>
              <svg style={styles.emptyIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
              </svg>
              <p style={styles.emptyText}>No PDF selected</p>
              <p style={styles.emptyHint}>Upload a PDF to convert to image</p>
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
              {pdfUrl ? (
                <object
                  data={pdfUrl}
                  type="application/pdf"
                  width="100%"
                  height="100%"
                  style={styles.pdfViewer}
                >
                  <p style={styles.pdfFallback}>
                    Your browser doesn't support PDF preview. 
                    <a href={pdfUrl} style={styles.pdfFallbackLink}>Download the PDF</a> instead.
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
  pageControls: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0'
  },
  pageNavigation: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px',
    marginBottom: '15px'
  },
  pageButton: {
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    width: '40px',
    height: '40px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    '&:disabled': {
      backgroundColor: '#f1f5f9',
      color: '#94a3b8',
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      backgroundColor: '#c7d2fe'
    }
  },
  arrowIcon: {
    width: '24px',
    height: '24px'
  },
  pageInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '5px',
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#1e293b',
    minWidth: '80px',
    justifyContent: 'center'
  },
  currentPage: {
    fontWeight: '600',
    color: '#4f46e5'
  },
  pageSeparator: {
    color: '#94a3b8'
  },
  totalPages: {
    color: '#64748b'
  },
  pageSlider: {
    width: '100%',
    height: '6px',
    borderRadius: '3px',
    backgroundColor: '#e2e8f0',
    outline: 'none',
    appearance: 'none',
  },
  loadingState: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '20px'
  },
  spinner: {
    width: '40px',
    height: '40px',
    border: '4px solid rgba(79, 70, 229, 0.1)',
    borderTopColor: '#4f46e5',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    '@keyframes spin': {
      'to': { transform: 'rotate(360deg)' }
    }
  },
  loadingText: {
    fontSize: '1rem',
    color: '#64748b',
    fontWeight: '500'
  },
  resultContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '25px'
  },
  imageContainer: {
    width: '100%',
    maxWidth: '500px',
    border: '1px solid #e2e8f0',
    borderRadius: '8px',
    overflow: 'hidden'
  },
  imagePreview: {
    width: '100%',
    height: 'auto',
    display: 'block'
  },
  downloadLink: {
    textDecoration: 'none'
  },
  downloadButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    '&:hover': {
      backgroundColor: '#4338ca'
    }
  },
  downloadIcon: {
    width: '20px',
    height: '20px'
  },
  emptyState: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '40px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    textAlign: 'center'
  },
  emptyIcon: {
    width: '60px',
    height: '60px',
    color: '#cbd5e1'
  },
  emptyText: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#475569',
    margin: '0'
  },
  emptyHint: {
    fontSize: '0.9rem',
    color: '#64748b',
    margin: '0'
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
  }
};

export default PdfToImage;