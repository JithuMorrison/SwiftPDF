import React, { useState } from 'react';
import './App.css';
import PDFSplitter from './splitpdf';
import PDFMerger from './mergepdf';
import PDFToImage from './pdftoimg';
import ImageToPDF from './img2pdf';
import PDFPageRotator from './rotatepdf';
import PDFProcessor from './shaderemove';
import WordToPdf from './wordtopdf';
import ExcelToPdf from './exceltopdf';
import IpynbToPdf from './ipynbtopdf';

function App() {
  const [currentSection, setCurrentSection] = useState(0);

  const renderContent = () => {
    switch (currentSection) {
      case 1:
        return (
          <div>
            <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
              border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
              <div>Back</div>
            </button>
            <PDFMerger/>
          </div>
        );
      case 2:
        return (
          <div>
            <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
              border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
              <div>Back</div>
            </button>
            <PDFSplitter/>
          </div>
        );
      case 3:
        return (
          <div>
            <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
              border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
              <div>Back</div>
            </button>
            <PDFToImage/>
          </div>
        );
        case 4:
          return (
            <div>
              <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
                border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
                <div>Back</div>
              </button>
              <ImageToPDF/>
            </div>
          );
        case 5:
          return (
            <div>
              <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
                border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
                <div>Back</div>
              </button>
              <PDFPageRotator/>
            </div>
          );
          case 6:
            return (
              <div>
                <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
                  border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
                  <div>Back</div>
                </button>
                <PDFProcessor/>
              </div>
            );
          case 7:
            return (
              <div>
                <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
                  border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
                  <div>Back</div>
                </button>
                <WordToPdf/>
              </div>
            );
          case 8:
            return (
              <div>
                <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
                  border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
                  <div>Back</div>
                </button>
                <ExcelToPdf/>
              </div>
            );
          case 9:
            return (
              <div>
                <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
                  border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
                  <div>Back</div>
                </button>
                <IpynbToPdf/>
              </div>
            );
      default:
        return (
          <div>
            <h1 style={styles.title}>PDF Tools</h1>
            <div style={styles.cardContainer}>
              <div style={styles.card}>
                <h2>Merge PDFs</h2>
                <p>Combine multiple PDFs into one.</p>
                <button style={styles.button} onClick={() => setCurrentSection(1)}>
                  <div>Go to Merger</div>
                </button>
              </div>
              <div style={styles.card}>
                <h2>Split PDFs</h2>
                <p>Split a single PDF into multiple parts.</p>
                <button style={styles.button} onClick={() => setCurrentSection(2)}>
                  <div>Go to Splitter</div>
                </button>
              </div>
              <div style={styles.card}>
                <h2>Image from PDFs</h2>
                <p>Convert a page to image from PDF.</p>
                <button style={styles.button} onClick={() => setCurrentSection(3)}>
                  <div>Go to PDF2Img</div>
                </button>
              </div>
              <div style={styles.card}>
                <h2>Image to PDFs</h2>
                <p>Convert images to PDF.</p>
                <button style={styles.button} onClick={() => setCurrentSection(4)}>
                  <div>Go to Img2PDF</div>
                </button>
              </div>
              <div style={styles.card}>
                <h2>Rotate PDFs</h2>
                <p>Rotate selected pages.</p>
                <button style={styles.button} onClick={() => setCurrentSection(5)}>
                  <div>Go to RotatePDF</div>
                </button>
              </div>
              <div style={styles.card}>
                <h2>Shade Remover</h2>
                <p>Remove shades in pdfs.</p>
                <button style={styles.button} onClick={() => setCurrentSection(6)}>
                  <div>Go to Remover</div>
                </button>
              </div>
              <div style={styles.card}>
                <h2>Word to PDF</h2>
                <p>Convert Word to PDF</p>
                <button style={styles.button} onClick={() => setCurrentSection(7)}>
                  <div>Go to W2P</div>
                </button>
              </div>
              <div style={styles.card}>
                <h2>Excel to PDF</h2>
                <p>Convert Excel to PDF</p>
                <button style={styles.button} onClick={() => setCurrentSection(8)}>
                  <div>Go to E2P</div>
                </button>
              </div>
              <div style={styles.card}>
                <h2>Ipynb to PDF</h2>
                <p>Convert Ipynb to PDF</p>
                <button style={styles.button} onClick={() => setCurrentSection(9)}>
                  <div>Go to Ipy2P</div>
                </button>
              </div>
            </div>
          </div>
        );
    }
  };

  return <div style={styles.container}>{renderContent()}</div>;
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    marginTop: '50px',
    fontFamily: 'Arial, sans-serif',
  },
  title: {
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '40px',
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '20px',
    flexWrap: 'wrap',
  },
  card: {
    width: '200px',
    height: '300px',
    border: '1px solid #ccc',
    borderRadius: '8px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '10px',
    boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
    cursor: 'pointer',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#007BFF',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    marginTop: '10px',
  },
  buttonText: {
    textDecoration: 'none',
    color: 'white',
  },
};

export default App;
