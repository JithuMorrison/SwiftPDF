import { useState, useEffect, useRef, useCallback } from 'react';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = '/SwiftPDF/pdf.worker.min.mjs';

const FONTS = [
  { label: 'Helvetica', value: StandardFonts.Helvetica },
  { label: 'Helvetica Bold', value: StandardFonts.HelveticaBold },
  { label: 'Helvetica Oblique', value: StandardFonts.HelveticaOblique },
  { label: 'Times Roman', value: StandardFonts.TimesRoman },
  { label: 'Times Bold', value: StandardFonts.TimesRomanBold },
  { label: 'Times Italic', value: StandardFonts.TimesRomanItalic },
  { label: 'Courier', value: StandardFonts.Courier },
  { label: 'Courier Bold', value: StandardFonts.CourierBold },
];

const POSITIONS = [
  { label: 'Center (diagonal)', value: 'center' },
  { label: 'Tiled (repeat)', value: 'tiled' },
  { label: 'Top Left', value: 'top-left' },
  { label: 'Top Right', value: 'top-right' },
  { label: 'Bottom Left', value: 'bottom-left' },
  { label: 'Bottom Right', value: 'bottom-right' },
];

const hexToRgb = (hex) => rgb(
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255
);

const computeAnchor = (pos, pageW, pageH, W, H, ang, margin, tileGap) => {
  const rad = (ang * Math.PI) / 180;
  const cosA = Math.cos(rad);
  const sinA = Math.sin(rad);

  // 4 corners of text bounding box relative to anchor after rotation
  const pts = [
    { x: 0,           y: 0 },
    { x: W * cosA,    y: W * sinA },
    { x: -H * sinA,   y: H * cosA },
    { x: W*cosA - H*sinA, y: W*sinA + H*cosA },
  ];
  const minX = Math.min(...pts.map(p => p.x));
  const maxX = Math.max(...pts.map(p => p.x));
  const minY = Math.min(...pts.map(p => p.y));
  const maxY = Math.max(...pts.map(p => p.y));

  switch (pos) {
    case 'center':
      return [{ x: pageW/2 - (minX+maxX)/2, y: pageH/2 - (minY+maxY)/2 }];
    case 'top-left':
      // visual top-left of box → (margin, pageH-margin)
      return [{ x: margin - minX, y: (pageH - margin) - maxY }];
    case 'top-right':
      // visual top-right of box → (pageW-margin, pageH-margin)
      return [{ x: (pageW - margin) - maxX, y: (pageH - margin) - maxY }];
    case 'bottom-left':
      // visual bottom-left of box → (margin, margin)
      return [{ x: margin - minX, y: margin - minY }];
    case 'bottom-right':
      // visual bottom-right of box → (pageW-margin, margin)
      return [{ x: (pageW - margin) - maxX, y: margin - minY }];
    case 'tiled': {
      const positions = [];
      for (let y = H; y < pageH + tileGap; y += tileGap)
        for (let x = 0; x < pageW + tileGap; x += tileGap)
          positions.push({ x, y });
      return positions;
    }
    default:
      return [{ x: pageW/2, y: pageH/2 }];
  }
};

const PDFWatermark = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [watermarkText, setWatermarkText] = useState('CONFIDENTIAL');
  const [fontSize, setFontSize] = useState(60);
  const [color, setColor] = useState('#c0c0c0');
  const [opacity, setOpacity] = useState(0.3);
  const [angle, setAngle] = useState(45);
  const [fontChoice, setFontChoice] = useState(StandardFonts.HelveticaBold);
  const [position, setPosition] = useState('center');
  const [tileGap, setTileGap] = useState(200);
  const [applyToPages, setApplyToPages] = useState('all');
  const [pageRange, setPageRange] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewCanvasRef = useRef(null);
  const debounceRef = useRef(null);
  const renderTaskRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPdfFile(file);
    setStatus('');
    const ab = await file.arrayBuffer();
    const doc = await PDFDocument.load(ab);
    setTotalPages(doc.getPageCount());
  };

  const generatePreview = useCallback(async (file, wText, fSize, col, opac, ang, fnt, pos, tGap) => {
    if (!file || !wText.trim()) return;
    setPreviewLoading(true);
    try {
      const ab = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(ab);
      const font = await pdfDoc.embedFont(fnt);
      const textWidth = font.widthOfTextAtSize(wText, fSize);
      const page = pdfDoc.getPage(0);
      const { width, height } = page.getSize();
      const positions = computeAnchor(pos, width, height, textWidth, fSize, ang, 40, tGap);
      for (const p of positions) {
        page.drawText(wText, { x: p.x, y: p.y, size: fSize, font, color: hexToRgb(col), opacity: opac, rotate: degrees(ang) });
      }
      const pdfBytes = await pdfDoc.save();
      const pjsDoc = await pdfjsLib.getDocument({ data: pdfBytes }).promise;
      const pjsPage = await pjsDoc.getPage(1);
      const viewport = pjsPage.getViewport({ scale: 1.5 });
      const canvas = previewCanvasRef.current;
      if (!canvas) return;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      if (renderTaskRef.current) renderTaskRef.current.cancel();
      const task = pjsPage.render({ canvasContext: canvas.getContext('2d'), viewport });
      renderTaskRef.current = task;
      await task.promise;
    } catch (e) {
      if (e?.name !== 'RenderingCancelledException') console.error(e);
    } finally {
      setPreviewLoading(false);
    }
  }, [previewCanvasRef]);

  useEffect(() => {
    if (!pdfFile) return;
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      generatePreview(pdfFile, watermarkText, fontSize, color, opacity, angle, fontChoice, position, tileGap);
    }, 600);
    return () => clearTimeout(debounceRef.current);
  }, [pdfFile, watermarkText, fontSize, color, opacity, angle, fontChoice, position, tileGap, generatePreview]);

  const parsePageRange = (rangeStr, total) => {
    const pages = new Set();
    for (const part of rangeStr.split(',')) {
      const t = part.trim();
      if (t.includes('-')) {
        const [s, e] = t.split('-').map(Number);
        for (let i = s; i <= Math.min(e, total); i++) pages.add(i - 1);
      } else {
        const n = Number(t);
        if (n >= 1 && n <= total) pages.add(n - 1);
      }
    }
    return [...pages];
  };

  const applyWatermark = async (returnBytes = false) => {
    if (!pdfFile || !watermarkText.trim()) return null;
    const ab = await pdfFile.arrayBuffer();
    const pdfDoc = await PDFDocument.load(ab);
    const font = await pdfDoc.embedFont(fontChoice);
    const textWidth = font.widthOfTextAtSize(watermarkText, fontSize);
    const pageCount = pdfDoc.getPageCount();
    const targetPages = applyToPages === 'all'
      ? Array.from({ length: pageCount }, (_, i) => i)
      : parsePageRange(pageRange, pageCount);

    for (const idx of targetPages) {
      const page = pdfDoc.getPage(idx);
      const { width, height } = page.getSize();
      const positions = computeAnchor(position, width, height, textWidth, fontSize, angle, 40, tileGap);
      for (const pos of positions) {
        page.drawText(watermarkText, { x: pos.x, y: pos.y, size: fontSize, font, color: hexToRgb(color), opacity, rotate: degrees(angle) });
      }
    }

    const pdfBytes = await pdfDoc.save();
    if (returnBytes) return pdfBytes;
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `watermarked-${pdfFile.name}`;
    a.click();
    URL.revokeObjectURL(url);
    return null;
  };

  const handleDownload = async () => {
    if (!pdfFile) { setStatus('Please select a PDF file.'); return; }
    if (!watermarkText.trim()) { setStatus('Please enter watermark text.'); return; }
    setLoading(true);
    setStatus('');
    try {
      await applyWatermark(false);
      setStatus('✅ Watermarked PDF downloaded.');
    } catch (err) {
      console.error(err);
      setStatus('❌ Failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      <div style={s.header}>
        <h1 style={s.title}>PDF Watermark</h1>
        <p style={s.subtitle}>Add custom text watermarks to your PDF pages</p>
      </div>

      <div style={s.layout}>
        <div style={s.panel}>
          <div style={s.card}>
            <h3 style={s.cardTitle}>Upload PDF</h3>
            <label style={s.uploadBtn}>
              {pdfFile ? '📄 ' + pdfFile.name : '📂 Choose PDF'}
              <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {pdfFile && <p style={s.fileInfo}>{totalPages} pages · {(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>}
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Watermark Text</h3>
            <input type="text" value={watermarkText} onChange={e => setWatermarkText(e.target.value)} placeholder="e.g. CONFIDENTIAL" style={s.input} />
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Style</h3>
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Font</label>
                <select value={fontChoice} onChange={e => setFontChoice(e.target.value)} style={s.select}>
                  {FONTS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Color</label>
                <div style={s.colorRow}>
                  <input type="color" value={color} onChange={e => setColor(e.target.value)} style={s.colorPicker} />
                  <span style={s.colorHex}>{color.toUpperCase()}</span>
                </div>
              </div>
              <div style={s.field}>
                <label style={s.label}>Font Size: {fontSize}pt</label>
                <input type="range" min="10" max="200" value={fontSize} onChange={e => setFontSize(Number(e.target.value))} style={s.range} />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.field}>
                <label style={s.label}>Opacity: {Math.round(opacity * 100)}%</label>
                <input type="range" min="0.05" max="1" step="0.05" value={opacity} onChange={e => setOpacity(Number(e.target.value))} style={s.range} />
              </div>
              <div style={s.field}>
                <label style={s.label}>Angle: {angle}°</label>
                <input type="range" min="-180" max="180" value={angle} onChange={e => setAngle(Number(e.target.value))} style={s.range} />
              </div>
            </div>
          </div>

          <div style={s.card}>
            <h3 style={s.cardTitle}>Position</h3>
            <select value={position} onChange={e => setPosition(e.target.value)} style={s.select}>
              {POSITIONS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
            {position === 'tiled' && (
              <div style={{ marginTop: '12px' }}>
                <label style={s.label}>Tile Spacing: {tileGap}pt</label>
                <input type="range" min="80" max="400" value={tileGap} onChange={e => setTileGap(Number(e.target.value))} style={s.range} />
              </div>
            )}
          </div>

          {pdfFile && (
            <div style={s.card}>
              <h3 style={s.cardTitle}>Apply To</h3>
              <div style={s.radioGroup}>
                <label style={s.radioLabel}><input type="radio" value="all" checked={applyToPages === 'all'} onChange={() => setApplyToPages('all')} /> All pages</label>
                <label style={s.radioLabel}><input type="radio" value="range" checked={applyToPages === 'range'} onChange={() => setApplyToPages('range')} /> Page range</label>
              </div>
              {applyToPages === 'range' && (
                <>
                  <input type="text" placeholder={`e.g. 1-3, 5, 7  (total: ${totalPages})`} value={pageRange} onChange={e => setPageRange(e.target.value)} style={{ ...s.input, marginTop: '8px' }} />
                  <p style={s.hint}>Comma-separated pages or ranges</p>
                </>
              )}
            </div>
          )}

          <button style={{ ...s.downloadBtn, opacity: loading ? 0.7 : 1 }} onClick={handleDownload} disabled={loading || !pdfFile}>
            {loading ? 'Processing...' : '⬇ Download Watermarked PDF'}
          </button>
          {status && <p style={{ ...s.status, color: status.startsWith('✅') ? '#16a34a' : '#dc2626' }}>{status}</p>}
        </div>

        <div style={s.previewPanel}>
          <div style={s.previewHeader}>
            <h3 style={s.previewTitle}>Watermark Preview</h3>
            {previewLoading && <span style={s.previewNote}>Rendering...</span>}
          </div>
          <div style={s.previewContent}>
            {!pdfFile ? (
              <div style={s.empty}>
                <span style={{ fontSize: '3rem' }}>📄</span>
                <p>Upload a PDF to preview</p>
              </div>
            ) : (
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <canvas ref={previewCanvasRef} style={s.previewCanvas} />
                {previewLoading && (
                  <div style={s.previewOverlay}>
                    <span style={s.spinner} />
                  </div>
                )}
              </div>
            )}
          </div>
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
  panel: { width: '320px', flexShrink: 0, display: 'flex', flexDirection: 'column', gap: '16px' },
  card: { backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', border: '1px solid #e2e8f0' },
  cardTitle: { fontSize: '0.95rem', fontWeight: '600', color: '#1e293b', margin: '0 0 14px 0' },
  uploadBtn: { display: 'block', padding: '11px 14px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: '0.88rem', color: '#475569', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileInfo: { marginTop: '8px', fontSize: '0.8rem', color: '#94a3b8' },
  input: { width: '100%', padding: '9px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.9rem', boxSizing: 'border-box', outline: 'none' },
  row: { display: 'flex', gap: '12px', marginBottom: '12px' },
  field: { flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' },
  label: { fontSize: '0.78rem', fontWeight: '500', color: '#64748b' },
  select: { padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.88rem', width: '100%' },
  range: { width: '100%', accentColor: '#4f46e5' },
  colorRow: { display: 'flex', alignItems: 'center', gap: '8px' },
  colorPicker: { width: '40px', height: '32px', border: 'none', cursor: 'pointer', borderRadius: '4px', padding: 0 },
  colorHex: { fontSize: '0.82rem', color: '#475569', fontFamily: 'monospace' },
  radioGroup: { display: 'flex', gap: '16px', marginBottom: '4px' },
  radioLabel: { display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: '#475569', cursor: 'pointer' },
  hint: { fontSize: '0.78rem', color: '#94a3b8', margin: '4px 0 0 0' },
  downloadBtn: { padding: '13px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '0.95rem', width: '100%' },
  status: { textAlign: 'center', fontSize: '0.88rem', fontWeight: '500', margin: 0 },
  previewPanel: { flex: 1, display: 'flex', flexDirection: 'column', gap: '16px' },
  previewHeader: { display: 'flex', alignItems: 'baseline', gap: '12px' },
  previewTitle: { fontSize: '1rem', fontWeight: '600', color: '#1e293b', margin: 0 },
  previewNote: { fontSize: '0.78rem', color: '#94a3b8', margin: 0 },
  previewContent: { backgroundColor: '#f1f5f9', borderRadius: '12px', minHeight: '600px', display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflow: 'auto', padding: '20px' },
  previewCanvas: { display: 'block', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', borderRadius: '4px', maxWidth: '100%' },
  previewOverlay: { position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '4px' },
  spinner: { width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', display: 'inline-block' },
  empty: { display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#94a3b8', gap: '8px', paddingTop: '80px' },
};

export default PDFWatermark;
