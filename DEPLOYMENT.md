# Deployment Guide

## Quick Start

1. Build the project:
```bash
npm install
npm run build
```

2. Deploy to Cloudflare Pages:
```bash
cd apps/portal
wrangler pages deploy dist --project-name=astralcrypt
```

## Notion Integration

After deployment, update the button HTML files in `notion-buttons/` folder:

Replace `your-domain.pages.dev` with your actual Cloudflare Pages URL (e.g., `astralcrypt.pages.dev`)

Then copy the HTML code from these files and paste into Notion using the Embed block.

## File Structure

```
astralcrypt/
├── apps/portal/          # Main application
├── packages/             # Shared packages
├── notion-buttons/       # Embeddable button HTML
├── README.md            # User documentation
└── wrangler.toml        # Cloudflare configuration
```

## Environment

- Node.js 18+
- npm 9+
- Wrangler CLI (for deployment)
