import React, { useState, useEffect, useRef } from 'react';
import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

function PdfOCRSearchWithPdfLib() {
  const [file, setFile] = useState(null);
  const [ocrText, setOcrText] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [matchedPage, setMatchedPage] = useState(null);
  const canvasRef = useRef();

  // Read the uploaded file and extract text
  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    setFile(selected);
    setOcrText([]);
    setMatchedPage(null);
  };

  // Call backend to extract OCR text from images using fetch
  const handleExtractText = async () => {
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://localhost:5000/extract-text', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setOcrText(data);
      renderPdf();
    } catch (err) {
      console.error('OCR failed:', err);
    }
  };

  // Render PDF as images using canvas and pdf.js
  // Render PDF as images using canvas and pdf.js
  const renderPdf = async () => {
    if (!file || !canvasRef.current) return; // Ensure canvasRef is available

    const fileReader = new FileReader();
    fileReader.onload = async () => {
      const pdfData = new Uint8Array(fileReader.result);
      const pdfDoc = await pdfjsLib.getDocument(pdfData).promise;
      const numPages = pdfDoc.numPages;

      // Clear existing canvas
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }

      // Get the specific page to render based on matchedPage or default to the first page
      const page = await pdfDoc.getPage(matchedPage || 1); // matchedPage or 1
      const viewport = page.getViewport({ scale: 2 }); // Increase scale for better quality

      // Set canvas size
      canvas.width = viewport.width;
      canvas.height = viewport.height;

      // Render the page to canvas
      await page.render({ canvasContext: ctx, viewport }).promise;
    };

    fileReader.readAsArrayBuffer(file);
  };

  // Handle search logic
  const handleSearch = () => {
    if (!searchQuery) return;
    const match = ocrText.find((page) =>
      page.text.toLowerCase().includes(searchQuery.toLowerCase())
    );
    if (match) {
      setMatchedPage(match.page);
    } else {
      alert('No match found!');
    }
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">PDF OCR Search with pdf-lib</h2>

      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      <button
        onClick={handleExtractText}
        disabled={!file}
        className="ml-2 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Extract Text
      </button>

      <div className="my-4">
        <input
          type="text"
          placeholder="Search for text..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border p-2 mr-2"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-green-600 text-white rounded"
        >
          Search
        </button>
      </div>

      <div className="my-4">
        {ocrText.length > 0 && (
          <div>
            <h3>Extracted Text:</h3>
            <ul>
              {ocrText.map((page, index) => (
                <li key={index}>
                  <strong>Page {page.page + 1}:</strong> {page.text}
                </li>
              ))}
            </ul>
          </div>
        )}
        {ocrText.length > 0 && matchedPage !== null && (
          <canvas ref={canvasRef} style={{ border: '1px solid #000' }} />
        )}
        {ocrText.length === 0 && (
          <p>Upload a PDF file and click "Extract Text" to start.</p>
        )}
      </div>
    </div>
  );
}

export default PdfOCRSearchWithPdfLib;