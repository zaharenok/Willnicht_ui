# Willnicht — AI Product Evaluation for Marketplaces

**Willnicht** is a SaaS platform that helps expats and foreigners sell products on local marketplaces (willhaben.at, eBay Kleinanzeigen, etc.) by overcoming language barriers through AI-powered product evaluation.

## 🎯 Mission

Help foreigners in Austria sell items on willhaben.at without knowing German by providing:
- ✅ AI-generated descriptions in German
- ✅ Market price analysis for Austria
- ✅ Ready-to-use listings for marketplaces
- ✅ Automatic publication integration

## ✨ Features

- **AI-Powered Analysis**: Upload product photos and get instant AI evaluation
- **Multi-Language Support**: Interface in Russian, English, and German
- **Marketplace Integration**: Ready-to-use descriptions for willhaben.at
- **Price Intelligence**: Market price range and recommended selling price
- **Bulk Upload**: Support for up to 10 photos simultaneously
- **History Management**: All evaluations saved locally with export to CSV
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Quick Start

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server required - runs entirely in the browser

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/zaharenok/Willnicht_ui.git
   cd Willnicht_ui
   ```

2. **Open the application**
   - Simply open `index.html` in your browser for the landing page
   - Or open `app.html` for the main application

3. **Start a local server (optional)**
   ```bash
   # Using Python
   python3 -m http.server 8000
   
   # Using Node.js
   npx http-server -p 8000
   ```
   Then navigate to `http://localhost:8000`

## 📖 Usage

### 1. Landing Page

Visit the landing page to learn about the service, view pricing plans, and understand how it works.

### 2. Upload Photos

1. Click "Начать бесплатно" (Start Free) or navigate to `app.html`
2. Enter your email to log in
3. Drag and drop photos or click to select files (up to 10 photos)
4. Add optional details (brand, size, condition, defects)
5. Select your language and marketplace language
6. Click "Получить оценку" (Get Evaluation)

### 3. View Results

- **Latest Result**: Appears in the right panel immediately
- **History**: All previous evaluations appear in the history section
- Each result includes:
  - Product image
  - German title and description
  - Market price range
  - Recommended selling price
  - Category

### 4. Publish

- **Copy Description**: Copy the German description to clipboard
- **Publish to willhaben**: Opens willhaben.at in a new tab for manual publication

### 5. Export

- Click "Экспорт" (Export) to download all results as CSV
- Click "Очистить" (Clear) to remove all saved results

## 🔧 Configuration

### Webhook Integration

The application sends data to a Make.com webhook endpoint for AI processing:

```javascript
const CONFIG = {
    webhookUrl: 'https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3',
    userEmail: 'olegzakharchenko@gmail.com',
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};
```

**To use your own webhook:**
1. Edit `app.js` and update `CONFIG.webhookUrl`
2. Configure your webhook to handle multipart form data with fields:
   - `email`: User email
   - `user_language`: User's interface language
   - `marketplace_language`: Target marketplace language
   - `source_url`: Source URL
   - `additional_text`: Additional product details
   - `image`: Product photo(s)

### Webhook Response Format

Expected JSON response:

```json
{
    "german_title": "Schützer für Handgelenke zu verkaufen",
    "german_text": "Ich verkaufe neue Handgelenkschützer...",
    "category": "Sportausrüstung",
    "market_price": "25 EUR",
    "suggested_price": "15 EUR",
    "user_language_title": "Защитные наколенники",
    "user_language_text": "Продаю новые защитные...",
    "ID": "947385",
    "item": "Schützer für Handgelenke"
}
```

For multiple images, return an array of objects.

## 📁 Project Structure

```
Willnicht_ui/
├── index.html              # Landing page
├── app.html                # Main application
├── app.js                  # Application logic
├── i18n.js                 # Internationalization
├── styles.css              # Styling
├── README.md               # This file
├── business_logic.md       # Business model documentation
├── site_logic.md           # Site logic and user journey
├── WEBHOOK_API.md          # Webhook API documentation
├── COOKIES_IMPORT_GUIDE.md # Cookie import guide for testing
├── test_app.html           # Test page
├── test_app.js             # Test scripts
├── debug_webhook.py        # Webhook debugging script
├── import_cookies_to_chrome.py # Cookie import automation
└── .gitignore              # Git ignore rules
```

## 🎨 Design System

Based on [solt.ws](https://www.solt.ws/) design principles:

### Color Palette
```css
--color-background: #FFFFFF;
--color-text: #000000;
--color-accent: #FF3B30;
--color-secondary: #F5F5F5;
--color-border: #E5E5E5;
--color-success: #34C759;
--color-muted: #8E8E93;
```

### Typography
- **Headings**: Inter Bold / Germania One
- **Body**: Inter Regular
- **Accents**: Inter Medium

## 💰 Pricing Plans

| Plan | Price | Evaluations | Features |
|------|-------|-------------|----------|
| **Free** | €0/month | 3/month | Basic description, price range |
| **Starter** | €9/month | 30/month | Full descriptions, ready listings, history |
| **Pro Monthly** | €99/month | Unlimited | Bulk upload (50 photos), export CSV, SEO descriptions |
| **Pro Yearly** | €679/year | Unlimited | All Pro features + 2 months free, priority support |

## 🧪 Testing

### Test with Mock Data

The application includes a demo mode that generates mock results if the webhook is unavailable.

### Webhook Testing

Use the provided Python script to test the webhook:

```bash
python3 debug_webhook.py
```

### Cookie Import for willhaben.at Testing

For testing the willhaben.at integration:

```bash
# Option 1: Use the Python script
python3 import_cookies_to_chrome.py

# Option 2: Use EditThisCookie extension
# 1. Install EditThisCookie from Chrome Web Store
# 2. Open willhaben.at
# 3. Import oleg.willhaben.at_cookies.json
```

⚠️ **Important**: Never commit cookie files to GitHub!

## 🔒 Security

- All data is processed client-side
- Images are sent to webhook for AI analysis
- No sensitive data is stored on servers
- Cookie files are excluded from version control (see `.gitignore`)

## 🌐 Internationalization

The application supports three languages:
- **Russian** (RU) - Default
- **English** (EN)
- **German** (DE)

Language can be switched from the header dropdown.

## 📝 API Documentation

For detailed webhook API documentation, see [`WEBHOOK_API.md`](WEBHOOK_API.md:1).

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📧 Contact

- **GitHub**: https://github.com/zaharenok
- **Email**: olegzakharchenko@gmail.com
- **Issues**: https://github.com/zaharenok/Willnicht_ui/issues

## 🙏 Acknowledgments

- Design inspiration from [solt.ws](https://www.solt.ws/)
- AI processing powered by Make.com
- Icons from [Heroicons](https://heroicons.com/)

## 🗺️ Roadmap

### Phase 1: MVP ✅
- [x] Landing page
- [x] Photo upload
- [x] Webhook integration
- [x] Result display
- [x] Responsive design

### Phase 2: Monetization 🚧
- [ ] User authentication
- [ ] Payment integration (Stripe)
- [ ] Subscription management
- [ ] Usage limits

### Phase 3: Growth 📋
- [ ] Bulk upload (50+ photos)
- [ ] Browser extension for willhaben.at
- [ ] Telegram bot
- [ ] eBay Kleinanzeigen integration

### Phase 4: Scale 🚀
- [ ] API for developers
- [ ] White-label solution
- [ ] Multi-marketplace support
- [ ] Enterprise features

---

**Made with ❤️ for expats in Austria**
