import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ImageToPDF = () => {
  const [imageFiles, setImageFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setImageFiles(selectedFiles);
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
    const files = Array.from(e.dataTransfer.files).filter(file => 
      file.type === "image/png" || file.type === "image/jpeg"
    );
    if (files.length) {
      setImageFiles(files);
    }
  };

  const moveFile = (dragIndex, hoverIndex) => {
    const updatedFiles = [...imageFiles];
    const [draggedFile] = updatedFiles.splice(dragIndex, 1);
    updatedFiles.splice(hoverIndex, 0, draggedFile);
    setImageFiles(updatedFiles);
  };

  const removeFile = (index) => {
    setImageFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
  };

  const generatePDF = async () => {
    if (imageFiles.length === 0) return;
    
    setIsLoading(true);
    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of imageFiles) {
        const imageBytes = await file.arrayBuffer();
        const extension = file.type.split("/")[1];

        let pdfImage;
        if (extension === "png") {
          pdfImage = await pdfDoc.embedPng(imageBytes);
        } else if (["jpeg", "jpg"].includes(extension)) {
          pdfImage = await pdfDoc.embedJpg(imageBytes);
        } else {
          continue;
        }

        const page = pdfDoc.addPage([pdfImage.width, pdfImage.height]);
        page.drawImage(pdfImage, {
          x: 0,
          y: 0,
          width: pdfImage.width,
          height: pdfImage.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: "application/pdf" });
      setPdfUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error("Error generating PDF:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={styles.mainContainer}>
        <div style={styles.header}>
          <h1 style={styles.headerTitle}>Image to PDF Converter</h1>
          <p style={styles.headerSubtitle}>Transform your images into a professional PDF document</p>
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
                  <path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />
                </svg>
                <p style={styles.uploadText}>Drag & drop images here or</p>
                <label style={styles.uploadButton}>
                  Browse Images
                  <input 
                    type="file" 
                    multiple 
                    accept="image/png, image/jpeg" 
                    onChange={handleFileChange} 
                    style={styles.fileInput} 
                  />
                </label>
                <p style={styles.fileTypeHint}>Only PNG and JPG files are accepted</p>
              </div>
            </div>

            <button 
              onClick={generatePDF} 
              style={styles.generateButton}
              disabled={imageFiles.length === 0 || isLoading}
            >
              {isLoading ? (
                <span style={styles.buttonLoading}>
                  <span style={styles.spinner}></span>
                  Generating...
                </span>
              ) : 'Generate PDF'}
            </button>

            {pdfUrl && (
              <div style={styles.resultCard}>
                <svg style={styles.successIcon} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M12 2C6.5 2 2 6.5 2 12S6.5 22 12 22 22 17.5 22 12 17.5 2 12 2M10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" />
                </svg>
                <h3 style={styles.resultTitle}>PDF Generated Successfully!</h3>
                <a 
                  href={pdfUrl} 
                  download="images.pdf" 
                  style={styles.downloadButton}
                >
                  Download PDF
                </a>
              </div>
            )}
          </div>

          <div style={styles.previewColumn}>
            <div style={styles.imagesContainer}>
              <div style={styles.sectionHeader}>
                <svg style={styles.imagesIcon} viewBox="0 0 24 24">
                  <path fill="currentColor" d="M8.5,13.5L11,16.5L14.5,12L19,18H5M21,19V5C21,3.89 20.1,3 19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19Z" />
                </svg>
                <h3 style={styles.sectionTitle}>Selected Images ({imageFiles.length})</h3>
              </div>
              
              <div style={styles.imagesList}>
                {imageFiles.length === 0 ? (
                  <div style={styles.emptyState}>
                    <svg style={styles.emptyIcon} viewBox="0 0 24 24">
                      <path fill="currentColor" d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
                    </svg>
                    <p style={styles.emptyText}>No images selected</p>
                    <p style={styles.emptyHint}>Upload images to preview them here</p>
                  </div>
                ) : (
                  imageFiles.map((file, index) => (
                    <DraggableImage
                      key={`${file.name}-${index}`}
                      file={file}
                      index={index}
                      moveFile={moveFile}
                      removeFile={removeFile}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DndProvider>
  );
};

const DraggableImage = ({ file, index, moveFile, removeFile }) => {
  const ref = React.useRef(null);

  const [, drop] = useDrop({
    accept: "image",
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
    type: "image",
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
        ...styles.imageItem,
        opacity: isDragging ? 0.5 : 1,
        transform: isDragging ? 'scale(1.02)' : 'scale(1)',
        boxShadow: isDragging ? '0 4px 12px rgba(0,0,0,0.15)' : 'none'
      }}
    >
      <div style={styles.imagePreviewContainer}>
        <img
          src={URL.createObjectURL(file)}
          alt="Selected"
          style={styles.imagePreview}
        />
      </div>
      <div style={styles.imageInfo}>
        <p style={styles.imageName}>{file.name}</p>
        <p style={styles.imageSize}>{(file.size / 1024).toFixed(2)} KB</p>
      </div>
      <div style={styles.imageActions}>
        <span style={styles.imageIndex}>{index + 1}</span>
        <button 
          onClick={() => removeFile(index)}
          style={styles.removeButton}
          aria-label="Remove image"
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
  generateButton: {
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
  resultCard: {
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
  imagesContainer: {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    padding: '25px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px'
  },
  imagesIcon: {
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
  imagesList: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
    overflowY: 'auto',
    paddingRight: '10px'
  },
  emptyState: {
    flex: '1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#64748b',
    textAlign: 'center',
    padding: '40px 20px'
  },
  emptyIcon: {
    width: '60px',
    height: '60px',
    color: '#cbd5e1',
    marginBottom: '15px'
  },
  emptyText: {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#475569',
    margin: '0 0 5px 0'
  },
  emptyHint: {
    fontSize: '0.9rem',
    margin: '0'
  },
  imageItem: {
    display: 'flex',
    alignItems: 'center',
    backgroundColor: '#ffffff',
    borderRadius: '8px',
    padding: '15px',
    transition: 'all 0.2s ease',
    border: '1px solid #e2e8f0',
    gap: '15px'
  },
  imagePreviewContainer: {
    width: '60px',
    height: '60px',
    flexShrink: '0'
  },
  imagePreview: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
    borderRadius: '4px'
  },
  imageInfo: {
    flex: '1',
    minWidth: '0'
  },
  imageName: {
    fontWeight: '500',
    margin: '0',
    color: '#1e293b',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis'
  },
  imageSize: {
    fontSize: '0.8rem',
    color: '#64748b',
    margin: '3px 0 0 0'
  },
  imageActions: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px'
  },
  imageIndex: {
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
  }
};

export default ImageToPDF;