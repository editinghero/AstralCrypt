import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { decryptNLockFile } from '@notion-lock/file-format';
import { Card, FileUpload, PasswordInput, ActionButton, ErrorMessage } from '@notion-lock/ui';
import { notionTheme } from '@notion-lock/ui';

function PdfViewer() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
  };

  const handleDecrypt = async () => {
    if (!file || !password) {
      setError('Please select a file and enter a password');
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      const fileData = await file.arrayBuffer();
      const uint8Array = new Uint8Array(fileData);

      const decrypted = await decryptNLockFile(uint8Array, password);

      if (!decrypted) {
        setError('Incorrect password or corrupted file');
        setIsProcessing(false);
        return;
      }

      // Check if it's a PDF file
      if (decrypted.length < 5) {
        setError('This is not a valid PDF file');
        setIsProcessing(false);
        return;
      }

      const header = new TextDecoder().decode(decrypted.slice(0, 5));
      if (!header.startsWith('%PDF-')) {
        setError('This is not a PDF file. Please use the general Viewer for other file types.');
        setIsProcessing(false);
        return;
      }

      // Create blob URL for the PDF
      const blob = new Blob([decrypted], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      setIsDecrypted(true);
      setFile(null);
      setPassword('');
    } catch (err) {
      setError('Decryption failed. Please try again');
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isDecrypted && pdfUrl) {
    return (
      <div
        style={{
          width: '100%',
          height: '100vh',
          backgroundColor: notionTheme.colors.background,
          display: 'flex',
          flexDirection: 'column',
          fontFamily: notionTheme.fonts.primary,
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        }}
      >
        <div
          style={{
            padding: notionTheme.spacing.lg,
            borderBottom: `1px solid ${notionTheme.colors.border}`,
            display: 'flex',
            gap: notionTheme.spacing.md,
            alignItems: 'center',
          }}
        >
          <button
            onClick={() => {
              setIsDecrypted(false);
              setPdfUrl(null);
              if (pdfUrl) {
                URL.revokeObjectURL(pdfUrl);
              }
            }}
            style={{
              padding: `${notionTheme.spacing.sm} ${notionTheme.spacing.md}`,
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: 'none',
              borderRadius: notionTheme.borderRadius.md,
              cursor: 'pointer',
              fontFamily: notionTheme.fonts.primary,
            }}
          >
            Back
          </button>
          <span style={{ color: notionTheme.colors.text, fontWeight: 600 }}>
            PDF Viewer
          </span>
        </div>
        <iframe
          src={pdfUrl}
          style={{
            flex: 1,
            border: 'none',
            width: '100%',
          }}
          title="PDF Document"
        />
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        height: '100vh',
        backgroundColor: notionTheme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: notionTheme.spacing.lg,
        fontFamily: notionTheme.fonts.primary,
        margin: 0,
        boxSizing: 'border-box',
      }}
    >
      <Card title="PDF Viewer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: notionTheme.spacing.md }}>
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".nlock"
            label={file ? `Selected: ${file.name}` : 'Drop encrypted PDF file here or click to upload'}
          />

          <PasswordInput
            value={password}
            onChange={setPassword}
            placeholder="Enter password"
            disabled={isProcessing}
          />

          {error && <ErrorMessage message={error} onDismiss={() => setError(null)} />}

          <ActionButton
            onClick={handleDecrypt}
            loading={isProcessing}
            disabled={!file || !password || isProcessing}
          >
            Decrypt & View
          </ActionButton>
        </div>
      </Card>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PdfViewer />
  </React.StrictMode>
);