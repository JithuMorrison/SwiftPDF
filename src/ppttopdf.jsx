import React, { useState } from 'react';

const PPTtoPDF = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [isConverting, setIsConverting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [fileName, setFileName] = useState('');

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const validTypes = [
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ];
      
      if (!validTypes.includes(file.type) && !file.name.match(/\.(ppt|pptx)$/i)) {
        setErrorMessage('Please upload a valid .ppt or .pptx file');
        setSelectedFile(null);
        setFileName('');
        return;
      }
      
      if (file.size > 10 * 1024 * 1024) {
        setErrorMessage('File size must be less than 10 MB');
        setSelectedFile(null);
        setFileName('');
        return;
      }
      
      setSelectedFile(file);
      setFileName(file.name);
      setErrorMessage('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setErrorMessage('Please select a file first');
      return;
    }

    setIsConverting(true);
    setErrorMessage('');

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('https://trauma-chi.vercel.app/convert/ppt-to-pdf', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Conversion failed');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName.replace(/\.[^/.]+$/, '')}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error:', error);
      setErrorMessage(error.message || 'Conversion failed. Please try again.');
    } finally {
      setIsConverting(false);
    }
  };

  // Main container styles
  const mainContainer = {
    maxWidth: '1400px',
    margin: '0 auto',
    padding: '30px 20px',
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
    color: '#333'
  };

  // Header styles
  const header = {
    textAlign: 'center',
    marginBottom: '40px'
  };

  const headerTitle = {
    fontSize: '2.5rem',
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: '10px',
    background: 'linear-gradient(90deg, #4f46e5, #7c3aed)',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent'
  };

  const headerSubtitle = {
    fontSize: '1.1rem',
    color: '#64748b',
    fontWeight: '400'
  };

  // Content layout
  const contentWrapper = {
    display: 'flex',
    gap: '30px'
  };

  // Controls column
  const controlsColumn = {
    flex: '1',
    minWidth: '0',
    display: 'flex',
    flexDirection: 'column',
    gap: '25px'
  };

  // Preview column
  const previewColumn = {
    width: '500px'
  };

  // Upload container
  const uploadContainer = {
    border: '2px dashed #e0e0e0',
    borderRadius: '12px',
    padding: '40px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    ':hover': {
      borderColor: '#4f46e5',
      backgroundColor: '#f8f9fa'
    }
  };

  const uploadContent = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '15px'
  };

  const uploadIcon = {
    width: '60px',
    height: '60px',
    color: '#4f46e5',
    marginBottom: '10px'
  };

  const uploadText = {
    fontSize: '1.1rem',
    color: '#555',
    margin: '0'
  };

  const uploadButton = {
    display: 'inline-block',
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '6px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    ':hover': {
      backgroundColor: '#4338ca'
    }
  };

  const fileTypeHint = {
    fontSize: '0.9rem',
    color: '#888',
    margin: '0'
  };

  // Apply button
  const applyButton = {
    padding: '12px 24px',
    backgroundColor: '#4f46e5',
    color: 'white',
    borderRadius: '8px',
    fontWeight: '500',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.2s',
    border: 'none',
    ':disabled': {
      backgroundColor: '#c7d2fe',
      cursor: 'not-allowed'
    },
    ':hover:not(:disabled)': {
      backgroundColor: '#4338ca'
    }
  };

  const buttonLoading = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  };

  const spinner = {
    display: 'inline-block',
    width: '16px',
    height: '16px',
    border: '2px solid rgba(255,255,255,0.3)',
    borderRadius: '50%',
    borderTopColor: 'white',
    animation: 'spin 1s ease-in-out infinite'
  };

  // Error message
  const errorMessageStyle = {
    marginTop: '12px',
    color: '#e53e3e',
    fontSize: '0.9rem',
    fontWeight: '500'
  };

  // Preview container
  const previewContainer = {
    backgroundColor: '#ffffff',
    borderRadius: '12px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
    border: '1px solid #e2e8f0',
    height: '100%',
    display: 'flex',
    flexDirection: 'column'
  };

  const previewHeader = {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    padding: '20px',
    borderBottom: '1px solid #e2e8f0'
  };

  const previewIcon = {
    width: '28px',
    height: '28px',
    color: '#4f46e5'
  };

  const previewTitle = {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#1e293b',
    margin: '0',
    flex: '1'
  };

  const previewContent = {
    flex: '1',
    padding: '20px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '500px'
  };

  // Empty preview
  const emptyPreview = {
    textAlign: 'center',
    color: '#64748b',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px'
  };

  const emptyIcon = {
    width: '60px',
    height: '60px',
    color: '#cbd5e1',
    marginBottom: '10px'
  };

  const emptyText = {
    fontSize: '1.1rem',
    fontWeight: '500',
    color: '#475569',
    margin: '0'
  };

  const emptyHint = {
    fontSize: '0.9rem',
    margin: '0'
  };

  return (
    <div style={mainContainer}>
      <header style={header}>
        <h1 style={headerTitle}>PowerPoint to PDF Converter</h1>
        <p style={headerSubtitle}>
          Convert your presentations to PDF with one click
        </p>
      </header>

      <div style={contentWrapper}>
        <div style={controlsColumn}>
          <div style={uploadContainer}>
            <div style={uploadContent}>
              <svg
                style={uploadIcon}
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
                <p style={uploadText}>{fileName}</p>
              ) : (
                <p style={uploadText}>Drag & drop your PowerPoint file here</p>
              )}
              <label style={uploadButton}>
                Browse Files
                <input
                  id="ppt-file-input"
                  type="file"
                  accept=".ppt,.pptx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              <p style={fileTypeHint}>.ppt or .pptx files only (max 10MB)</p>
              {errorMessage && <p style={errorMessageStyle}>{errorMessage}</p>}
            </div>
          </div>

          <button
            style={applyButton}
            onClick={handleUpload}
            disabled={isConverting || !selectedFile}
          >
            {isConverting ? (
              <span style={buttonLoading}>
                <span style={spinner}></span>
                Converting...
              </span>
            ) : (
              'Convert to PDF'
            )}
          </button>
        </div>

        <div style={previewColumn}>
          <div style={previewContainer}>
            <div style={previewHeader}>
              <svg
                style={previewIcon}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <h3 style={previewTitle}>Conversion Info</h3>
            </div>
            <div style={previewContent}>
              <div style={emptyPreview}>
                <svg
                  style={emptyIcon}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                <p style={emptyText}>
                  {selectedFile 
                    ? `Ready to convert "${fileName}" to PDF`
                    : 'No file selected'}
                </p>
                <p style={emptyHint}>
                  {selectedFile
                    ? 'Click the convert button to start'
                    : 'Upload a PowerPoint file to begin'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        @media (max-width: 1024px) {
          .content-wrapper {
            flex-direction: column;
          }
          .preview-column {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default PPTtoPDF;