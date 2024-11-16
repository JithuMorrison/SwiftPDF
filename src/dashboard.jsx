import React from 'react';

function Dashboard() {
  return (
    <div style={styles.container}>
        <h1 style={styles.title}>PDF Tools</h1>
        <div style={styles.cardContainer}>
          <div style={styles.card}>
            <h2>Merge PDFs</h2>
            <p>Combine multiple PDFs into one.</p>
            <button style={styles.button}>
              <a href="/SwiftPDF/merger" style={styles.buttonText}>Go to Merger</a>
            </button>
          </div>
          <div style={styles.card}>
            <h2>Split PDFs</h2>
            <p>Split a single PDF into multiple parts.</p>
            <button style={styles.button}>
              <a href="/SwiftPDF/splitter" style={styles.buttonText}>Go to Splitter</a>
            </button>
          </div>
        </div>
      </div>
  );
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

export default Dashboard;
