import React, { useState } from 'react';
import './App.css';
import PDFSplitter from './splitpdf';
import PDFMerger from './mergepdf';

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