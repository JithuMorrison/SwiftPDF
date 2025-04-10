import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const PDFMerger = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const mergePDFs = async () => {
    if (pdfFiles.length === 0) return;

    setIsLoading(true);

    try {
      const mergedPdf = await PDFDocument.create();

      for (const file of pdfFiles) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await PDFDocument.load(arrayBuffer);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }

      const mergedPdfBytes = await mergedPdf.save();
      const mergedPdfBlob = new Blob([mergedPdfBytes], { type: 'application/pdf' });
      setMergedPdfUrl(URL.createObjectURL(mergedPdfBlob));
    } catch (error) {
      console.error("Error merging PDFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setPdfFiles(selectedFiles);
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
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (files.length) {
      setPdfFiles(files);
    }
  };

  const moveFile = (dragIndex, hoverIndex) => {
    const newPdfFiles = [...pdfFiles];
    const [draggedFile] = newPdfFiles.splice(dragIndex, 1);
    newPdfFiles.splice(hoverIndex, 0, draggedFile);
    setPdfFiles(newPdfFiles);
  };

  const reverseFiles = () => {
    setPdfFiles((prevFiles) => [...prevFiles].reverse());
  };

  const removeFile = (index) => {
    setPdfFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={styles.mainContainer}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>PDF Merger</h1>
          <p style={styles.headerSubtitle}>Combine multiple PDF files into one document</p>
        </div>

        <div style={styles.contentContainer}>
          <div 
            style={{
              ...styles.uploadContainer,
              borderColor: isDragging ? '#4CAF50' : '#e0e0e0',
              backgroundColor: isDragging ? '#f5fff5' : '#ffffff'
            }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div style={styles.uploadContent}>
              <svg style={styles.uploadIcon} viewBox="0 0 24 24">
                <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                <path fill="currentColor" d="M8,15V17H16V15H8M8,11V13H16V11H8M8,7V9H16V7H8Z" />
              </svg>
              <p style={styles.uploadText}>Drag & drop PDF files here or</p>
              <label style={styles.uploadButton}>
                Browse Files
                <input 
                  type="file" 
                  multiple 
                  accept="application/pdf" 
                  onChange={handleFileChange} 
                  style={styles.fileInput} 
                />
              </label>
              <p style={styles.fileTypeHint}>Only PDF files are accepted</p>
            </div>
          </div>

          {pdfFiles.length > 0 && (
            <div style={styles.filesContainer}>
              <div style={styles.filesHeader}>
                <h3 style={styles.filesTitle}>Selected Files ({pdfFiles.length})</h3>
                <div style={styles.actionButtons}>
                  <button 
                    onClick={reverseFiles} 
                    style={styles.secondaryButton}
                    disabled={pdfFiles.length < 2}
                  >
                    Reverse Order
                  </button>
                  <button 
                    onClick={mergePDFs} 
                    style={styles.primaryButton}
                    disabled={pdfFiles.length < 2 || isLoading}
                  >
                    {isLoading ? (
                      <span style={styles.buttonLoading}>
                        <span style={styles.spinner}></span>
                        Merging...
                      </span>
                    ) : 'Merge PDFs'}
                  </button>
                </div>
              </div>

              <div style={styles.fileList}>
                {pdfFiles.map((file, index) => (
                  <FileItem 
                    key={`${file.name}-${index}`} 
                    file={file} 
                    index={index} 
                    moveFile={moveFile} 
                    removeFile={removeFile}
                  />
                ))}
              </div>
            </div>
          )}

          {mergedPdfUrl && (
            <div style={styles.resultContainer}>
              <div style={styles.resultCard}>
                <svg style={styles.successIcon} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
                </svg>
                <h3 style={styles.resultTitle}>PDFs Merged Successfully!</h3>
                <a 
                  href={mergedPdfUrl} 
                  download="merged-document.pdf" 
                  style={styles.downloadButton}
                >
                  Download Merged PDF
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </DndProvider>
  );
};

const FileItem = ({ file, index, moveFile, removeFile }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: 'file',
    hover(item) {
      if (!ref.current) return;
      const dragIndex = item.index;
      const hoverIndex = index;
      if (dragIndex === hoverIndex) return;
      moveFile(dragIndex, hoverIndex);
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: 'file',
    item: { index },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      style={{
        ...styles.fileItem,
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
      }}
    >
      <div style={styles.fileInfo}>
        <svg style={styles.fileIcon} viewBox="0 0 24 24">
          <path fill="currentColor" d="M13,9V3.5L18.5,9M6,2C4.89,2 4,2.89 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2H6Z" />
        </svg>
        <div>
          <p style={styles.fileName}>{file.name}</p>
          <p style={styles.fileSize}>{(file.size / 1024).toFixed(2)} KB</p>
        </div>
      </div>
      <div style={styles.fileActions}>
        <span style={styles.fileIndex}>{index + 1}</span>
        <button 
          onClick={() => removeFile(index)}
          style={styles.removeButton}
          aria-label="Remove file"
        >
          <svg style={styles.removeIcon} viewBox="0 0 24 24">
            <path fill="currentColor" d="M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

const styles = {
  mainContainer: {
    maxWidth: '1000px',
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
    background: 'linear-gradient(90deg, #4CAF50, #2E7D32)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  },
  headerSubtitle: {
    fontSize: '1.1rem',
    color: '#666',
    fontWeight: '400'
  },
  contentContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '30px'
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
    color: '#4CAF50',
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
    backgroundColor: '#4CAF50',
    color: 'white',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    '&:hover': {
      backgroundColor: '#3e8e41'
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
  filesContainer: {
    backgroundColor: '#f9f9f9',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
  },
  filesHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '15px'
  },
  filesTitle: {
    fontSize: '1.3rem',
    fontWeight: '600',
    color: '#333',
    margin: '0'
  },
  actionButtons: {
    display: 'flex',
    gap: '15px'
  },
  primaryButton: {
    padding: '10px 20px',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    '&:disabled': {
      backgroundColor: '#a5d6a7',
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      backgroundColor: '#3e8e41'
    }
  },
  secondaryButton: {
    padding: '10px 20px',
    backgroundColor: 'transparent',
    color: '#4CAF50',
    border: '1px solid #4CAF50',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '0.95rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:disabled': {
      color: '#a5d6a7',
      borderColor: '#a5d6a7',
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      backgroundColor: '#f1f8f1'
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
  fileList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    transition: 'all 0.2s ease',
    border: '1px solid #e0e0e0'
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: '1'
  },
  fileIcon: {
    width: '24px',
    height: '24px',
    color: '#e53935'
  },
  fileName: {
    fontWeight: '500',
    margin: '0',
    color: '#333',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    maxWidth: '400px'
  },
  fileSize: {
    fontSize: '0.8rem',
    color: '#888',
    margin: '3px 0 0 0'
  },
  fileActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  fileIndex: {
    backgroundColor: '#e8f5e9',
    color: '#4CAF50',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600'
  },
  removeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    '&:hover': {
      backgroundColor: '#ffebee'
    }
  },
  removeIcon: {
    width: '20px',
    height: '20px',
    color: '#e53935'
  },
  resultContainer: {
    textAlign: 'center'
  },
  resultCard: {
    backgroundColor: '#e8f5e9',
    borderRadius: '12px',
    padding: '30px',
    display: 'inline-flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '20px'
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
  }
};

export default PDFMerger;