import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";
import "./shader.css";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = "/SwiftPDF/pdf.worker.min.mjs";

export default function PDFProcessor() {
  const [processedPdf, setProcessedPdf] = useState(null);
  const [loading, setLoading] = useState(false);
  const [contrast,setContrast] = useState(140);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file && contrast >= 0 && contrast < 256) {
      setLoading(true);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfBytes = new Uint8Array(e.target.result);
        const processedBytes = await processPDF(pdfBytes);
        setProcessedPdf(URL.createObjectURL(new Blob([processedBytes], { type: "application/pdf" })));
        setLoading(false);
      };
      reader.readAsArrayBuffer(file);
    }
    else{
        alert("Check contrast");
    }
  };

  const handleContrastChange = (event) => {
    setContrast(event.target.value);
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
      newPage.drawImage(img, { x: 0, y: 0, width: viewport.width, height: viewport.height });
    }

    return newPdf.save();
  };

  const inputStyle = {
    display: "block",
    width: "fit-content",
    margin: "15px auto 10px",
    padding: "8px",
    fontSize: "16px",
    borderRadius: "4px",
    marginBottom: "10px",
    outline: "none",
    transition: "border-color 0.3s",
  };

  return (
    <div className="container">
      <div className="card">
        <h2>PDF Shader Removal</h2>
        <input id="contrast-input" type="number" value={contrast} onChange={handleContrastChange} min="0" max="300" step="10" style={inputStyle} onFocus={(e) => (e.target.style.borderColor = inputFocusStyle.borderColor)} onBlur={(e) => (e.target.style.borderColor = "#28a745")}/>
        <label htmlFor="pdf-upload" className="upload-btn">
          Upload PDF
          <input id="pdf-upload" type="file" accept="application/pdf" onChange={handleFileChange} />
        </label>

        {loading && <p className="loading">Processing PDF...</p>}

        {processedPdf && (
          <a href={processedPdf} download="processed.pdf" className="download-btn">
            Download Processed PDF
          </a>
        )}
      </div>
    </div>
  );
}