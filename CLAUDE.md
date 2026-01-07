# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Willnicht** is a SaaS platform for AI-powered product evaluation targeting expats selling goods on Austrian marketplaces (willhaben.at). Users upload product photos and receive German descriptions, market prices, and ready-to-publish listings.

**Repository**: https://github.com/zaharenok

**Tech Stack**: Pure HTML/CSS/JavaScript (no frameworks)

## File Structure

- `index.html` - Landing page (Hero, Features, How it Works, Pricing sections)
- `app.html` - Main application (login, upload, results)
- `app.js` - Core application logic
- `i18n.js` - Internationalization (Russian, English, German)
- `styles.css` - All styling
- `business_logic.md` - Business model, pricing, monetization strategy
- `site_logic.md` - User journey and UI architecture

## Core Application Flow

1. User enters email on `app.html` (stored in localStorage)
2. Uploads up to 10 images (JPG/PNG/WebP, max 10MB each)
3. Images sent via multipart FormData to Make.com webhook
4. Webhook returns JSON with: `title`, `description`, `category`, `price_min`, `price_max`, `recommended_price`
5. Results displayed in split view: latest result + history grid
6. Results stored in localStorage (`willnicht_results` key)
7. Results expire after 15 minutes (countdown timer shown)

## Key Architecture Concepts

### State Management
- Global `state` object in `app.js` tracks: `files`, `results`, `isLoading`
- All state changes trigger UI updates via render functions
- LocalStorage used for persistence (user email, results, language preference)

### Internationalization
- `i18n.js` provides `t(key)` function for translations
- Three languages: `ru` (default), `en`, `de`
- Language stored in `localStorage.willnicht_lang`
- DOM elements with `data-i18n` attribute auto-update on language change

### Webhook Integration
- Endpoint: `https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3`
- Method: POST with multipart FormData
- Fields: `email`, `user_language`, `marketplace_language`, `source_url`, `image` (files)
- Response format: Array of objects or single object with product data
- Fallback: Demo mode generates mock data on webhook failure

### Split View Results Layout
- Latest result shown in full-width "Latest Result" container
- Historical results shown in grid below (all results except first)
- Controlled by `isLatest` parameter in `renderResultCard()`

### Authentication
- Simple email-based login (no password, no backend auth)
- User email stored in `localStorage.user_email`
- Login state controls visibility of `#loginSection` vs `#appWrapper`

## Important Implementation Details

### File Upload
- Drag & drop + file input selection
- Client-side validation: file type, size (10MB), max count (10)
- Preview images rendered as base64 data URLs
- Files stored in `state.files` array until submission

### Result Cards
Each result contains:
- `id`: Unique identifier
- `title`: Product name
- `description`: German description from AI
- `category`: Product category
- `marketPrice`: `{min, max, currency: 'EUR'}`
- `recommendedPrice`: Suggested selling price
- `image`: Base64 preview image
- `createdAt`: ISO timestamp
- `expiresAt`: Unix timestamp (15 min from creation)

### Actions
- **Copy**: Copies title, description, and price to clipboard
- **Auto-publish**: Disabled for Pro only (button with `btn-disabled-pro` class)
- **Export CSV**: Downloads all results as CSV file
- **Clear**: Removes all results from state and localStorage

### Notifications
- Toast notifications appear bottom-right
- Types: success, error, warning, info
- Auto-dismiss after 4 seconds
- Inline styles injected dynamically via JS

## Configuration (app.js:9-28)

Key constants in `CONFIG` object:
- `webhookUrl`: Make.com endpoint
- `userEmail`: Default user email
- `maxFiles`: 10
- `maxFileSize`: 10MB
- `allowedTypes`: ['image/jpeg', 'image/png', 'image/webp']
- `storageKey`: 'willnicht_results'

## Business Context

### Target Market
- Primary: Expats in Austria selling on willhaben.at (~200K in Vienna)
- Secondary: Foreign students, dropshippers, resellers
- Future expansion: Germany (eBay Kleinanzeigen), other EU markets

### Pricing Model
- **Free**: 3 evaluations/month, basic features
- **Starter**: €9/mo, 30 evaluations/month, ready listings
- **Pro Monthly**: €99/mo, unlimited evaluations, bulk upload (50 photos), export
- **Pro Yearly**: €679/year (~€56/mo, 43% discount)

### Language Strategy
- User's language: Interface language (ru/en/de)
- Marketplace language: Output description language (German for Austria)
- Both selectable in settings dropdowns

## Known Limitations

1. **No willhaben.at API**: Marketplace doesn't provide public API
   - Current workaround: Manual copy-paste of generated content
   - Future: Browser extension or partnership

2. **Demo Mode**: Webhook failures trigger mock data generation
   - Located in `generateMockResults()` function
   - Uses hardcoded sample items

3. **No Real Backend**: All client-side storage
   - Results lost when clearing browser data
   - No user accounts beyond localStorage email

## Development Commands

### Start Local Server
```bash
# Python 3 (built-in HTTP server)
python3 -m http.server 8000

# Node.js (using test_app.js)
node test_app.js  # Runs on port 3000
```

### Test Webhook Integration
```bash
# Test webhook without image (basic connectivity)
python3 test_webhook.py

# Test webhook with real photo upload
python3 test_real_photo.py

# Or test webhook with Python directly
python3 - << 'EOF'
import requests
requests.post("https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3",
    data={"email": "test@example.com", "user_language": "Russian",
          "marketplace_language": "German", "source_url": "http://localhost:8000"})
EOF
```

### File Validation
```bash
# Check app.js syntax
node -c app.js

# Check i18n.js syntax
node -c i18n.js
```

## Development Notes

- **No build process required** - Pure HTML/CSS/JS, open files directly in browser
- **Production hosting**: Any static host (Netlify, Vercel, GitHub Pages)
- **Important**: Update webhook URL in CONFIG (app.js:11) for production environment
- **Local testing**: Use `python3 -m http.server 8000` or `node test_app.js`
- **Browser redirects**: May encounter issues with localhost/127.0.0.1 due to hosts file or browser extensions - try different ports if needed

## Critical Code Sections

### Webhook Integration (app.js:300-380)
- `handleAnalyze()` - Main function that sends FormData to Make.com
- `generateMockResults()` - Fallback when webhook fails (lines 408-455)
- Webhook expects: `email`, `user_language`, `marketplace_language`, `source_url`, `image` (files)
- Response format: Array of objects with `title`, `description`, `category`, `price_min`, `price_max`, `recommended_price`

### Results Expiration Timer (app.js:550-620)
- Results expire after 15 minutes (countdown timer)
- `initTimer()` - Updates every second, removes expired results
- `expiresAt` timestamp stored with each result

### Authentication Flow (app.js:650-750)
- Email-based login only (no password)
- `initAuth()` checks `localStorage.user_email` on load
- Login state toggles `#loginSection` vs `#appWrapper` visibility
