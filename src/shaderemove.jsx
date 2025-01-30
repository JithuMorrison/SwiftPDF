import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import * as pdfjsLib from "pdfjs-dist";

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = "/SwiftPDF/pdf.worker.min.mjs";

export default function PDFProcessor() {
  const [processedPdf, setProcessedPdf] = useState(null);

  const handleFileChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const pdfBytes = new Uint8Array(e.target.result);
        const processedBytes = await processPDF(pdfBytes);
        setProcessedPdf(URL.createObjectURL(new Blob([processedBytes], { type: "application/pdf" })));
      };
      reader.readAsArrayBuffer(file);
    }
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
        const newColor = avg > 140 ? 255 : 0; // Binarization
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

  return (
    <div>
      <input type="file" accept="application/pdf" onChange={handleFileChange} />
      {processedPdf && <a href={processedPdf} download="processed.pdf">Download Processed PDF</a>}
    </div>
  );
}
