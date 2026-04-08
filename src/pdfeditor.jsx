import React, { useState, useRef, useEffect, useCallback } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { PDFDocument } from 'pdf-lib';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/SwiftPDF/pdf.worker.min.mjs';

const TOOLS = { SELECT: 'select', ERASER: 'eraser', TEXT: 'text' };

const PDFEditor = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfDoc, setPdfDoc] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [tool, setTool] = useState(TOOLS.ERASER);
  const [eraserSize, setEraserSize] = useState(20);
  const [textInput, setTextInput] = useState('');
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [textColor, setTextColor] = useState('#000000');
  const [annotations, setAnnotations] = useState({});
  const [isDrawing, setIsDrawing] = useState(false);
  const [textPos, setTextPos] = useState(null);
  const [status, setStatus] = useState('');
  // Select / drag state
  const [selectedIdx, setSelectedIdx] = useState(null);
  const dragRef = useRef(null); // { idx, offsetX, offsetY }

  const baseCanvasRef = useRef(null);
  const drawCanvasRef = useRef(null);
  const containerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const pageAnnotationsRef = useRef([]);

  const fonts = ['Arial', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana'];

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setAnnotations({});
    setCurrentPage(1);
    setSelectedIdx(null);
    const arrayBuffer = await file.arrayBuffer();
    const doc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(doc);
    setTotalPages(doc.numPages);
  };

  const renderPage = useCallback(async (doc, pageNum) => {
    if (!doc) return;
    if (renderTaskRef.current) renderTaskRef.current.cancel();
    const page = await doc.getPage(pageNum);
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const drawCanvas = drawCanvasRef.current;
    drawCanvas.width = viewport.width;
    drawCanvas.height = viewport.height;
    const ctx = canvas.getContext('2d');
    const task = page.render({ canvasContext: ctx, viewport });
    renderTaskRef.current = task;
    try {
      await task.promise;
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error(e);
      return;
    }
    redrawAnnotations(pageNum);
  }, []);

  useEffect(() => {
    if (pdfDoc) renderPage(pdfDoc, currentPage);
  }, [pdfDoc, currentPage, renderPage]);

  // Redraw whenever annotations or selectedIdx changes
  useEffect(() => {
    redrawAnnotations(currentPage);
  }, [annotations, selectedIdx, currentPage]);

  useEffect(() => {
    pageAnnotationsRef.current = annotations[currentPage] || [];
  }, [annotations, currentPage]);

  const redrawAnnotations = (pageNum) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const pageAnns = annotations[pageNum] || [];
    pageAnns.forEach((ann, idx) => {
      drawAnnotation(ctx, ann);
      // Draw selection highlight for text annotations
      if (ann.type === 'text' && idx === selectedIdx) {
        ctx.save();
        ctx.font = `${ann.fontSize}px ${ann.fontFamily}`;
        const metrics = ctx.measureText(ann.text);
        const w = metrics.width + 10;
        const h = ann.fontSize + 10;
        ctx.strokeStyle = '#4f46e5';
        ctx.lineWidth = 1.5;
        ctx.setLineDash([5, 3]);
        ctx.strokeRect(ann.x - 5, ann.y - ann.fontSize - 2, w, h);
        // small drag handle dot
        ctx.fillStyle = '#4f46e5';
        ctx.beginPath();
        ctx.arc(ann.x - 5, ann.y - ann.fontSize - 2, 5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }
    });
  };

  const drawAnnotation = (ctx, ann) => {
    if (ann.type === 'erase') {
      ctx.save();
      ctx.fillStyle = '#ffffff';
      ann.points.forEach(([x, y]) => {
        ctx.beginPath();
        ctx.arc(x, y, ann.size / 2, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.restore();
    } else if (ann.type === 'text') {
      ctx.save();
      ctx.font = `${ann.fontSize}px ${ann.fontFamily}`;
      ctx.fillStyle = ann.color;
      ctx.fillText(ann.text, ann.x, ann.y);
      ctx.restore();
    }
  };

  const getPos = (e) => {
    const canvas = drawCanvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return [
      (e.clientX - rect.left) * scaleX,
      (e.clientY - rect.top) * scaleY,
    ];
  };

  // Hit-test: find topmost text annotation under (x, y)
  const hitTestText = (x, y) => {
    const canvas = drawCanvasRef.current;
    const ctx = canvas.getContext('2d');
    const anns = annotations[currentPage] || [];
    for (let i = anns.length - 1; i >= 0; i--) {
      const ann = anns[i];
      if (ann.type !== 'text') continue;
      ctx.font = `${ann.fontSize}px ${ann.fontFamily}`;
      const w = ctx.measureText(ann.text).width + 10;
      const h = ann.fontSize + 10;
      const bx = ann.x - 5;
      const by = ann.y - ann.fontSize - 2;
      if (x >= bx && x <= bx + w && y >= by && y <= by + h) return i;
    }
    return null;
  };

  const handleMouseDown = (e) => {
    const [x, y] = getPos(e);

    if (tool === TOOLS.SELECT) {
      const hit = hitTestText(x, y);
      if (hit !== null) {
        const ann = (annotations[currentPage] || [])[hit];
        setSelectedIdx(hit);
        dragRef.current = { idx: hit, offsetX: x - ann.x, offsetY: y - ann.y };
      } else {
        setSelectedIdx(null);
        dragRef.current = null;
      }
      return;
    }

    if (tool === TOOLS.TEXT) {
      setTextPos({ x, y });
      return;
    }

    if (tool === TOOLS.ERASER) {
      setIsDrawing(true);
      const newAnn = { type: 'erase', points: [[x, y]], size: eraserSize };
      pageAnnotationsRef.current = [...pageAnnotationsRef.current, newAnn];
      setAnnotations(prev => ({ ...prev, [currentPage]: [...pageAnnotationsRef.current] }));
    }
  };

  const handleMouseMove = (e) => {
    const [x, y] = getPos(e);

    // Dragging a text annotation
    if (tool === TOOLS.SELECT && dragRef.current) {
      const { idx, offsetX, offsetY } = dragRef.current;
      setAnnotations(prev => {
        const pageAnns = [...(prev[currentPage] || [])];
        pageAnns[idx] = { ...pageAnns[idx], x: x - offsetX, y: y - offsetY };
        return { ...prev, [currentPage]: pageAnns };
      });
      return;
    }

    if (!isDrawing || tool !== TOOLS.ERASER) return;
    const anns = pageAnnotationsRef.current;
    const last = anns[anns.length - 1];
    if (!last || last.type !== 'erase') return;
    last.points.push([x, y]);
    const ctx = drawCanvasRef.current.getContext('2d');
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(x, y, eraserSize / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const handleMouseUp = () => {
    dragRef.current = null;
    if (isDrawing) {
      setIsDrawing(false);
      setAnnotations(prev => ({ ...prev, [currentPage]: [...pageAnnotationsRef.current] }));
    }
  };

  const handleAddText = () => {
    if (!textPos || !textInput.trim()) return;
    const ann = { type: 'text', x: textPos.x, y: textPos.y, text: textInput, fontSize, fontFamily, color: textColor };
    const updated = [...(annotations[currentPage] || []), ann];
    setAnnotations(prev => ({ ...prev, [currentPage]: updated }));
    setTextPos(null);
    setTextInput('');
  };

  const handleDeleteSelected = () => {
    if (selectedIdx === null) return;
    setAnnotations(prev => {
      const pageAnns = (prev[currentPage] || []).filter((_, i) => i !== selectedIdx);
      return { ...prev, [currentPage]: pageAnns };
    });
    setSelectedIdx(null);
  };

  const clearPage = () => {
    setAnnotations(prev => ({ ...prev, [currentPage]: [] }));
    setSelectedIdx(null);
  };

  const getCursor = () => {
    if (tool === TOOLS.SELECT) return selectedIdx !== null || dragRef.current ? 'grab' : 'default';
    if (tool === TOOLS.ERASER) return `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${eraserSize}' height='${eraserSize}'%3E%3Ccircle cx='${eraserSize/2}' cy='${eraserSize/2}' r='${eraserSize/2-1}' fill='white' stroke='%23999' stroke-width='1'/%3E%3C/svg%3E") ${eraserSize/2} ${eraserSize/2}, crosshair`;
    if (tool === TOOLS.TEXT) return 'text';
    return 'default';
  };

  const handleExport = async () => {
    if (!pdfDoc || !pdfFile) return;
    setStatus('Exporting...');
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const libDoc = await PDFDocument.load(arrayBuffer);
      const pages = libDoc.getPages();

      for (let i = 0; i < totalPages; i++) {
        const pageNum = i + 1;
        const pageAnns = annotations[pageNum];
        if (!pageAnns || pageAnns.length === 0) continue;

        const pjsPage = await pdfDoc.getPage(pageNum);
        const viewport = pjsPage.getViewport({ scale: 1.5 });
        const offscreen = document.createElement('canvas');
        offscreen.width = viewport.width;
        offscreen.height = viewport.height;
        const ctx = offscreen.getContext('2d');
        await pjsPage.render({ canvasContext: ctx, viewport }).promise;
        pageAnns.forEach(ann => drawAnnotation(ctx, ann));

        const imgData = offscreen.toDataURL('image/png');
        const pngBytes = await fetch(imgData).then(r => r.arrayBuffer());
        const pngImage = await libDoc.embedPng(pngBytes);
        const libPage = pages[i];
        const { width, height } = libPage.getSize();
        libPage.drawImage(pngImage, { x: 0, y: 0, width, height });
      }

      const pdfBytes = await libDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `edited-${pdfFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('Exported successfully.');
    } catch (err) {
      console.error(err);
      setStatus('Export failed: ' + err.message);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>PDF Editor</h1>
        <p style={s.subtitle}>Erase content and add text annotations, then export</p>
      </div>

      <div style={s.layout}>
        <div style={s.panel}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Upload PDF</h3>
            <label style={s.uploadBtn}>
              Choose File
              <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {pdfFile && <p style={s.fileInfo}>{pdfFile.name} &nbsp;·&nbsp; {totalPages} pages</p>}
          </div>

          {pdfDoc && (
            <>
              <div style={s.card}>
                <h3 style={s.cardTitle}>Tool</h3>
                <div style={s.toolRow}>
                  {[TOOLS.SELECT, TOOLS.ERASER, TOOLS.TEXT].map(t => (
                    <button
                      key={t}
                      style={{ ...s.toolBtn, ...(tool === t ? s.toolBtnActive : {}) }}
                      onClick={() => { setTool(t); setTextPos(null); if (t !== TOOLS.SELECT) setSelectedIdx(null); }}
                    >
                      {t === TOOLS.SELECT ? '↖ Move' : t === TOOLS.ERASER ? '🧹 Erase' : '✏️ Text'}
                    </button>
                  ))}
                </div>

                {tool === TOOLS.SELECT && (
                  <div>
                    <p style={s.hint}>Click a text to select it, then drag to move.</p>
                    {selectedIdx !== null && (
                      <button style={s.deleteBtn} onClick={handleDeleteSelected}>🗑 Delete Selected</button>
                    )}
                  </div>
                )}

                {tool === TOOLS.ERASER && (
                  <div style={s.optionRow}>
                    <label style={s.label}>Size: {eraserSize}px</label>
                    <input type="range" min="5" max="80" value={eraserSize}
                      onChange={e => setEraserSize(Number(e.target.value))} style={s.range} />
                  </div>
                )}

                {tool === TOOLS.TEXT && (
                  <div style={s.textOptions}>
                    <div style={s.optionRow}>
                      <label style={s.label}>Font</label>
                      <select value={fontFamily} onChange={e => setFontFamily(e.target.value)} style={s.select}>
                        {fonts.map(f => <option key={f} value={f}>{f}</option>)}
                      </select>
                    </div>
                    <div style={s.optionRow}>
                      <label style={s.label}>Size: {fontSize}px</label>
                      <input type="range" min="8" max="72" value={fontSize}
                        onChange={e => setFontSize(Number(e.target.value))} style={s.range} />
                    </div>
                    <div style={s.optionRow}>
                      <label style={s.label}>Color</label>
                      <input type="color" value={textColor} onChange={e => setTextColor(e.target.value)} style={s.colorPicker} />
                    </div>
                    <textarea
                      placeholder="Type text here, then click on the PDF..."
                      value={textInput}
                      onChange={e => setTextInput(e.target.value)}
                      style={s.textarea}
                      rows={3}
                    />
                    {textPos && (
                      <div style={s.placementInfo}>
                        📍 Position set — click "Place Text"
                        <button style={s.placeBtn} onClick={handleAddText}>Place Text</button>
                        <button style={s.cancelBtn} onClick={() => setTextPos(null)}>Cancel</button>
                      </div>
                    )}
                    {!textPos && <p style={s.hint}>Click on the PDF canvas to place text</p>}
                  </div>
                )}
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>Page Navigation</h3>
                <div style={s.pageNav}>
                  <button style={s.navBtn} onClick={() => { setCurrentPage(p => Math.max(1, p - 1)); setSelectedIdx(null); }} disabled={currentPage === 1}>‹ Prev</button>
                  <span style={s.pageInfo}>{currentPage} / {totalPages}</span>
                  <button style={s.navBtn} onClick={() => { setCurrentPage(p => Math.min(totalPages, p + 1)); setSelectedIdx(null); }} disabled={currentPage === totalPages}>Next ›</button>
                </div>
              </div>

              <div style={s.card}>
                <h3 style={s.cardTitle}>Actions</h3>
                <button style={s.clearBtn} onClick={clearPage}>Clear This Page</button>
                <button style={s.exportBtn} onClick={handleExport}>⬇ Export PDF</button>
                {status && <p style={s.status}>{status}</p>}
              </div>
            </>
          )}
        </div>

        <div style={s.canvasArea} ref={containerRef}>
          {!pdfDoc ? (
            <div style={s.empty}>
              <span style={s.emptyIcon}>📄</span>
              <p>Upload a PDF to start editing</p>
            </div>
          ) : (
            <div style={{ position: 'relative', display: 'inline-block' }}>
              <canvas ref={baseCanvasRef} style={s.baseCanvas} />
              <canvas
                ref={drawCanvasRef}
                style={{ ...s.drawCanvas, cursor: getCursor() }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const s = {
  container: { maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '30px' },
  title: { fontSize: '2.2rem', fontWeight: '700', background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  subtitle: { color: '#64748b', marginTop: '8px' },
  layout: { display: 'flex', gap: '24px', alignItems: 'flex-start' },
  panel: { width: '280px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: '0 0 14px 0' },
  uploadBtn: { display: 'block', padding: '10px 16px', backgroundColor: '#4f46e5', color: '#fff', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontWeight: '500', fontSize: '0.95rem' },
  fileInfo: { marginTop: '10px', fontSize: '0.85rem', color: '#64748b', wordBreak: 'break-all' },
  toolRow: { display: 'flex', gap: '6px', marginBottom: '14px' },
  toolBtn: { flex: 1, padding: '7px 4px', border: '2px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', backgroundColor: '#f8fafc', fontSize: '0.78rem', fontWeight: '500', color: '#475569' },
  toolBtnActive: { borderColor: '#4f46e5', backgroundColor: '#eef2ff', color: '#4f46e5' },
  optionRow: { marginBottom: '10px' },
  label: { display: 'block', fontSize: '0.82rem', color: '#64748b', marginBottom: '4px', fontWeight: '500' },
  range: { width: '100%' },
  select: { width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem' },
  colorPicker: { width: '48px', height: '32px', border: 'none', cursor: 'pointer', borderRadius: '4px' },
  textarea: { width: '100%', padding: '8px', border: '1px solid #e2e8f0', borderRadius: '6px', fontSize: '0.9rem', resize: 'vertical', boxSizing: 'border-box' },
  textOptions: { display: 'flex', flexDirection: 'column', gap: '4px' },
  hint: { fontSize: '0.8rem', color: '#94a3b8', margin: '4px 0 0 0' },
  placementInfo: { fontSize: '0.85rem', color: '#4f46e5', display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' },
  placeBtn: { padding: '7px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500' },
  cancelBtn: { padding: '7px', backgroundColor: '#f1f5f9', color: '#475569', border: 'none', borderRadius: '6px', cursor: 'pointer' },
  deleteBtn: { width: '100%', padding: '8px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.85rem', marginTop: '8px' },
  pageNav: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' },
  navBtn: { padding: '8px 14px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: '500', fontSize: '0.9rem' },
  pageInfo: { fontSize: '0.95rem', fontWeight: '600', color: '#1e293b' },
  clearBtn: { display: 'block', width: '100%', padding: '9px', backgroundColor: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca', borderRadius: '8px', cursor: 'pointer', fontWeight: '500', marginBottom: '10px' },
  exportBtn: { display: 'block', width: '100%', padding: '10px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem' },
  status: { marginTop: '8px', fontSize: '0.85rem', color: '#64748b', textAlign: 'center' },
  canvasArea: { flex: 1, backgroundColor: '#f1f5f9', borderRadius: '12px', padding: '20px', minHeight: '600px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflow: 'auto' },
  baseCanvas: { display: 'block', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '4px' },
  drawCanvas: { position: 'absolute', top: 0, left: 0, borderRadius: '4px' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', gap: '12px', minHeight: '400px' },
  emptyIcon: { fontSize: '3rem' },
};

export default PDFEditor;
