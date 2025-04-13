import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import "./shader.css";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = "/SwiftPDF/pdf.worker.min.mjs";

export default function PDFProcessor() {
  const [processedPdf, setProcessedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contrast, setContrast] = useState(140);
  const [fileName, setFileName] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setFileName(file.name);
      if (contrast >= 0 && contrast < 256) {
        setLoading(true);
        const reader = new FileReader();
        reader.onload = async (e) => {
          const pdfBytes = new Uint8Array(e.target.result);
          const processedBytes = await processPDF(pdfBytes);
          setProcessedPdf(
            URL.createObjectURL(
              new Blob([processedBytes], { type: "application/pdf" })
            )
          );
          setLoading(false);
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("Contrast value must be between 0 and 255");
      }
    }
  };

  const handleContrastChange = (event) => {
    setContrast(Number(event.target.value));
  };

  const processPDF = async (pdfBytes) => {
    const pdfDoc = await PDFDocument.load(pdfBytes);
    const pdf = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
    const newPdf = await PDFDocument.create();

    for (let i = 0; i < pdf.numPages; i++) {
      const page = await pdf.getPage(i + 1);
      const viewport = page.getViewport({ scale: 2 });

      // Create a canvas for rendering
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d");

      // Render the page
      const renderContext = {
        canvasContext: ctx,
        viewport: viewport,
      };
      await page.render(renderContext).promise;

      // Convert image to black and white
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      for (let j = 0; j < data.length; j += 4) {
        const avg = (data[j] + data[j + 1] + data[j + 2]) / 3;
        const newColor = avg > contrast ? 255 : 0; // Binarization
        data[j] = data[j + 1] = data[j + 2] = newColor;
      }
      ctx.putImageData(imageData, 0, 0);

      // Convert to PNG and embed in new PDF
      const imgUrl = canvas.toDataURL("image/png");
      const img = await newPdf.embedPng(imgUrl);
      const newPage = newPdf.addPage([viewport.width, viewport.height]);
      newPage.drawImage(img, {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
      });
    }

    return newPdf.save();
  };

  return (
    <div className="main-container">
      <header className="header">
        <h1 className="header-title">PDF Shader Removal</h1>
        <p className="header-subtitle">
          Upload a PDF to remove shadings and enhance contrast
        </p>
      </header>

      <div className="content-wrapper">
        <div className="controls-column">
          <div className="upload-container">
            <div className="upload-content">
              <svg
                className="upload-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              {fileName ? (
                <p className="upload-text">{fileName}</p>
              ) : (
                <p className="upload-text">Drag & drop your PDF here</p>
              )}
              <label className="upload-button">
                Browse Files
                <input
                  type="file"
                  accept="application/pdf"
                  onChange={handleFileChange}
                  className="file-input"
                />
              </label>
              <p className="file-type-hint">PDF files only</p>
            </div>
          </div>

          <div className="settings-container">
            <div className="input-group">
              <label className="input-label">Contrast Threshold</label>
              <input
                type="range"
                min="0"
                max="255"
                value={contrast}
                onChange={handleContrastChange}
                className="text-input"
              />
              <div className="input-value">{contrast}</div>
            </div>

            <button
              className="apply-button"
              disabled={!fileName || loading}
              onClick={() => document.querySelector(".file-input").click()}
            >
              {loading ? (
                <span className="button-loading">
                  <span className="spinner"></span>
                  Processing...
                </span>
              ) : (
                "Process PDF"
              )}
            </button>
          </div>

          {processedPdf && (
            <div className="result-container">
              <svg
                className="success-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <h3 className="result-title">Processing Complete!</h3>
              <a
                href={processedPdf}
                download="processed.pdf"
                className="download-button"
              >
                Download Processed PDF
              </a>
            </div>
          )}
        </div>

        <div className="preview-column">
          <div className="preview-container">
            <div className="preview-header">
              <svg
                className="preview-icon"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                />
              </svg>
              <h3 className="preview-title">PDF Preview</h3>
            </div>
            <div className="preview-content">
              {processedPdf ? (
                <iframe
                  src={processedPdf}
                  className="pdf-viewer"
                  title="PDF Preview"
                ></iframe>
              ) : (
                <div className="empty-preview">
                  <svg
                    className="empty-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z"
                    />
                  </svg>
                  <p className="empty-text">No PDF to preview</p>
                  <p className="empty-hint">
                    Upload a PDF file to see the preview here
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}