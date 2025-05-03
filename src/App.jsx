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
import PPTtoPDF from './ppttopdf';
import PdfOCRSearchWithPdfLib from './searchimgpdf';

function App() {
  const [currentSection, setCurrentSection] = useState(0);
  const [showDialog, setShowDialog] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [targetSection, setTargetSection] = useState(null);

  const correctPassword = 'Jithu'; // change as needed

  const handleButtonClick = (section) => {
    setTargetSection(section);
    setShowDialog(true);
    setPasswordInput('');
  };

  const handlePasswordSubmit = () => {
    if (passwordInput === correctPassword) {
      setCurrentSection(targetSection);
      setShowDialog(false);
    } else {
      alert('Incorrect password!');
    }
  };

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
          case 10:
            return (
              <div>
                <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
                  border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
                  <div>Back</div>
                </button>
                <PPTtoPDF/>
              </div>
            );
          case 11:
            return (
              <div>
                <button style={{position: 'absolute',top: '10px',right: '10px',padding: '10px 20px',backgroundColor: '#007BFF',color: 'white',
                  border: 'none', borderRadius: '5px',cursor: 'pointer',}} onClick={() => setCurrentSection(0)}>
                  <div>Back</div>
                </button>
                <PdfOCRSearchWithPdfLib/>
              </div>
            );
        default:
          return (
            <div style={styles.dashboardContainer}>
              {showDialog && (
                <div style={styles.passwordDialogOverlay}>
                  <div style={styles.passwordDialog}>
                    <div style={styles.passwordDialogHeader}>
                      <h3 style={styles.passwordDialogTitle}>Authentication Required</h3>
                      <p style={styles.passwordDialogSubtitle}>Please enter the password to access this tool</p>
                    </div>
                    <input
                      type="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      style={styles.passwordInput}
                      placeholder="Enter password..."
                      autoFocus
                    />
                    <div style={styles.passwordDialogButtons}>
                      <button 
                        onClick={handlePasswordSubmit} 
                        style={styles.passwordDialogPrimaryButton}
                      >
                        Continue
                      </button>
                      <button 
                        onClick={() => setShowDialog(false)} 
                        style={styles.passwordDialogSecondaryButton}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              <header style={styles.header}>
                <h1 style={styles.headerTitle}>Swift PDF</h1>
                <p style={styles.headerSubtitle}>Your complete PDF solution toolkit</p>
              </header>
              
              <div style={styles.toolsGrid}>
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>📄</div>
                  <h3 style={styles.toolTitle}>Merge PDFs</h3>
                  <p style={styles.toolDescription}>Combine multiple PDFs into one</p>
                  <button 
                    style={styles.toolButton}
                    onClick={() => setCurrentSection(1)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>✂️</div>
                  <h3 style={styles.toolTitle}>Split PDFs</h3>
                  <p style={styles.toolDescription}>Split a single PDF into multiple parts</p>
                  <button 
                    style={styles.toolButton}
                    onClick={() => setCurrentSection(2)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>🖼️</div>
                  <h3 style={styles.toolTitle}>Image from PDFs</h3>
                  <p style={styles.toolDescription}>Convert pages to images from PDF</p>
                  <button 
                    style={styles.toolButton}
                    onClick={() => setCurrentSection(3)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>📷</div>
                  <h3 style={styles.toolTitle}>Image to PDFs</h3>
                  <p style={styles.toolDescription}>Convert images into high-quality PDF</p>
                  <button 
                    style={styles.toolButton}
                    onClick={() => setCurrentSection(4)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>🔄</div>
                  <h3 style={styles.toolTitle}>Rotate PDFs</h3>
                  <p style={styles.toolDescription}>Rotate selected pages easily</p>
                  <button 
                    style={styles.toolButton}
                    onClick={() => setCurrentSection(5)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>🧹</div>
                  <h3 style={styles.toolTitle}>Shade Remover</h3>
                  <p style={styles.toolDescription}>Remove background shades from PDFs</p>
                  <button 
                    style={styles.toolButton}
                    onClick={() => setCurrentSection(6)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>📝</div>
                  <h3 style={styles.toolTitle}>Word to PDF</h3>
                  <p style={styles.toolDescription}>Convert Word documents to PDF</p>
                  <button 
                    style={styles.protectedToolButton}
                    onClick={() => handleButtonClick(7)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>📊</div>
                  <h3 style={styles.toolTitle}>Excel to PDF</h3>
                  <p style={styles.toolDescription}>Excel to PDF conversion made easy</p>
                  <button 
                    style={styles.protectedToolButton}
                    onClick={() => handleButtonClick(8)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>📓</div>
                  <h3 style={styles.toolTitle}>Ipynb to PDF</h3>
                  <p style={styles.toolDescription}>Turn notebooks into PDF files</p>
                  <button 
                    style={styles.protectedToolButton}
                    onClick={() => handleButtonClick(9)}
                  >
                    Use Tool
                  </button>
                </div>
                
                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>📑</div>
                  <h3 style={styles.toolTitle}>PPT to PDF</h3>
                  <p style={styles.toolDescription}>Turn presentations into PDF files</p>
                  <button 
                    style={styles.protectedToolButton}
                    onClick={() => handleButtonClick(10)}
                  >
                    Use Tool
                  </button>
                </div>

                <div style={styles.toolCard}>
                  <div style={styles.toolIcon}>📑</div>
                  <h3 style={styles.toolTitle}>PPT to PDF</h3>
                  <p style={styles.toolDescription}>Turn presentations into PDF files</p>
                  <button 
                    style={styles.protectedToolButton}
                    onClick={() => handleButtonClick(11)}
                  >
                    Use Tool
                  </button>
                </div>
              </div>
              
              <footer style={styles.footer}>
                <p style={styles.footerText}>© {new Date().getFullYear()} Jithu Morrison S</p>
              </footer>
            </div>
          );
      }
    };
  
    return <div style={styles.appContainer}>{renderContent()}</div>;
  }
  
  const styles = {
    appContainer: {
      minHeight: '97vh',
      backgroundColor: '#f8fafc',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    },
    dashboardContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
    },
    sectionContainer: {
      maxWidth: '1000px',
      margin: '0 auto',
      padding: '40px 20px',
      position: 'relative',
    },
    backButton: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      backgroundColor: 'transparent',
      border: 'none',
      color: '#4f46e5',
      fontSize: '1rem',
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      gap: '5px',
      fontWeight: '500',
      '&:hover': {
        textDecoration: 'underline',
      },
    },
    header: {
      textAlign: 'center',
      marginBottom: '40px',
      padding: '40px 0 20px',
    },
    headerTitle: {
      fontSize: '2.5rem',
      fontWeight: '800',
      color: '#1e293b',
      marginBottom: '-10px',
      background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      marginTop: '-45px'
    },
    headerSubtitle: {
      fontSize: '1.1rem',
      color: '#64748b',
      fontWeight: '400',
      marginBottom: '-30px'
    },
    toolsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
      gap: '25px',
      marginBottom: '40px',
    },
    toolCard: {
      backgroundColor: '#ffffff',
      borderRadius: '12px',
      padding: '25px',
      boxShadow: '0 5px 15px rgba(0, 0, 0, 0.05)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      border: '1px solid #e2e8f0',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      textAlign: 'center',
      '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 8px 25px rgba(0, 0, 0, 0.1)',
      },
    },
    toolIcon: {
      fontSize: '2.5rem',
      marginBottom: '15px',
      color: '#4f46e5',
    },
    toolTitle: {
      fontSize: '1.3rem',
      fontWeight: '600',
      marginBottom: '10px',
      color: '#1e293b',
    },
    toolDescription: {
      fontSize: '0.95rem',
      color: '#64748b',
      marginBottom: '20px',
      flexGrow: 1,
    },
    toolButton: {
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease',
      width: '100%',
      maxWidth: '200px',
      '&:hover': {
        backgroundColor: '#4338ca',
      },
    },
    protectedToolButton: {
      backgroundColor: '#10b981',
      color: 'white',
      border: 'none',
      padding: '12px 25px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '0.95rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease',
      width: '100%',
      maxWidth: '200px',
      '&:hover': {
        backgroundColor: '#059669',
      },
    },
    footer: {
      textAlign: 'center',
      padding: '20px',
      marginTop: '40px',
      borderTop: '1px solid #e2e8f0',
      color: '#64748b',
      fontSize: '0.9rem',
    },
    passwordDialogOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.7)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    },
    passwordDialog: {
      backgroundColor: 'white',
      padding: '30px',
      borderRadius: '12px',
      width: '100%',
      maxWidth: '400px',
      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.2)',
    },
    passwordDialogHeader: {
      marginBottom: '20px',
      textAlign: 'center',
    },
    passwordDialogTitle: {
      fontSize: '1.5rem',
      fontWeight: '600',
      color: '#1e293b',
      marginBottom: '5px',
    },
    passwordDialogSubtitle: {
      fontSize: '0.9rem',
      color: '#64748b',
    },
    passwordInput: {
      width: '90%',
      padding: '12px 15px',
      marginBottom: '20px',
      border: '1px solid #e2e8f0',
      borderRadius: '8px',
      fontSize: '1rem',
      '&:focus': {
        outline: 'none',
        borderColor: '#4f46e5',
        boxShadow: '0 0 0 3px rgba(79, 70, 229, 0.2)',
      },
    },
    passwordDialogButtons: {
      display: 'flex',
      justifyContent: 'center',
      gap: '15px',
    },
    passwordDialogPrimaryButton: {
      backgroundColor: '#4f46e5',
      color: 'white',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease',
      '&:hover': {
        backgroundColor: '#4338ca',
      },
    },
    passwordDialogSecondaryButton: {
      backgroundColor: '#e2e8f0',
      color: '#1e293b',
      border: 'none',
      padding: '10px 20px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '1rem',
      fontWeight: '500',
      transition: 'background-color 0.3s ease',
      '&:hover': {
        backgroundColor: '#cbd5e1',
      },
    },
  };
  
  export default App;