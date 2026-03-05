import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { decryptNLockFile } from '@notion-lock/file-format';
import { sanitizeHtml } from '@notion-lock/security';
import { extractZip, findMainHtml } from '@notion-lock/zip';
import { renderInSandbox, resolveAssets } from '@notion-lock/renderer';
import { Card, FileUpload, PasswordInput, ActionButton, ErrorMessage } from '@notion-lock/ui';
import { notionTheme } from '@notion-lock/ui';

function Viewer() {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDecrypted, setIsDecrypted] = useState(false);

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

      const textDecoder = new TextDecoder();
      const text = textDecoder.decode(decrypted);

      if (text.includes('<html') || text.includes('<!DOCTYPE')) {
        const sanitized = sanitizeHtml(text);
        renderInSandbox(sanitized, 'content-container');
      } else if (decrypted[0] === 0x50 && decrypted[1] === 0x4b) {
        const files = await extractZip(decrypted);
        const mainHtmlFile = findMainHtml(files);

        if (!mainHtmlFile) {
          setError('Could not find HTML file in archive');
          setIsProcessing(false);
          return;
        }

        const htmlData = files.get(mainHtmlFile);
        if (!htmlData) {
          setError('Failed to extract HTML file');
          setIsProcessing(false);
          return;
        }

        let html = new TextDecoder().decode(htmlData);
        html = resolveAssets(html, files);
        html = sanitizeHtml(html);

        renderInSandbox(html, 'content-container');
      } else {
        setError('Unknown file format');
        setIsProcessing(false);
        return;
      }

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

  if (isDecrypted) {
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
          }}
        >
          <button
            onClick={() => setIsDecrypted(false)}
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
        </div>
        <div
          id="content-container"
          style={{
            flex: 1,
            overflow: 'auto',
            backgroundColor: notionTheme.colors.background,
          }}
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
      <Card title="Viewer">
        <div style={{ display: 'flex', flexDirection: 'column', gap: notionTheme.spacing.md }}>
          <FileUpload
            onFileSelect={handleFileSelect}
            accept=".nlock"
            label={file ? `Selected: ${file.name}` : 'Drop encrypted file here or click to upload'}
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
    <Viewer />
  </React.StrictMode>
);
