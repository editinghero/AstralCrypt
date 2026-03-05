import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { buildNLockFile } from '@notion-lock/file-format';
import { validatePdf } from '@notion-lock/security';
import { Card, FileUpload, PasswordInput, ActionButton, ErrorMessage } from '@notion-lock/ui';
import { notionTheme } from '@notion-lock/ui';

function PdfLocker() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);

    try {
      const data = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(data);

      if (!validatePdf(uint8Array)) {
        setError('The uploaded file is not a valid PDF document');
        return;
      }

      setFile(selectedFile);
    } catch (err) {
      setError('Failed to read file');
    }
  };

  const handleEncrypt = async () => {
    if (!file || !password) {
      setError('Please select a file and enter a password');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const fileData = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileData);

      const encryptedData = await buildNLockFile(uint8Array, 'pdf', password);

      const blob = new Blob([encryptedData], { type: 'application/octet-stream' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${file.name}.nlock`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setFile(null);
      setPassword('');
    } catch (err) {
      setError('Encryption failed. Please try again');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: notionTheme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: notionTheme.spacing.xl,
        fontFamily: notionTheme.fonts.primary,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '500px',
          backgroundColor: notionTheme.colors.surface,
          border: `1px solid ${notionTheme.colors.border}`,
          borderRadius: notionTheme.borderRadius.lg,
          padding: notionTheme.spacing.xl,
          boxShadow: notionTheme.shadows.lg,
        }}
      >
        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: '28px',
            fontWeight: 700,
            margin: `0 0 ${notionTheme.spacing.lg} 0`,
          }}
        >
          PDF Locker
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: notionTheme.spacing.md }}>
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".pdf"
            label={file ? `Selected: ${file.name}` : 'Drop PDF file here or click to upload'}
          />

          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Enter password"
            disabled={isProcessing}
          />

          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          <button
            onClick={handleEncrypt}
            disabled={!file || !password || isProcessing}
            style={{
              padding: `${notionTheme.spacing.md} ${notionTheme.spacing.lg}`,
              backgroundColor: !file || !password || isProcessing ? notionTheme.colors.accent : notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: notionTheme.borderRadius.md,
              fontSize: '16px',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
              cursor: !file || !password || isProcessing ? 'not-allowed' : 'pointer',
              opacity: !file || !password || isProcessing ? 0.5 : 1,
              transition: 'all 0.3s ease',
              width: '100%',
            }}
            onMouseEnter={(e) => {
              if (!(!file || !password || isProcessing)) {
                (e.currentTarget as HTMLElement).style.backgroundColor = '#0066cc';
              }
            }}
            onMouseLeave={(e) => {
              if (!(!file || !password || isProcessing)) {
                (e.currentTarget as HTMLElement).style.backgroundColor = notionTheme.colors.primary;
              }
            }}
          >
            {isProcessing ? 'Encrypting...' : 'Encrypt & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PdfLocker />
  </React.StrictMode>
);