import React, { useState } from "react";
import { PDFDocument } from "pdf-lib";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const ImageToPDF = () => {
  const [imageFiles, setImageFiles] = useState([]);
  const [pdfUrl, setPdfUrl] = useState(null);

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    setImageFiles(selectedFiles);
  };

  const moveFile = (dragIndex, hoverIndex) => {
    const updatedFiles = [...imageFiles];
    const [draggedFile] = updatedFiles.splice(dragIndex, 1);
    updatedFiles.splice(hoverIndex, 0, draggedFile);
    setImageFiles(updatedFiles);
  };

  const generatePDF = async () => {
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
        alert("Unsupported file format: " + file.name);
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
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div style={styles.mainContainer}>
        <div style={styles.leftPanel}>
          <h2 style={{color: 'white'}}>Image to PDF Converter</h2>
          <label style={styles.uploadLabel}>
            Select Images
            <input
              type="file"
              multiple
              accept="image/png, image/jpeg"
              onChange={handleFileChange}
              style={styles.fileInput}
            />
          </label>
          <button
            onClick={generatePDF}
            disabled={imageFiles.length === 0}
            style={styles.generateButton}
          >
            Generate PDF
          </button>
          {pdfUrl && (
            <a href={pdfUrl} download="images.pdf" style={styles.downloadLink}>
              Download PDF
            </a>
          )}
        </div>
        <div style={styles.rightPanel}>
          {imageFiles.length === 0 ? (
            <p>No images selected</p>
          ) : (
            imageFiles.map((file, index) => (
              <DraggableImage
                key={file.name}
                file={file}
                index={index}
                moveFile={moveFile}
              />
            ))
          )}
        </div>
      </div>
    </DndProvider>
  );
};

const DraggableImage = ({ file, index, moveFile }) => {
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
      }}
    >
      <img
        src={URL.createObjectURL(file)}
        alt="Selected"
        style={styles.imagePreview}
      />
      <span style={{color: 'black'}}>{file.name}</span>
    </div>
  );
};

const styles = {
  mainContainer: {
    display: "flex",
    gap: "20px",
    padding: "20px",
    fontFamily: "Arial, sans-serif",
  },
  leftPanel: {
    flex: 1,
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
  },
  uploadLabel: {
    display: "block",
    padding: "10px 15px",
    backgroundColor: "#007BFF",
    color: "#fff",
    borderRadius: "5px",
    cursor: "pointer",
    marginBottom: "15px",
    textAlign: "center",
  },
  fileInput: {
    display: "none",
  },
  generateButton: {
    padding: "10px 15px",
    backgroundColor: "#28A745",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  downloadLink: {
    display: "block",
    marginTop: "10px",
    textDecoration: "none",
    color: "#fff",
    backgroundColor: "#17A2B8",
    padding: "10px 15px",
    borderRadius: "5px",
    textAlign: "center",
  },
  rightPanel: {
    flex: 1,
    padding: "20px",
    border: "1px solid #ccc",
    borderRadius: "8px",
    boxShadow: "0 2px 5px rgba(0,0,0,0.1)",
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  imageItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    backgroundColor: "#f9f9f9",
  },
  imagePreview: {
    width: "50px",
    height: "50px",
    objectFit: "cover",
    borderRadius: "5px",
  },
};

export default ImageToPDF;
