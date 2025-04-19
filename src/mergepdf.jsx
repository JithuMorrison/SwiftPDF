import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const PDFMerger = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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
      const url = URL.createObjectURL(mergedPdfBlob);
      setMergedPdfUrl(url);
      setPreviewUrl(url);
    } catch (error) {
      console.error("Error merging PDFs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = async (event) => {
    const selectedFiles = Array.from(event.target.files);
    if (selectedFiles.length > 0) {
      setPdfFiles(prevFiles => [...prevFiles, ...selectedFiles]);
      const fileUrl = URL.createObjectURL(selectedFiles[0]);
      setPreviewUrl(fileUrl);
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
    const files = Array.from(e.dataTransfer.files).filter(file => file.type === 'application/pdf');
    if (files.length > 0) {
      setPdfFiles(prevFiles => [...prevFiles, ...files]);
      const fileUrl = URL.createObjectURL(files[0]);
      setPreviewUrl(fileUrl);
    }
  };

  const clearAllFiles = () => {
    setPdfFiles([]);
    setMergedPdfUrl(null);
    setPreviewUrl(null);
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
    const newFiles = pdfFiles.filter((_, i) => i !== index);
    setPdfFiles(newFiles);
    if (newFiles.length > 0 && index === 0) {
      const fileUrl = URL.createObjectURL(newFiles[0]);
      setPreviewUrl(fileUrl);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={styles.mainContainer}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>PDF Merger</h1>
          <p style={styles.headerSubtitle}>Combine multiple PDF files into one document</p>
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
                      onClick={clearAllFiles} 
                      style={styles.secondaryButton}
                    >
                      Clear All
                    </button>
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
                      setPreview={() => {
                        const fileUrl = URL.createObjectURL(file);
                        setPreviewUrl(fileUrl);
                      }}
                    />
                  ))}
                </div>
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
                {mergedPdfUrl && (
                  <a 
                    href={mergedPdfUrl} 
                    download="merged-document.pdf" 
                    style={styles.downloadButton}
                  >
                    Download
                  </a>
                )}
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
      </div>
    </DndProvider>
  );
};

const FileItem = ({ file, index, moveFile, removeFile, setPreview }) => {
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
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
        cursor: 'pointer'
      }}
      onClick={setPreview}
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
          onClick={(e) => {
            e.stopPropagation();
            removeFile(index);
          }}
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
    '@media (max-width: 1024px)': {
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
  filesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    flex: '1',
    display: 'flex',
    flexDirection: 'column'
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
    color: '#1e293b',
    margin: '0'
  },
  actionButtons: {
    display: 'flex',
    gap: '15px'
  },
  primaryButton: {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    border: 'none',
    '&:disabled': {
      backgroundColor: '#c7d2fe',
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      backgroundColor: '#4338ca'
    }
  },
  secondaryButton: {
    padding: '12px 24px',
    backgroundColor: 'transparent',
    color: '#4f46e5',
    border: '1px solid #4f46e5',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'all 0.2s',
    '&:disabled': {
      color: '#c7d2fe',
      borderColor: '#c7d2fe',
      cursor: 'not-allowed'
    },
    '&:hover:not(:disabled)': {
      backgroundColor: '#f5f3ff'
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
    gap: '10px',
    flex: '1',
    overflowY: 'auto',
    maxHeight: '500px',
    paddingRight: '10px'
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '15px',
    transition: 'all 0.2s ease',
    border: '1px solid #e2e8f0',
    '&:hover': {
      backgroundColor: '#f8fafc'
    }
  },
  fileInfo: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    flex: '1',
    minWidth: '0'
  },
  fileIcon: {
    width: '24px',
    height: '24px',
    color: '#4f46e5',
    flexShrink: '0'
  },
  fileName: {
    fontWeight: '500',
    margin: '0',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  fileSize: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '3px 0 0 0'
  },
  fileActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  fileIndex: {
    backgroundColor: '#e0e7ff',
    color: '#4f46e5',
    width: '28px',
    height: '28px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '0.9rem',
    fontWeight: '600',
    flexShrink: '0'
  },
  removeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '5px',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
    flexShrink: '0',
    '&:hover': {
      backgroundColor: '#fee2e2'
    }
  },
  removeIcon: {
    width: '20px',
    height: '20px',
    color: '#ef4444'
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

export default PDFMerger;