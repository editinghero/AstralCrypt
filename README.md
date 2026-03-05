# AstralCrypt

Client-side encryption tool for Notion exports and sensitive files.

## Features

- Encrypt HTML files, ZIP archives, and PDFs
- Decrypt and view encrypted files
- All encryption happens in your browser
- No data is sent to any server
- Strong encryption: XChaCha20-Poly1305 + Argon2id

## Usage

### Encrypting Files

1. Choose the appropriate locker:
   - HTML Locker: For single HTML files
   - ZIP Locker: For Notion export ZIP files
   - PDF Locker: For PDF documents

2. Upload your file
3. Enter a strong password
4. Click "Encrypt & Download"
5. Save the .nlock file

### Decrypting Files

1. Go to the Viewer section
2. Choose the file type (HTML, ZIP, or PDF)
3. Upload your .nlock file
4. Enter the password
5. Choose to Download or View in browser

Note: For ZIP files with images, downloading is recommended as images may not display correctly in browser view.

## Notion Integration

You can embed decrypt buttons directly in Notion pages. This allows you to:
1. Store encrypted .nlock files in Google Drive/Dropbox
2. Add the file link in your Notion page
3. Add a decrypt button below it
4. Click the button to open the decryption page

### Embed Buttons

Copy and paste these HTML codes into Notion using the "Embed" block:

#### HTML Decrypt Button
```html
<a href="https://astralcrypt.pages.dev/#/viewer/html" target="_blank" style="display:inline-block;padding:8px 16px;background:#2383E2;color:#fff;text-decoration:none;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;">Decrypt HTML</a>
```

#### ZIP Decrypt Button
```html
<a href="https://astralcrypt.pages.dev/#/viewer/zip" target="_blank" style="display:inline-block;padding:8px 16px;background:#2383E2;color:#fff;text-decoration:none;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;">Decrypt ZIP</a>
```

#### PDF Decrypt Button
```html
<a href="https://astralcrypt.pages.dev/#/viewer/pdf" target="_blank" style="display:inline-block;padding:8px 16px;background:#2383E2;color:#fff;text-decoration:none;border-radius:6px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:500;">Decrypt PDF</a>
```

### Example Workflow in Notion

1. Export your Notion page as ZIP
2. Encrypt the ZIP using AstralCrypt
3. Upload the .nlock file to Google Drive
4. In your Notion page:
   - Add the Google Drive link
   - Add the "Decrypt ZIP" button using Embed block
   - Click the button to decrypt and view

[Screenshot: Add your screenshot here]

## Security

- All encryption/decryption happens locally in your browser
- Files never leave your device
- Password is never stored or transmitted
- Uses industry-standard encryption algorithms

## Deployment

### Cloudflare Pages

1. Install Wrangler CLI:
```bash
npm install -g wrangler
```

2. Login to Cloudflare:
```bash
wrangler login
```

3. Build and deploy:
```bash
npm run build
cd apps/portal
wrangler pages deploy dist --project-name=astralcrypt
```

Your app will be available at `https://astralcrypt.pages.dev`

### GitHub

1. Initialize git repository:
```bash
git init
git add .
git commit -m "Initial commit"
```

2. Create a new repository on GitHub

3. Push to GitHub:
```bash
git remote add origin https://github.com/yourusername/astralcrypt.git
git branch -M main
git push -u origin main
```

## License

MIT
