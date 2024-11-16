import React, { useState } from 'react';
import { PDFDocument } from 'pdf-lib';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const PDFMerger = () => {
  const [pdfFiles, setPdfFiles] = useState([]);
  const [mergedPdfUrl, setMergedPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

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

  const moveFile = (dragIndex, hoverIndex) => {
    const newPdfFiles = [...pdfFiles];
    const [draggedFile] = newPdfFiles.splice(dragIndex, 1);
    newPdfFiles.splice(hoverIndex, 0, draggedFile);
    setPdfFiles(newPdfFiles);
  };

  const reverseFiles = () => {
    setPdfFiles((prevFiles) => [...prevFiles].reverse());
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={{display: 'flex', gap: '20px', alignItems: 'center'}}>
        <div style={styles.container}>
          <h2 style={styles.title}>PDF Merger</h2>
          <label style={styles.uploadLabel}>
            Select PDF Files
            <input type="file" multiple accept="application/pdf" onChange={handleFileChange} style={styles.fileInput} />
          </label>
          <button onClick={mergePDFs} style={styles.mergeButton} disabled={pdfFiles.length < 2}>
            Merge PDFs
          </button>
          {isLoading && <p style={styles.loadingText}>Merging PDFs, please wait...</p>}
          {mergedPdfUrl && (
            <div style={styles.downloadContainer}>
              <h3 style={styles.downloadTitle}>Merged PDF Ready</h3>
              <a href={mergedPdfUrl} download="merged.pdf" style={styles.downloadLink}>
                Download Merged PDF
              </a>
            </div>
          )}
        </div>
        <div style={styles.container1}>
          <div style={styles.fileList}>
            {pdfFiles.length!=0?pdfFiles.map((file, index) => (
              <FileItem key={file.name} file={file} index={index} moveFile={moveFile} />
            )):<div style={{marginTop:'60px'}}>No Files Selected</div>}
          </div>
          <button onClick={reverseFiles} style={styles.reverseButton} disabled={pdfFiles.length < 2}>
            Reverse Order
          </button>
        </div>
      </div>
    </DndProvider>
  );
};

const FileItem = ({ file, index, moveFile }) => {
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
      }}
    >
      <span>{index + 1}. {file.name}</span>
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
    height: '200px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    border: '1px solid #ccc',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
  },
  container1: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    width: '500px',
    minHeight: '200px',
    margin: '0 auto',
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
  fileList: {
    width: '100%',
    marginBottom: '20px',
  },
  fileItem: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    margin: '5px 0',
    padding: '5px 10px',
    backgroundColor: '#f9f9f9',
    color: 'black',
    borderRadius: '5px',
    border: '1px solid #ddd',
  },
  mergeButton: {
    padding: '10px 20px',
    backgroundColor: '#28A745',
    color: '#fff',
    borderRadius: '5px',
    border: 'none',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '10px',
  },
  loadingText: {
    fontSize: '16px',
    color: '#555',
  },
  downloadContainer: {
    textAlign: 'center',
    marginTop: '20px',
  },
  downloadTitle: {
    fontSize: '18px',
    color: '#333',
    marginBottom: '10px',
  },
  downloadLink: {
    textDecoration: 'none',
    padding: '10px 20px',
    backgroundColor: '#28A745',
    color: '#fff',
    borderRadius: '5px',
    fontSize: '16px',
    cursor: 'pointer',
  },
};

export default PDFMerger;
