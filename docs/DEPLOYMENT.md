# Deployment Guide

This guide explains how to deploy Seed Alias to various hosting platforms.

## 📋 Table of Contents

1. [Deployment Overview](#deployment-overview)
2. [Local Development](#local-development)
3. [Static Hosting](#static-hosting)
4. [Docker Deployment](#docker-deployment)
5. [Security Considerations](#security-considerations-for-deployment)
6. [Performance Optimization](#performance-optimization)
7. [Monitoring](#monitoring)

---

## Deployment Overview

Seed Alias is a **static web application** with no backend requirements:

- ✅ No server-side code
- ✅ No database needed
- ✅ No dependencies to install (except for local development)
- ✅ Runs entirely in the browser
- ✅ Can be deployed anywhere static files are served

### Deployment Checklist

- [ ] All files included (index.html, crypto.js, scramble.js, style.css)
- [ ] External dependencies (Bootstrap, Font Awesome) load from CDN
- [ ] HTTPS enabled (recommended)
- [ ] Cache headers configured appropriately
- [ ] Gzip compression enabled
- [ ] Security headers set
- [ ] Cross-site scripting (XSS) prevention verified

---

## Local Development

### Using Python

```bash
# Python 3
cd /path/to/seedalias
python -m http.server 8000

# Python 2 (legacy)
python -m SimpleHTTPServer 8000
```

Visit `http://localhost:8000`

### Using Node.js

```bash
cd /path/to/seedalias

# Using serve package
npx serve .

# Using http-server package
npx http-server

# Or install globally
npm install -g serve
serve .
```

Visit `http://localhost:3000` or `http://localhost:8080`

### Using Ruby

```bash
cd /path/to/seedalias
ruby -run -ehttpd . -p8000
```

Visit `http://localhost:8000`

### Using PHP

```bash
cd /path/to/seedalias
php -S localhost:8000
```

Visit `http://localhost:8000`

---

## Static Hosting

### GitHub Pages

**Advantages:**
- Free hosting
- Easy to set up
- Automatic HTTPS
- Good performance

**Setup:**

1. **Push code to GitHub:**
   ```bash
   git push origin main
   ```

2. **Enable GitHub Pages:**
   - Go to repository Settings
   - Scroll to "GitHub Pages" section
   - Select source: "main branch" or "main/docs"
   - Save

3. **Access your site:**
   ```
   https://yourusername.github.io/seedalias
   ```

**Configuration (optional):**

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy
        uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: .
```

### Netlify

**Advantages:**
- Intuitive UI
- Automatic deployments
- Built-in HTTPS
- Good free tier

**Setup:**

1. **Sign up at** [netlify.com](https://netlify.com)

2. **Connect GitHub:**
   - Click "New site from Git"
   - Authorize GitHub
   - Select repository

3. **Configure:**
   - Build command: (leave empty - no build needed)
   - Publish directory: `.`

4. **Deploy:**
   - Netlify automatically deploys on push
   - View site at `your-site-name.netlify.app`

### Vercel

**Advantages:**
- Automatic HTTPS
- Global CDN
- Excellent performance
- Free tier available

**Setup:**

1. **Sign up at** [vercel.com](https://vercel.com)

2. **Import project:**
   - Click "New Project"
   - Select GitHub repository
   - Click "Import"

3. **Deploy:**
   - Vercel handles deployment automatically
   - Access at `seedalias.vercel.app`

### Cloudflare Pages

**Advantages:**
- Global edge network
- Free tier
- Automatic HTTPS
- DDoS protection

**Setup:**

1. **Sign up at** [pages.cloudflare.com](https://pages.cloudflare.com)

2. **Connect GitHub:**
   - Click "Create a project"
   - Connect GitHub account
   - Select repository

3. **Configure:**
   - Build command: (leave empty)
   - Build output directory: `.`

4. **Deploy:**
   - Automatically deploys on push
   - Access at `seedalias.pages.dev`

### Traditional Web Hosting (cPanel, etc.)

**Setup:**

1. **Create seedalias folder** in public_html
2. **Upload files:**
   ```bash
   scp -r ./* username@host:/public_html/seedalias/
   ```

3. **Set permissions:**
   ```bash
   chmod 755 /public_html/seedalias
   chmod 644 /public_html/seedalias/*.html
   chmod 644 /public_html/seedalias/*.js
   chmod 644 /public_html/seedalias/*.css
   ```

4. **Configure HTTPS:**
   - Use AutoSSL (usually automatic)
   - Or install Let's Encrypt certificate

5. **Access at:**
   ```
   https://yourdomain.com/seedalias/
   ```

---

## Docker Deployment

### Simple Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy application files
COPY index.html ./
COPY crypto.js ./
COPY scramble.js ./
COPY style.css ./
COPY docs/ ./docs/
COPY donation-qrcode.jpeg ./

# Install lightweight HTTP server
RUN npm install -g http-server

# Expose port
EXPOSE 8080

# Start server
CMD ["http-server", "-p", "8080"]
```

### Using Nginx

```dockerfile
FROM nginx:alpine

# Copy application
COPY . /usr/share/nginx/html/

# Copy nginx config
COPY nginx.conf /etc/nginx/nginx.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
```

**nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;

    root /usr/share/nginx/html;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_types text/html text/css text/javascript application/javascript;

    # Security headers
    add_header X-Content-Type-Options nosniff;
    add_header X-Frame-Options SAMEORIGIN;
    add_header X-XSS-Protection "1; mode=block";

    # Cache control
    location ~* \.(js|css)$ {
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

### Building and Running

```bash
# Build image
docker build -t seedalias:latest .

# Run container
docker run -p 8080:8080 seedalias:latest

# Push to Docker Hub
docker tag seedalias:latest username/seedalias:latest
docker push username/seedalias:latest
```

### Docker Compose

```yaml
version: '3.8'

services:
  seedalias:
    build: .
    ports:
      - "8080:8080"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

---

## Security Considerations for Deployment

### HTTPS (TLS/SSL)

⚠️ **CRITICAL:** Always use HTTPS in production.

**Why:**
- Protects data in transit
- Prevents man-in-the-middle attacks
- Required for Web Crypto API on production
- Browser security best practice

**Setup:**
- Free: Let's Encrypt (via Certbot, cPanel, or hosting provider)
- Automatic: GitHub Pages, Netlify, Vercel, Cloudflare all provide free HTTPS

### Security Headers

Configure HTTP security headers:

```
Strict-Transport-Security: max-age=31536000; includeSubDomains
X-Content-Type-Options: nosniff
X-Frame-Options: SAMEORIGIN
X-XSS-Protection: 1; mode=block
Content-Security-Policy: default-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com https://fonts.googleapis.com
Referrer-Policy: strict-origin-when-cross-origin
```

**Implementation (varies by host):**

**Netlify:** netlify.toml
```toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Content-Type-Options = "nosniff"
    X-Frame-Options = "SAMEORIGIN"
    X-XSS-Protection = "1; mode=block"
```

**Vercel:** vercel.json
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {"key": "X-Content-Type-Options", "value": "nosniff"},
        {"key": "X-Frame-Options", "value": "SAMEORIGIN"}
      ]
    }
  ]
}
```

### Content Security Policy (CSP)

Restricts where resources can load from:

```
Content-Security-Policy: 
  default-src 'self'; 
  script-src 'self' https://cdn.jsdelivr.net; 
  style-src 'self' https://cdn.jsdelivr.net https://cdnjs.cloudflare.com; 
  font-src 'self' https://cdnjs.cloudflare.com; 
  img-src 'self' data:
```

### Disable Caching for HTML

Prevent browsers from caching index.html:

```
index.html:
  Cache-Control: no-cache, no-store, must-revalidate
  Pragma: no-cache
  Expires: 0
```

**Why:** Ensures users get latest version with security fixes.

### Subresource Integrity (SRI)

Verify external resources haven't been tampered with:

```html
<!-- Add integrity hashes to CDN resources in index.html -->
<link rel="stylesheet" 
      href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css"
      integrity="sha384-..."
      crossorigin="anonymous">

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-..."
        crossorigin="anonymous"></script>
```

### CORS Headers

Prevent unauthorized cross-origin requests:

```
Access-Control-Allow-Origin: https://your-domain.com
Access-Control-Allow-Methods: GET, HEAD, OPTIONS
Access-Control-Max-Age: 86400
```

---

## Performance Optimization

### Enable Gzip Compression

Most hosts automatically enable this. Verify:

```bash
curl -I -H "Accept-Encoding: gzip" https://your-site.com/

# Should show: Content-Encoding: gzip
```

### Minify Assets

Reduce file sizes (optional, minimal impact for this project):

```bash
# Install minifiers
npm install -g terser cleancss

# Minify JavaScript
terser crypto.js -o crypto.min.js
terser scramble.js -o scramble.min.js

# Minify CSS
cleancss style.css -o style.min.css
```

Update index.html to use minified versions.

### Optimize External Resources

**Current CDN resources:**
- Bootstrap CSS (~200 KB minified)
- Bootstrap JS (~80 KB minified)
- Font Awesome (~120 KB)

All are already minified and serve from CDN (cached globally).

### Lazy Load Documentation

Move docs folder outside root if not needed:
- Keeps deployment size small
- Reduces initial load
- Still accessible if needed

---

## Monitoring

### Health Check

Create a simple status page:

```javascript
// Add to index.html for monitoring
window.addEventListener('load', () => {
  // Test Web Crypto API availability
  if (!window.crypto || !window.crypto.subtle) {
    console.error('Web Crypto API not available');
    document.body.innerHTML = 'Browser not supported';
  }
});
```

### Analytics

Add privacy-respecting analytics (optional):

```html
<!-- Plausible Analytics (privacy-first, no cookies) -->
<script defer data-domain="your-domain.com" 
        src="https://plausible.io/js/script.js"></script>
```

⚠️ **Do NOT use Google Analytics or similar** - they send data to external servers.

### Error Reporting

Optional error tracking (client-only):

```javascript
window.addEventListener('error', (event) => {
  console.error('Application error:', event.error);
  // Optionally send to monitoring service
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled promise rejection:', event.reason);
});
```

### Uptime Monitoring

Services to check site is online:

- UptimeRobot (free tier)
- Pingdom
- Statuspage.io

---

## Troubleshooting Deployment

### Issue: "Seed Alias works locally but not deployed"

**Checklist:**
- [ ] All files uploaded (including crypto.js, scramble.js)
- [ ] File paths are correct (check browser console)
- [ ] HTTPS enabled (required for Web Crypto API)
- [ ] File permissions correct (644 for files, 755 for directories)
- [ ] CDN resources loading (check Network tab)

### Issue: "External resources not loading"

**Solutions:**
- Clear browser cache (Ctrl+Shift+Delete)
- Check Network tab for failed requests
- Verify CDN URLs are correct
- Check CORS if loading cross-origin

### Issue: "Encryption/Decryption not working"

**Check:**
- Browser console for errors (F12)
- Web Crypto API available (should work in all modern browsers)
- HTTPS enabled (required for crypto)
- Try different browser

---

## Rollback Procedure

**Git rollback:**
```bash
# Revert to previous version
git revert HEAD
git push

# Netlify/Vercel automatically redeploy
```

**Manual rollback:**
1. Restore previous version from backups
2. Re-upload to server
3. Clear CDN cache if applicable

---

## Maintenance

### Regular Tasks

- **Monthly:** Check for updates to Bootstrap, Font Awesome
- **Quarterly:** Review security headers, HTTPS certificate
- **As needed:** Monitor error reports, fix issues

### Update External Dependencies

```html
<!-- Check for new versions -->
<!-- Current: Bootstrap 5.3.0 -->
<!-- Current: Font Awesome 6.0 -->

<!-- Update in index.html as needed -->
```

---

## Summary

**Easiest deployment:** GitHub Pages or Netlify (5 minutes)

**Best performance:** Cloudflare Pages or Vercel (5 minutes)

**Maximum control:** Your own server with Docker (15 minutes)

All options provide HTTPS, global CDN, and excellent performance for this static application.

---

For questions or issues, see [TROUBLESHOOTING.md](TROUBLESHOOTING.md) or [CONTRIBUTING.md](CONTRIBUTING.md).
