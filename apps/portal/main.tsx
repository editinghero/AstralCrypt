import React from 'react';
import ReactDOM from 'react-dom/client';
import { notionTheme } from '@notion-lock/ui';

function Portal() {
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
      <div style={{ maxWidth: '1000px', width: '100%' }}>
        <h1
          style={{
            color: notionTheme.colors.text,
            fontSize: '56px',
            fontWeight: 800,
            textAlign: 'center',
            margin: '0 0 16px 0',
            letterSpacing: '-1px',
          }}
        >
          Notion Lock
        </h1>

        <p
          style={{
            color: notionTheme.colors.textSecondary,
            fontSize: '18px',
            textAlign: 'center',
            margin: '0 0 60px 0',
            lineHeight: '1.6',
          }}
        >
          Client-side encryption for your Notion exports
        </p>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '24px',
            marginBottom: '60px',
          }}
        >
          <AppCard
            title="HTML Locker"
            description="Encrypt single HTML page exports"
            onClick={() => (window.location.pathname = '/html-locker')}
          />
          <AppCard
            title="ZIP Locker"
            description="Encrypt complete Notion export archives"
            onClick={() => (window.location.pathname = '/zip-locker')}
          />
          <AppCard
            title="Viewer"
            description="Decrypt and view encrypted files"
            onClick={() => (window.location.pathname = '/viewer')}
          />
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
        padding: '32px 24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? notionTheme.shadows.lg : 'none',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-start',
        minHeight: '200px',
      }}
    >
      <h2
        style={{
          color: notionTheme.colors.text,
          fontSize: '22px',
          fontWeight: 700,
          margin: '0 0 12px 0',
        }}
      >
        {title}
      </h2>
      <p
        style={{
          color: notionTheme.colors.textSecondary,
          fontSize: '15px',
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

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <Portal />
  </React.StrictMode>
);
