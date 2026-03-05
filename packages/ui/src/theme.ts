/**
 * Notion Dark Theme Configuration
 * 
 * Defines the Notion-inspired dark theme colors and typography.
 * Validates: Requirements 7.2, 7.3, 7.5
 */

export const notionTheme = {
  colors: {
    background: '#191919',
    surface: '#202020',
    border: '#2f2f2f',
    text: '#e6e6e6',
    textSecondary: '#9b9b9b',
    accent: '#3a3a3a',
    primary: '#0a84ff',
    success: '#27ae60',
    error: '#e74c3c',
    warning: '#f39c12',
  },
  fonts: {
    primary: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
  },
  borderRadius: {
    sm: '4px',
    md: '8px',
    lg: '12px',
  },
  shadows: {
    sm: '0 1px 3px rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px rgba(0, 0, 0, 0.4)',
    lg: '0 10px 15px rgba(0, 0, 0, 0.5)',
  },
} as const;

/**
 * Tailwind CSS configuration for Notion dark theme
 */
export const tailwindConfig = {
  theme: {
    extend: {
      colors: {
        notion: {
          bg: notionTheme.colors.background,
          surface: notionTheme.colors.surface,
          border: notionTheme.colors.border,
          text: notionTheme.colors.text,
          'text-secondary': notionTheme.colors.textSecondary,
          accent: notionTheme.colors.accent,
        },
      },
      fontFamily: {
        sans: notionTheme.fonts.primary,
      },
      spacing: {
        xs: notionTheme.spacing.xs,
        sm: notionTheme.spacing.sm,
        md: notionTheme.spacing.md,
        lg: notionTheme.spacing.lg,
        xl: notionTheme.spacing.xl,
      },
      borderRadius: {
        sm: notionTheme.borderRadius.sm,
        md: notionTheme.borderRadius.md,
        lg: notionTheme.borderRadius.lg,
      },
      boxShadow: {
        sm: notionTheme.shadows.sm,
        md: notionTheme.shadows.md,
        lg: notionTheme.shadows.lg,
      },
    },
  },
};
