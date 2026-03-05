import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import { notionTheme } from '@notion-lock/ui';
import { buildNLockFile } from '@notion-lock/file-format';
import { validateHtml } from '@notion-lock/security';
import { validateZip } from '@notion-lock/zip';
import { decryptNLockFile } from '@notion-lock/file-format';
import { sanitizeHtml } from '@notion-lock/security';
import { extractZip, findMainHtml } from '@notion-lock/zip';
import { renderInSandbox } from '@notion-lock/renderer';

type Page = 'portal' | 'html-locker' | 'zip-locker' | 'pdf-locker' | 'html-viewer' | 'zip-viewer' | 'pdf-viewer';

function App() {
  const [page, setPage] = useState<Page>('portal');

  useEffect(() => {
    const updatePage = () => {
      const hash = window.location.hash.slice(1);
      const path = window.location.pathname;
      
      if (hash.includes('/viewer/html')) setPage('html-viewer');
      else if (hash.includes('/viewer/zip')) setPage('zip-viewer');
      else if (hash.includes('/viewer/pdf')) setPage('pdf-viewer');
      else if (hash.includes('/locker/html')) setPage('html-locker');
      else if (hash.includes('/locker/zip')) setPage('zip-locker');
      else if (hash.includes('/locker/pdf')) setPage('pdf-locker');
      else if (path.includes('html-locker')) setPage('html-locker');
      else if (path.includes('zip-locker')) setPage('zip-locker');
      else if (path.includes('pdf-locker')) setPage('pdf-locker');
      else if (path.includes('html-viewer')) setPage('html-viewer');
      else if (path.includes('zip-viewer')) setPage('zip-viewer');
      else if (path.includes('pdf-viewer')) setPage('pdf-viewer');
      else setPage('portal');
    };

    updatePage();
    window.addEventListener('hashchange', updatePage);
    return () => window.removeEventListener('hashchange', updatePage);
  }, []);

  const navigate = (newPage: Page) => {
    setPage(newPage);
    window.history.pushState({}, '', `/${newPage}`);
  };

  return (
    <div style={{ width: '100%', height: '100%' }}>
      {page === 'portal' && <Portal onNavigate={navigate} />}
      {page === 'html-locker' && <HtmlLocker onBack={() => navigate('portal')} />}
      {page === 'zip-locker' && <ZipLocker onBack={() => navigate('portal')} />}
      {page === 'pdf-locker' && <PdfLocker onBack={() => navigate('portal')} />}
      {page === 'html-viewer' && <HtmlViewer onBack={() => navigate('portal')} />}
      {page === 'zip-viewer' && <ZipViewer onBack={() => navigate('portal')} />}
      {page === 'pdf-viewer' && <PdfViewer onBack={() => navigate('portal')} />}
    </div>
  );
}

interface PageProps {
  onNavigate?: (page: Page) => void;
  onBack?: () => void;
}

function Portal({ onNavigate }: PageProps) {
  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: notionTheme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        margin: 0,
        fontFamily: notionTheme.fonts.primary,
        boxSizing: 'border-box',
      }}
    >
      <div style={{ maxWidth: '1200px', width: '100%' }}>
        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: 'clamp(36px, 8vw, 56px)',
            fontWeight: 800,
            textAlign: 'center',
            margin: '0 0 16px 0',
            letterSpacing: '-1px',
          }}
        >
          AstralCrypt
        </h1>

        <p
          style={{
            color: notionTheme.colors.textSecondary,
            fontSize: 'clamp(16px, 3vw, 18px)',
            textAlign: 'center',
            margin: '0 0 60px 0',
            lineHeight: '1.6',
          }}
        >
          Client-side encryption for your Notion exports
        </p>

        {/* ZIP Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              color: notionTheme.colors.text,
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 20px 0',
              paddingLeft: '4px',
            }}
          >
            ZIP Files
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '20px',
            }}
          >
            <AppCard
              title="ZIP Encrypt"
              description="Password protect ZIP archives"
              onClick={() => onNavigate?.('zip-locker')}
            />
            <AppCard
              title="ZIP Decrypt"
              description="View encrypted ZIP archives"
              onClick={() => onNavigate?.('zip-viewer')}
            />
          </div>
        </div>

        {/* HTML Section */}
        <div style={{ marginBottom: '40px' }}>
          <h2
            style={{
              color: notionTheme.colors.text,
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 20px 0',
              paddingLeft: '4px',
            }}
          >
            HTML Files
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '20px',
            }}
          >
            <AppCard
              title="HTML Encrypt"
              description="Password protect HTML files"
              onClick={() => onNavigate?.('html-locker')}
            />
            <AppCard
              title="HTML Decrypt"
              description="View encrypted HTML files"
              onClick={() => onNavigate?.('html-viewer')}
            />
          </div>
        </div>

        {/* PDF Section */}
        <div style={{ marginBottom: '60px' }}>
          <h2
            style={{
              color: notionTheme.colors.text,
              fontSize: '20px',
              fontWeight: 700,
              margin: '0 0 20px 0',
              paddingLeft: '4px',
            }}
          >
            PDF Files
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))',
              gap: '20px',
            }}
          >
            <AppCard
              title="PDF Encrypt"
              description="Password protect PDF documents"
              onClick={() => onNavigate?.('pdf-locker')}
            />
            <AppCard
              title="PDF Decrypt"
              description="View encrypted PDF documents"
              onClick={() => onNavigate?.('pdf-viewer')}
            />
          </div>
        </div>

        <div
          style={{
            padding: '24px',
            backgroundColor: notionTheme.colors.surface,
            borderRadius: '12px',
            border: `1px solid ${notionTheme.colors.border}`,
            textAlign: 'center',
          }}
        >
          <h3
            style={{
              color: notionTheme.colors.text,
              fontSize: '16px',
              fontWeight: 700,
              margin: '0 0 8px 0',
            }}
          >
            Privacy First
          </h3>
          <p
            style={{
              color: notionTheme.colors.textSecondary,
              fontSize: '14px',
              margin: 0,
              lineHeight: '1.6',
            }}
          >
            All encryption happens in your browser. Your passwords and files never leave your device.
          </p>
        </div>
      </div>
    </div>
  );
}

interface AppCardProps {
  title: string;
  description: string;
  onClick: () => void;
}

function AppCard({ title, description, onClick }: AppCardProps) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        backgroundColor: isHovered ? notionTheme.colors.accent : notionTheme.colors.surface,
        border: `2px solid ${isHovered ? notionTheme.colors.primary : notionTheme.colors.border}`,
        borderRadius: '12px',
        padding: 'clamp(20px, 4vw, 32px) clamp(16px, 3vw, 24px)',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? notionTheme.shadows.lg : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        minHeight: 'clamp(160px, 25vw, 200px)',
      }}
    >
      <h2
        style={{
          color: notionTheme.colors.text,
          fontSize: 'clamp(18px, 3.5vw, 22px)',
          fontWeight: 700,
          margin: '0 0 12px 0',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: notionTheme.colors.textSecondary,
          fontSize: 'clamp(13px, 2.5vw, 15px)',
          margin: 0,
          lineHeight: '1.6',
          flex: 1,
        }}
      >
        {description}
      </p>
    </div>
  );
}

function HtmlLocker({ onBack }: PageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    try {
      const data = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(data);
      if (!validateHtml(uint8Array)) {
        setError('The uploaded file is not valid HTML');
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
      const encryptedData = await buildNLockFile(uint8Array, 'html', password);

      const blob = new Blob([encryptedData.buffer as ArrayBuffer], { type: 'application/octet-stream' });
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
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
          borderRadius: '12px',
          padding: '32px',
          boxShadow: notionTheme.shadows.lg,
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            backgroundColor: notionTheme.colors.accent,
            color: notionTheme.colors.text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: notionTheme.fonts.primary,
            fontSize: '14px',
          }}
        >
          Back
        </button>

        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: '28px',
            fontWeight: 700,
            margin: '0 0 24px 0',
          }}
        >
          HTML Locker
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onClick={() => document.getElementById('file-input-html')?.click()}
            style={{
              padding: '24px',
              border: `2px dashed ${notionTheme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: notionTheme.colors.accent,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <p style={{ color: notionTheme.colors.text, margin: 0 }}>
              {file ? `Selected: ${file.name}` : 'Drop HTML file here or click to upload'}
            </p>
          </div>
          <input
            id="file-input-html"
            type="file"
            accept=".html"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={isProcessing}
            style={{
              padding: '12px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: `1px solid ${notionTheme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: notionTheme.fonts.primary,
            }}
          />

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: `1px solid #e74c3c`,
                borderRadius: '8px',
                color: '#e74c3c',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleEncrypt}
            disabled={!file || !password || isProcessing}
            style={{
              padding: '12px 24px',
              backgroundColor: !file || !password || isProcessing ? notionTheme.colors.accent : notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
              cursor: !file || !password || isProcessing ? 'not-allowed' : 'pointer',
              opacity: !file || !password || isProcessing ? 0.5 : 1,
              transition: 'all 0.3s ease',
              width: '100%',
            }}
          >
            {isProcessing ? 'Encrypting...' : 'Encrypt & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ZipLocker({ onBack }: PageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    try {
      const data = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(data);
      if (!validateZip(uint8Array)) {
        setError('The uploaded file is not a valid ZIP archive');
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
      const encryptedData = await buildNLockFile(uint8Array, 'zip', password);

      const blob = new Blob([encryptedData.buffer as ArrayBuffer], { type: 'application/octet-stream' });
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
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
          borderRadius: '12px',
          padding: '32px',
          boxShadow: notionTheme.shadows.lg,
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            backgroundColor: notionTheme.colors.accent,
            color: notionTheme.colors.text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: notionTheme.fonts.primary,
            fontSize: '14px',
          }}
        >
          Back
        </button>

        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: '28px',
            fontWeight: 700,
            margin: '0 0 24px 0',
          }}
        >
          ZIP Locker
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onClick={() => document.getElementById('file-input-zip')?.click()}
            style={{
              padding: '24px',
              border: `2px dashed ${notionTheme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: notionTheme.colors.accent,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <p style={{ color: notionTheme.colors.text, margin: 0 }}>
              {file ? `Selected: ${file.name}` : 'Drop ZIP file here or click to upload'}
            </p>
          </div>
          <input
            id="file-input-zip"
            type="file"
            accept=".zip"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={isProcessing}
            style={{
              padding: '12px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: `1px solid ${notionTheme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: notionTheme.fonts.primary,
            }}
          />

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: `1px solid #e74c3c`,
                borderRadius: '8px',
                color: '#e74c3c',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleEncrypt}
            disabled={!file || !password || isProcessing}
            style={{
              padding: '12px 24px',
              backgroundColor: !file || !password || isProcessing ? notionTheme.colors.accent : notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
              cursor: !file || !password || isProcessing ? 'not-allowed' : 'pointer',
              opacity: !file || !password || isProcessing ? 0.5 : 1,
              transition: 'all 0.3s ease',
              width: '100%',
            }}
          >
            {isProcessing ? 'Encrypting...' : 'Encrypt & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

function HtmlViewer({ onBack }: PageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptedHtml, setDecryptedHtml] = useState<string>('');
  const [decryptedHtmlRaw, setDecryptedHtmlRaw] = useState<string>('');
  const [isViewing, setIsViewing] = useState(false);
  const containerRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (isViewing && decryptedHtml && containerRef.current) {
      try {
        containerRef.current.innerHTML = '';
        renderInSandbox(decryptedHtml, 'html-content-container');
      } catch (err) {
        console.error('Render error:', err);
        setError('Failed to render HTML');
        setIsViewing(false);
      }
    }
  }, [isViewing, decryptedHtml]);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
  };

  const handleDownload = () => {
    if (!decryptedHtmlRaw) return;
    
    const blob = new Blob([decryptedHtmlRaw], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decrypted.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      if (!text.includes('<html') && !text.includes('<!DOCTYPE')) {
        setError('This is not an HTML file. Please use ZIP Viewer for ZIP files.');
        setIsProcessing(false);
        return;
      }

      const sanitized = sanitizeHtml(text);
      setDecryptedHtmlRaw(text);
      setDecryptedHtml(sanitized);
      setIsViewing(true);
      setFile(null);
      setPassword('');
    } catch (err) {
      setError('Decryption failed. Please try again');
      console.error('Decryption error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isViewing) {
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
            padding: '16px',
            borderBottom: `1px solid ${notionTheme.colors.border}`,
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            onClick={handleDownload}
            style={{
              padding: '8px 16px',
              backgroundColor: notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
            }}
          >
            Download HTML
          </button>
          <button
            onClick={() => {
              setIsViewing(false);
              setDecryptedHtml('');
              setDecryptedHtmlRaw('');
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: notionTheme.fonts.primary,
            }}
          >
            Decrypt Another
          </button>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: notionTheme.fonts.primary,
            }}
          >
            Back to Portal
          </button>
        </div>
        <div
          id="html-content-container"
          ref={containerRef}
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
        minHeight: '100vh',
        backgroundColor: notionTheme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
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
          borderRadius: '12px',
          padding: '32px',
          boxShadow: notionTheme.shadows.lg,
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            backgroundColor: notionTheme.colors.accent,
            color: notionTheme.colors.text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: notionTheme.fonts.primary,
            fontSize: '14px',
          }}
        >
          Back
        </button>

        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: '28px',
            fontWeight: 700,
            margin: '0 0 24px 0',
          }}
        >
          HTML Viewer
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onClick={() => document.getElementById('file-input-html-viewer')?.click()}
            style={{
              padding: '24px',
              border: `2px dashed ${notionTheme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: notionTheme.colors.accent,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <p style={{ color: notionTheme.colors.text, margin: 0 }}>
              {file ? `Selected: ${file.name}` : 'Drop encrypted HTML file here or click to upload'}
            </p>
          </div>
          <input
            id="file-input-html-viewer"
            type="file"
            accept=".nlock"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={isProcessing}
            style={{
              padding: '12px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: `1px solid ${notionTheme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: notionTheme.fonts.primary,
            }}
          />

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: `1px solid #e74c3c`,
                borderRadius: '8px',
                color: '#e74c3c',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleDecrypt}
            disabled={!file || !password || isProcessing}
            style={{
              padding: '12px 24px',
              backgroundColor: !file || !password || isProcessing ? notionTheme.colors.accent : notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
              cursor: !file || !password || isProcessing ? 'not-allowed' : 'pointer',
              opacity: !file || !password || isProcessing ? 0.5 : 1,
              transition: 'all 0.3s ease',
              width: '100%',
            }}
          >
            {isProcessing ? 'Decrypting...' : 'Decrypt & View'}
          </button>
        </div>
      </div>
    </div>
  );
}

function ZipViewer({ onBack }: PageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [decryptedZipData, setDecryptedZipData] = useState<Uint8Array | null>(null);
  const [showActions, setShowActions] = useState(false);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
    setShowActions(false);
    setDecryptedZipData(null);
  };

  const handleDownload = () => {
    if (!decryptedZipData) return;
    
    const blob = new Blob([decryptedZipData.buffer as ArrayBuffer], { type: 'application/zip' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decrypted.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleView = async () => {
    if (!decryptedZipData) return;
    
    try {
      const files = await extractZip(decryptedZipData);
      const mainHtmlFile = findMainHtml(files);

      if (!mainHtmlFile) {
        setError('No HTML file found in ZIP');
        return;
      }

      const htmlData = files.get(mainHtmlFile);
      if (!htmlData) {
        setError('Failed to extract HTML file');
        return;
      }

      const html = new TextDecoder().decode(htmlData);
      const sanitized = sanitizeHtml(html);
      
      // Open in new window
      const newWindow = window.open('', '_blank');
      if (newWindow) {
        newWindow.document.write(sanitized);
        newWindow.document.close();
      }
    } catch (err) {
      setError('Failed to view ZIP: ' + (err instanceof Error ? err.message : String(err)));
    }
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

      // Check if it's a ZIP file
      if (decrypted[0] !== 0x50 || decrypted[1] !== 0x4b) {
        setError('This is not a ZIP file');
        setIsProcessing(false);
        return;
      }

      setDecryptedZipData(decrypted);
      setShowActions(true);
      setPassword('');
    } catch (err) {
      setError('Decryption failed: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsProcessing(false);
    }
  };

  if (showActions && decryptedZipData) {
    return (
      <div
        style={{
          width: '100%',
          minHeight: '100vh',
          backgroundColor: notionTheme.colors.background,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          fontFamily: notionTheme.fonts.primary,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '500px',
            backgroundColor: notionTheme.colors.surface,
            border: `1px solid ${notionTheme.colors.border}`,
            borderRadius: '12px',
            padding: '32px',
            boxShadow: notionTheme.shadows.lg,
          }}
        >
          <h2 style={{ color: notionTheme.colors.text, marginBottom: '16px', fontSize: '24px' }}>
            Decryption Successful
          </h2>
          
          <div style={{
            padding: '12px',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            border: '1px solid rgba(255, 193, 7, 0.3)',
            borderRadius: '8px',
            marginBottom: '24px',
            fontSize: '14px',
            color: notionTheme.colors.text,
          }}>
            Note: Images may not display correctly in browser view. Download the ZIP file to view all assets properly.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              onClick={handleDownload}
              style={{
                padding: '12px 24px',
                backgroundColor: notionTheme.colors.primary,
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: notionTheme.fonts.primary,
                fontWeight: 600,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Download ZIP
            </button>
            
            <button
              onClick={handleView}
              style={{
                padding: '12px 24px',
                backgroundColor: notionTheme.colors.accent,
                color: notionTheme.colors.text,
                border: `1px solid ${notionTheme.colors.border}`,
                borderRadius: '8px',
                fontSize: '16px',
                fontFamily: notionTheme.fonts.primary,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              View in Browser
            </button>

            <button
              onClick={() => {
                setShowActions(false);
                setDecryptedZipData(null);
                setFile(null);
              }}
              style={{
                padding: '12px 24px',
                backgroundColor: 'transparent',
                color: notionTheme.colors.text,
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontFamily: notionTheme.fonts.primary,
                cursor: 'pointer',
                width: '100%',
              }}
            >
              Decrypt Another
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        backgroundColor: notionTheme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
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
          borderRadius: '12px',
          padding: '32px',
          boxShadow: notionTheme.shadows.lg,
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            backgroundColor: notionTheme.colors.accent,
            color: notionTheme.colors.text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: notionTheme.fonts.primary,
            fontSize: '14px',
          }}
        >
          Back
        </button>

        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: '28px',
            fontWeight: 700,
            margin: '0 0 24px 0',
          }}
        >
          ZIP Viewer
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onClick={() => document.getElementById('file-input-zip-viewer')?.click()}
            style={{
              padding: '24px',
              border: `2px dashed ${notionTheme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: notionTheme.colors.accent,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <p style={{ color: notionTheme.colors.text, margin: 0 }}>
              {file ? `Selected: ${file.name}` : 'Drop encrypted ZIP file here or click to upload'}
            </p>
          </div>
          <input
            id="file-input-zip-viewer"
            type="file"
            accept=".nlock"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={isProcessing}
            style={{
              padding: '12px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: `1px solid ${notionTheme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: notionTheme.fonts.primary,
            }}
          />

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: `1px solid #e74c3c`,
                borderRadius: '8px',
                color: '#e74c3c',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleDecrypt}
            disabled={!file || !password || isProcessing}
            style={{
              padding: '12px 24px',
              backgroundColor: !file || !password || isProcessing ? notionTheme.colors.accent : notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
              cursor: !file || !password || isProcessing ? 'not-allowed' : 'pointer',
              opacity: !file || !password || isProcessing ? 0.5 : 1,
              transition: 'all 0.3s ease',
              width: '100%',
            }}
          >
            {isProcessing ? 'Decrypting...' : 'Decrypt & View'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfLocker({ onBack }: PageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (selectedFile: File) => {
    setError(null);
    try {
      const data = await selectedFile.arrayBuffer();
      const uint8Array = new Uint8Array(data);
      if (uint8Array.length < 5 || new TextDecoder().decode(uint8Array.slice(0, 5)) !== '%PDF-') {
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

      const blob = new Blob([encryptedData.buffer as ArrayBuffer], { type: 'application/octet-stream' });
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
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
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
          borderRadius: '12px',
          padding: '32px',
          boxShadow: notionTheme.shadows.lg,
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            backgroundColor: notionTheme.colors.accent,
            color: notionTheme.colors.text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: notionTheme.fonts.primary,
            fontSize: '14px',
          }}
        >
          Back
        </button>

        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: '28px',
            fontWeight: 700,
            margin: '0 0 24px 0',
          }}
        >
          PDF Locker
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onClick={() => document.getElementById('file-input-pdf')?.click()}
            style={{
              padding: '24px',
              border: `2px dashed ${notionTheme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: notionTheme.colors.accent,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <p style={{ color: notionTheme.colors.text, margin: 0 }}>
              {file ? `Selected: ${file.name}` : 'Drop PDF file here or click to upload'}
            </p>
          </div>
          <input
            id="file-input-pdf"
            type="file"
            accept=".pdf"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={isProcessing}
            style={{
              padding: '12px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: `1px solid ${notionTheme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: notionTheme.fonts.primary,
            }}
          />

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: `1px solid #e74c3c`,
                borderRadius: '8px',
                color: '#e74c3c',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleEncrypt}
            disabled={!file || !password || isProcessing}
            style={{
              padding: '12px 24px',
              backgroundColor: !file || !password || isProcessing ? notionTheme.colors.accent : notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
              cursor: !file || !password || isProcessing ? 'not-allowed' : 'pointer',
              opacity: !file || !password || isProcessing ? 0.5 : 1,
              transition: 'all 0.3s ease',
              width: '100%',
            }}
          >
            {isProcessing ? 'Encrypting...' : 'Encrypt & Download'}
          </button>
        </div>
      </div>
    </div>
  );
}

function PdfViewer({ onBack }: PageProps) {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isViewing, setIsViewing] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfData, setPdfData] = useState<Uint8Array | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setError(null);
    setFile(selectedFile);
  };

  const handleDownload = () => {
    if (!pdfData) return;
    
    const blob = new Blob([pdfData.buffer as ArrayBuffer], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'decrypted.pdf';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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

      if (decrypted.length < 5) {
        setError('This is not a valid PDF file');
        setIsProcessing(false);
        return;
      }

      const header = new TextDecoder().decode(decrypted.slice(0, 5));
      if (!header.startsWith('%PDF-')) {
        setError('This is not a PDF file');
        setIsProcessing(false);
        return;
      }

      const blob = new Blob([decrypted.buffer as ArrayBuffer], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfData(decrypted);
      setPdfUrl(url);
      setIsViewing(true);
      setFile(null);
      setPassword('');
    } catch (err) {
      setError('Decryption failed. Please try again');
      console.error('Decryption error:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isViewing && pdfUrl) {
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
            padding: '16px',
            borderBottom: `1px solid ${notionTheme.colors.border}`,
            display: 'flex',
            gap: '12px',
          }}
        >
          <button
            onClick={handleDownload}
            style={{
              padding: '8px 16px',
              backgroundColor: notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
            }}
          >
            Download PDF
          </button>
          <button
            onClick={() => {
              setIsViewing(false);
              setPdfUrl(null);
              setPdfData(null);
              if (pdfUrl) URL.revokeObjectURL(pdfUrl);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: notionTheme.fonts.primary,
            }}
          >
            Decrypt Another
          </button>
          <button
            onClick={onBack}
            style={{
              padding: '8px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: 'none',
              borderRadius: '6px',
              cursor: 'pointer',
              fontFamily: notionTheme.fonts.primary,
            }}
          >
            Back to Portal
          </button>
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
        minHeight: '100vh',
        backgroundColor: notionTheme.colors.background,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
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
          borderRadius: '12px',
          padding: '32px',
          boxShadow: notionTheme.shadows.lg,
        }}
      >
        <button
          onClick={onBack}
          style={{
            marginBottom: '24px',
            padding: '8px 16px',
            backgroundColor: notionTheme.colors.accent,
            color: notionTheme.colors.text,
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontFamily: notionTheme.fonts.primary,
            fontSize: '14px',
          }}
        >
          Back
        </button>

        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: '28px',
            fontWeight: 700,
            margin: '0 0 24px 0',
          }}
        >
          PDF Viewer
        </h1>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            onClick={() => document.getElementById('file-input-pdf-viewer')?.click()}
            style={{
              padding: '24px',
              border: `2px dashed ${notionTheme.colors.border}`,
              borderRadius: '8px',
              backgroundColor: notionTheme.colors.accent,
              cursor: 'pointer',
              textAlign: 'center',
              transition: 'all 0.2s ease',
            }}
          >
            <p style={{ color: notionTheme.colors.text, margin: 0 }}>
              {file ? `Selected: ${file.name}` : 'Drop encrypted PDF file here or click to upload'}
            </p>
          </div>
          <input
            id="file-input-pdf-viewer"
            type="file"
            accept=".nlock"
            onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
            style={{ display: 'none' }}
          />

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter password"
            disabled={isProcessing}
            style={{
              padding: '12px 16px',
              backgroundColor: notionTheme.colors.accent,
              color: notionTheme.colors.text,
              border: `1px solid ${notionTheme.colors.border}`,
              borderRadius: '8px',
              fontSize: '14px',
              fontFamily: notionTheme.fonts.primary,
            }}
          />

          {error && (
            <div
              style={{
                padding: '12px',
                backgroundColor: 'rgba(231, 76, 60, 0.1)',
                border: `1px solid #e74c3c`,
                borderRadius: '8px',
                color: '#e74c3c',
                fontSize: '14px',
              }}
            >
              {error}
            </div>
          )}

          <button
            onClick={handleDecrypt}
            disabled={!file || !password || isProcessing}
            style={{
              padding: '12px 24px',
              backgroundColor: !file || !password || isProcessing ? notionTheme.colors.accent : notionTheme.colors.primary,
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontSize: '16px',
              fontFamily: notionTheme.fonts.primary,
              fontWeight: 600,
              cursor: !file || !password || isProcessing ? 'not-allowed' : 'pointer',
              opacity: !file || !password || isProcessing ? 0.5 : 1,
              transition: 'all 0.3s ease',
              width: '100%',
            }}
          >
            {isProcessing ? 'Decrypting...' : 'Decrypt & View'}
          </button>
        </div>
      </div>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

