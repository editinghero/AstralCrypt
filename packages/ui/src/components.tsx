/**
 * Shared UI Components
 * 
 * Core React components used across all applications with Notion dark theme.
 * Validates: Requirements 7.4
 */

import React from 'react';
import { notionTheme } from './theme';

/**
 * FileUpload Component
 * 
 * Drag-drop area for file uploads with visual feedback
 */
export interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  label?: string;
  disabled?: boolean;
}

export const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ onFileSelect, accept, label = 'Drop file here or click to upload', disabled = false }, ref) => {
    const [isDragging, setIsDragging] = React.useState(false);

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(true);
    };

    const handleDragLeave = () => {
      setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    };

    const handleClick = () => {
      const input = document.createElement('input');
      input.type = 'file';
      if (accept) input.accept = accept;
      input.onchange = (e) => {
        const files = (e.target as HTMLInputElement).files;
        if (files && files.length > 0) {
          onFileSelect(files[0]);
        }
      };
      input.click();
    };

    return (
      <div
        ref={ref}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        style={{
          padding: notionTheme.spacing.lg,
          border: `2px dashed ${isDragging ? notionTheme.colors.primary : notionTheme.colors.border}`,
          borderRadius: notionTheme.borderRadius.md,
          backgroundColor: isDragging ? notionTheme.colors.accent : notionTheme.colors.surface,
          cursor: disabled ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease',
          textAlign: 'center',
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <p style={{ color: notionTheme.colors.text, margin: 0 }}>{label}</p>
      </div>
    );
  }
);

FileUpload.displayName = 'FileUpload';

/**
 * PasswordInput Component
 * 
 * Secure password entry field with show/hide toggle
 */
export interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ value, onChange, placeholder = 'Enter password', disabled = false }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
      <div style={{ position: 'relative' }}>
        <input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          style={{
            width: '100%',
            padding: `${notionTheme.spacing.sm} ${notionTheme.spacing.md}`,
            backgroundColor: notionTheme.colors.surface,
            color: notionTheme.colors.text,
            border: `1px solid ${notionTheme.colors.border}`,
            borderRadius: notionTheme.borderRadius.md,
            fontSize: '14px',
            fontFamily: notionTheme.fonts.primary,
            boxSizing: 'border-box',
          }}
        />
        <button
          onClick={() => setShowPassword(!showPassword)}
          style={{
            position: 'absolute',
            right: notionTheme.spacing.md,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: notionTheme.colors.textSecondary,
            cursor: 'pointer',
            padding: 0,
          }}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';

/**
 * ActionButton Component
 * 
 * Primary action button with loading state
 */
export interface ActionButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export const ActionButton = React.forwardRef<HTMLButtonElement, ActionButtonProps>(
  ({ onClick, children, loading = false, disabled = false, variant = 'primary' }, ref) => {
    const isPrimary = variant === 'primary';

    return (
      <button
        ref={ref}
        onClick={onClick}
        disabled={disabled || loading}
        style={{
          padding: `${notionTheme.spacing.sm} ${notionTheme.spacing.lg}`,
          backgroundColor: isPrimary ? notionTheme.colors.primary : notionTheme.colors.accent,
          color: isPrimary ? '#fff' : notionTheme.colors.text,
          border: 'none',
          borderRadius: notionTheme.borderRadius.md,
          fontSize: '14px',
          fontFamily: notionTheme.fonts.primary,
          fontWeight: 500,
          cursor: disabled || loading ? 'not-allowed' : 'pointer',
          opacity: disabled || loading ? 0.6 : 1,
          transition: 'all 0.2s ease',
        }}
      >
        {loading ? '...' : children}
      </button>
    );
  }
);

ActionButton.displayName = 'ActionButton';

/**
 * Card Component
 * 
 * Centered container card with Notion styling
 */
export interface CardProps {
  children: React.ReactNode;
  title?: string;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ children, title }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          backgroundColor: notionTheme.colors.surface,
          border: `1px solid ${notionTheme.colors.border}`,
          borderRadius: notionTheme.borderRadius.lg,
          padding: notionTheme.spacing.lg,
          maxWidth: '500px',
          margin: '0 auto',
          boxShadow: notionTheme.shadows.md,
        }}
      >
        {title && (
          <h2
            style={{
              color: notionTheme.colors.text,
              fontSize: '20px',
              fontWeight: 600,
              margin: `0 0 ${notionTheme.spacing.md} 0`,
              fontFamily: notionTheme.fonts.primary,
            }}
          >
            {title}
          </h2>
        )}
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

/**
 * ErrorMessage Component
 * 
 * Displays error messages with styling
 */
export interface ErrorMessageProps {
  message: string;
  onDismiss?: () => void;
}

export const ErrorMessage = React.forwardRef<HTMLDivElement, ErrorMessageProps>(
  ({ message, onDismiss }, ref) => {
    return (
      <div
        ref={ref}
        style={{
          backgroundColor: 'rgba(231, 76, 60, 0.1)',
          border: `1px solid ${notionTheme.colors.error}`,
          borderRadius: notionTheme.borderRadius.md,
          padding: notionTheme.spacing.md,
          color: notionTheme.colors.error,
          fontSize: '14px',
          fontFamily: notionTheme.fonts.primary,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <span>{message}</span>
        {onDismiss && (
          <button
            onClick={onDismiss}
            style={{
              background: 'none',
              border: 'none',
              color: notionTheme.colors.error,
              cursor: 'pointer',
              fontSize: '18px',
              padding: 0,
            }}
          >
            ×
          </button>
        )}
      </div>
    );
  }
);

ErrorMessage.displayName = 'ErrorMessage';
