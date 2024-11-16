import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import PDFMerger from './mergepdf';
import PDFSplitter from './splitpdf';
import Dashboard from './dashboard';

function App() {
  return (
    <div>
      <Router>
        <Routes>
          <Route path="/SwiftPDF/merger" element={<PDFMerger />} />
          <Route path="/SwiftPDF/splitter" element={<PDFSplitter />} />
          <Route path="/SwiftPDF/" element={<Dashboard/>}/>
        </Routes>
      </Router>
      </div>
  );
}

export default App;
