import React, { useRef, useEffect, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = 'SwiftPDF/pdf.worker.min.mjs';

const PdfToImage = () => {
  const [pdfUrl, setPdfUrl] = useState(null);
  const [imageSrc, setImageSrc] = useState('');
  const [pageNum, setPageNum] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const canvasRef = useRef(null);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      const fileUrl = URL.createObjectURL(file);
      setPdfUrl(fileUrl);
    } else {
      alert('Please select a valid PDF file.');
    }
  };

  const handlePageChange = (event) => {
    const page = parseInt(event.target.value, 10);
    if (page >= 1 && page <= totalPages) {
      setPageNum(page);
    }
  };

  useEffect(() => {
    const loadPdf = async () => {
      if (!pdfUrl) return;

      try {
        const loadingTask = pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        setTotalPages(pdf.numPages); // Set the total number of pages

        // Render the selected page
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

        // Convert canvas to image
        setImageSrc(canvas.toDataURL());
      } catch (error) {
        console.error('Error loading or rendering PDF:', error);
      }
    };

    loadPdf();
  }, [pdfUrl, pageNum]); // Re-render when PDF URL or pageNum changes

  return (
    <div style={{display: 'flex',alignItems: 'center',justifyContent: 'center',height:'700px'}}>
      <div style={styles.container}>
      <h2 style={{ marginBottom: '20px' }}>PDF to Image Converter</h2>
      <input type="file" accept="application/pdf" onChange={handleFileChange} style={styles.input} />
      {pdfUrl && (
        <div style={styles.pdfInfo}>
          <div style={styles.pageControl}>
            <label htmlFor="pageNumber">Page:</label>
            <input
              id="pageNumber"
              type="number"
              min="1"
              max={totalPages}
              value={pageNum}
              onChange={handlePageChange}
              style={styles.pageInput}
            />
            <span>/ {totalPages}</span>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      {imageSrc ? (
        <div style={styles.imageContainer}>
          <img src={imageSrc} alt="PDF as Image" style={{ maxWidth: '400px' }} />
          <a href={imageSrc} download={`pdf-page-${pageNum}.png`} style={{marginTop: '-70px'}}>
            <button style={styles.downloadButton}>Download Page {pageNum}</button>
          </a>
        </div>
      ) : (
        <p>Loading PDF...</p>
      )}
      </div>
      <div style={styles.previewContainer}>
        <h3 style={styles.previewTitle}>PDF Preview</h3>
        {pdfUrl ? (
          <object
            data={pdfUrl}
            type="application/pdf"
            width="100%"
            height="88%"
          >
            <p>Alternative text - include a link <a href={pdfUrl}>to the PDF</a>!</p>
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
    justifyContent: 'center',
    padding: '20px',
    fontFamily: 'Arial, sans-serif',
    maxWidth: '600px',
    marginRight: '30px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    overflow: 'hidden',
    paddingTop : '10px',
  },
  input: {
    marginBottom: '0px',
    marginTop: '-10px',
  },
  pdfInfo: {
    marginBottom: '5px',
    textAlign: 'center',
  },
  imageContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '10px',
    border: '1px solid #ddd',
    borderRadius: '10px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
  },
  downloadButton: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: '#fff',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  pageControl: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginTop: '10px',
  },
  pageInput: {
    width: '50px',
    padding: '5px',
    textAlign: 'center',
    border: '1px solid #ddd',
    borderRadius: '5px',
  },
  previewContainer: {
    width: '450px',
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
  }
}

export default PdfToImage;
