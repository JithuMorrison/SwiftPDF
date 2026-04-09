import React, { useState } from 'react';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';

const PDFEncrypt = () => {
  const [pdfFile, setPdfFile] = useState(null);
  const [userPassword, setUserPassword] = useState('');
  const [ownerPassword, setOwnerPassword] = useState('');
  const [useOwner, setUseOwner] = useState(false);
  const [showUser, setShowUser] = useState(false);
  const [showOwner, setShowOwner] = useState(false);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) { setPdfFile(file); setStatus(''); }
  };

  const handleEncrypt = async () => {
    if (!pdfFile) { setStatus('Please select a PDF file.'); return; }
    if (!userPassword.trim()) { setStatus('Please enter a password.'); return; }
    setLoading(true);
    setStatus('');
    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const pdfBytes = new Uint8Array(arrayBuffer);
      const owner = useOwner && ownerPassword.trim() ? ownerPassword : userPassword;
      const encryptedBytes = await encryptPDF(pdfBytes, userPassword, owner);
      const blob = new Blob([encryptedBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `protected-${pdfFile.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setStatus('✅ PDF encrypted and downloaded successfully.');
    } catch (err) {
      console.error(err);
      setStatus('❌ Encryption failed: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={s.container}>
      <div style={s.header}>
        <h1 style={s.title}>PDF Encrypt</h1>
        <p style={s.subtitle}>Password-protect your PDF with RC4 128-bit encryption</p>
      </div>

      <div style={s.center}>
        <div style={s.card}>
          {/* Upload */}
          <div style={s.section}>
            <label style={s.sectionLabel}>PDF File</label>
            <label style={s.uploadBtn}>
              {pdfFile ? '📄 ' + pdfFile.name : '📂 Choose PDF'}
              <input type="file" accept="application/pdf" onChange={handleFileChange} style={{ display: 'none' }} />
            </label>
            {pdfFile && (
              <p style={s.fileInfo}>{(pdfFile.size / 1024 / 1024).toFixed(2)} MB</p>
            )}
          </div>

          {/* User password */}
          <div style={s.section}>
            <label style={s.sectionLabel}>Open Password</label>
            <p style={s.hint}>Required to open the PDF</p>
            <div style={s.inputRow}>
              <input
                type={showUser ? 'text' : 'password'}
                placeholder="Enter password..."
                value={userPassword}
                onChange={e => setUserPassword(e.target.value)}
                style={s.input}
              />
              <button style={s.eyeBtn} onClick={() => setShowUser(v => !v)}>{showUser ? '🙈' : '👁'}</button>
            </div>
          </div>

          {/* Owner password toggle */}
          <div style={s.section}>
            <label style={s.checkRow}>
              <input type="checkbox" checked={useOwner} onChange={e => setUseOwner(e.target.checked)} />
              <span style={s.checkLabel}>Set separate owner (permissions) password</span>
            </label>
            {useOwner && (
              <>
                <p style={s.hint}>Owner can change permissions; user can only view</p>
                <div style={s.inputRow}>
                  <input
                    type={showOwner ? 'text' : 'password'}
                    placeholder="Owner password..."
                    value={ownerPassword}
                    onChange={e => setOwnerPassword(e.target.value)}
                    style={s.input}
                  />
                  <button style={s.eyeBtn} onClick={() => setShowOwner(v => !v)}>{showOwner ? '🙈' : '👁'}</button>
                </div>
              </>
            )}
          </div>

          <button
            style={{ ...s.encryptBtn, opacity: loading ? 0.7 : 1 }}
            onClick={handleEncrypt}
            disabled={loading}
          >
            {loading ? 'Encrypting...' : '🔒 Encrypt & Download'}
          </button>

          {status && (
            <p style={{ ...s.status, color: status.startsWith('✅') ? '#16a34a' : '#dc2626' }}>
              {status}
            </p>
          )}

          <div style={s.infoBox}>
            <p style={s.infoText}>🔐 RC4 128-bit encryption — compatible with all PDF readers</p>
            <p style={s.infoText}>🔒 Processing is 100% local — your file never leaves your device</p>
          </div>
        </div>
      </div>
    </div>
  );
};

const s = {
  container: { maxWidth: '1200px', margin: '0 auto', padding: '30px 20px', fontFamily: "'Inter', sans-serif" },
  header: { textAlign: 'center', marginBottom: '36px' },
  title: { fontSize: '2.2rem', fontWeight: '700', background: 'linear-gradient(90deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0 },
  subtitle: { color: '#64748b', marginTop: '8px' },
  center: { display: 'flex', justifyContent: 'center' },
  card: { backgroundColor: '#fff', borderRadius: '16px', padding: '32px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', border: '1px solid #e2e8f0', width: '100%', maxWidth: '480px', display: 'flex', flexDirection: 'column', gap: '24px' },
  section: { display: 'flex', flexDirection: 'column', gap: '6px' },
  sectionLabel: { fontSize: '0.9rem', fontWeight: '600', color: '#1e293b' },
  hint: { fontSize: '0.8rem', color: '#94a3b8', margin: 0 },
  uploadBtn: { display: 'block', padding: '12px 16px', backgroundColor: '#f8fafc', border: '2px dashed #cbd5e1', borderRadius: '8px', cursor: 'pointer', textAlign: 'center', fontSize: '0.9rem', color: '#475569', fontWeight: '500', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
  fileInfo: { fontSize: '0.8rem', color: '#94a3b8', margin: 0 },
  inputRow: { display: 'flex', gap: '8px', alignItems: 'center' },
  input: { flex: 1, padding: '10px 14px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '0.95rem', outline: 'none' },
  eyeBtn: { padding: '10px', border: '1px solid #e2e8f0', borderRadius: '8px', backgroundColor: '#f8fafc', cursor: 'pointer', fontSize: '1rem' },
  checkRow: { display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#475569' },
  checkLabel: { fontWeight: '500' },
  encryptBtn: { padding: '13px', backgroundColor: '#4f46e5', color: '#fff', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '600', fontSize: '1rem', transition: 'background 0.2s' },
  status: { textAlign: 'center', fontSize: '0.9rem', fontWeight: '500', margin: 0 },
  infoBox: { backgroundColor: '#f8fafc', borderRadius: '8px', padding: '14px', display: 'flex', flexDirection: 'column', gap: '6px', border: '1px solid #e2e8f0' },
  infoText: { fontSize: '0.8rem', color: '#64748b', margin: 0 },
};

export default PDFEncrypt;
