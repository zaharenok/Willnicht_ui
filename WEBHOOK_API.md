# Webhook API Documentation

## Overview

Willnicht frontend sends multipart form data to Make.com webhook endpoint for AI-powered product evaluation.

**Webhook URL:** `https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3`

**Method:** `POST`

**Content-Type:** `multipart/form-data` (automatically set by browser)

---

## Request Format

### Fields Sent to Webhook

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `email` | string | Yes | User email address | `olegzakharchenko@gmail.com` |
| `user_language` | string | Yes | User's interface language | `Russian`, `English`, `German` |
| `marketplace_language` | string | Yes | Target marketplace language for descriptions | `German`, `English`, `Russian` |
| `source_url` | string | Yes | URL where request originated | `https://www.willnicht.com/app#form1` |
| `additional_text` | string | No | Additional product details from user (brand, size, condition, defects) | `Это винтажная вещь, учти дефекты...` |
| `image` | file | Yes | Product photo (can be multiple) | JPG/PNG/WebP up to 10MB |

### Example cURL Request

```bash
curl -X POST "https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3" \
  -F "email=olegzakharchenko@gmail.com" \
  -F "user_language=Russian" \
  -F "marketplace_language=German" \
  -F "source_url=https://www.willnicht.com/app#form1" \
  -F "additional_text=Тестовое дополнительное описание товара" \
  -F "image=@/path/to/product-image.jpg"
```

---

## Response Format

### Expected JSON Response Structure

The webhook should return a **JSON object** (or array of objects for multiple images) with the following fields:

| Field Name | Type | Required | Description | Example |
|------------|------|----------|-------------|---------|
| `german_title` | string | Yes | Product title in German | `Schützer für Handgelenke zu verkaufen` |
| `german_text` | string | Yes | Product description in German (SEO-optimized) | `Ich verkaufe neue Handgelenkschützer...` |
| `category` | string | Yes | Product category | `Sportausrüstung`, `Möbel`, `Elektronik` |
| `market_price` | string | Yes | Market price with currency | `25 EUR`, `50-75 EUR` |
| `suggested_price` | string | Yes | Recommended selling price with currency | `15 EUR` |
| `user_language_title` | string | No | Product title in user's language | `Защитные наколенники` |
| `user_language_text` | string | No | Description in user's language | `Продаю новые защитные...` |
| `ID` | string | No | Internal product ID | `947385` |
| `item` | string | No | Product name (fallback) | `Schützer für Handgelenke` |

### Example Response

```json
{
    "ID": "947385",
    "item": "Schützer für Handgelenke",
    "market_price": "25 EUR",
    "suggested_price": "15 EUR",
    "user_language_title": "Защитные наколенники для роликовых коньков",
    "german_title": "Schützer für Handgelenke zu verkaufen",
    "user_language_text": "Продаю новые защитные наколенники для роликовых коньков. Подходят для детей и взрослых...",
    "german_text": "Ich verkaufe neue Handgelenkschützer für Rollschuhe. Sie sind sowohl für Kinder als auch für Erwachsene geeignet...",
    "category": "Sportausrüstung"
}
```

### Multiple Images Response

If multiple images are uploaded, return an **array of objects**:

```json
[
    {
        "german_title": "Vintage Omega Uhr",
        "german_text": "Mechanische Omega Seamaster...",
        "category": "Uhren & Schmuck",
        "market_price": "200 EUR",
        "suggested_price": "179 EUR"
    },
    {
        "german_title": "iPhone 13 Pro 256GB",
        "german_text": "Apple iPhone 13 Pro in Graphit...",
        "category": "Handys & Smartphones",
        "market_price": "600 EUR",
        "suggested_price": "599 EUR"
    }
]
```

---

## Frontend Processing

### How the Frontend Maps Response

```javascript
// Price parsing: "25 EUR" → 25
const marketPriceNum = parseFloat("25 EUR".replace(/[^\d.,]/g, '').replace(',', '.'));

// Market price range calculation (±20%)
marketPrice: {
    min: Math.round(marketPriceNum * 0.8),  // 20
    max: Math.round(marketPriceNum * 1.2),  // 30
    currency: 'EUR'
}

// Field mapping
{
    title: item.german_title || item.item,
    description: item.german_text,
    category: item.category,
    recommendedPrice: parseFloat(suggested_price),
    image: preview_image_base64
}
```

---

## Make.com Setup Instructions

### Webhook Module Configuration

1. **Create Webhook**
   - Add "Webhook" module in Make.com
   - Set method to `POST`
   - Copy the webhook URL to frontend `CONFIG.webhookUrl`

2. **Configure Data Routing**
   - Parse multipart form data fields:
     - `email` → Text
     - `user_language` → Text
     - `marketplace_language` → Text
     - `source_url` → Text
     - `additional_text` → Text (optional)
     - `image` → File (can be multiple)

3. **AI Processing Flow**
   - Send image to AI vision model (GPT-4 Vision, Claude 3.5, etc.)
   - Include `additional_text` in prompt for context
   - Generate product analysis:
     - Identify product category
     - Create German SEO-optimized description
     - Research willhaben.at for similar items
     - Calculate market price range
     - Suggest optimal selling price

4. **Webhook Response Module**
   - Add "Webhook Response" module at the end
   - Set status to `200`
   - Return JSON object with required fields
   - Set `Content-Type` to `application/json`

### Example Make.com Scenario

```
1. Webhook (Receive data)
   ↓
2. HTTP / Get File (Retrieve image from webhook data)
   ↓
3. OpenAI (GPT-4 Vision) / Analyze Image
   - Prompt: "Analyze this product image for willhaben.at marketplace.
              Context: {additional_text}
              Output: German title, description, category, market price"
   ↓
4. HTTP / Search willhaben.at (Optional: Price research)
   ↓
5. Calculator (Calculate suggested price)
   ↓
6. Webhook Response (Return JSON)
```

---

## Error Handling

### Frontend Behavior

- **Success (200 OK)**: Parse JSON response, display results
- **Error/Timeout**: Show notification, fallback to demo mode with mock data
- **Invalid JSON**: Log error, show error notification

### Example Error Response

```json
{
    "error": "AI service unavailable",
    "message": "Unable to process image at this time"
}
```

---

## Testing

### Test with cURL

```bash
# Single image
curl -X POST "https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3" \
  -F "email=test@example.com" \
  -F "user_language=Russian" \
  -F "marketplace_language=German" \
  -F "source_url=https://willnicht.at/test" \
  -F "additional_text=Vintage item, minor scratches" \
  -F "image=@test-image.jpg"

# Multiple images
curl -X POST "https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3" \
  -F "email=test@example.com" \
  -F "user_language=Russian" \
  -F "marketplace_language=German" \
  -F "source_url=https://willnicht.at/test" \
  -F "image=@image1.jpg" \
  -F "image=@image2.jpg" \
  -F "image=@image3.jpg"
```

### Verify Response

```bash
# Pretty print JSON response
curl -s -X POST "WEBHOOK_URL" \
  -F "email=test@example.com" \
  -F "image=@test.jpg" | python3 -m json.tool
```

---

## Security Considerations

1. **Rate Limiting**: Implement rate limiting on webhook (e.g., 100 requests/hour per email)
2. **File Validation**: Validate file types, sizes on backend (Make.com can use Router filter)
3. **Input Sanitization**: Sanitize all text inputs to prevent injection attacks
4. **CORS**: Ensure webhook allows requests from `willnicht.at` domain
5. **Authentication**: Consider adding API key or HMAC signature for production

---

## Configuration

### Frontend Config (`app.js`)

```javascript
const CONFIG = {
    webhookUrl: 'https://hook.eu1.make.com/9kor8vv2jkg97h95vs561rg10wxm99g3',
    userEmail: 'olegzakharchenko@gmail.com',
    maxFiles: 10,
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp']
};
```

### Update for Production

Change `CONFIG.webhookUrl` to production webhook URL before deployment.

---

## Future Enhancements

- [ ] Add webhook authentication (API key)
- [ ] Implement async processing with webhook callbacks
- [ ] Add bulk upload support (50+ images)
- [ ] Return confidence scores for AI predictions
- [ ] Include similar items from marketplace
- [ ] Add SEO keywords and tags in response
- [ ] Support for video uploads
- [ ] Multi-language descriptions for other marketplaces

---

## Support

For issues or questions:
- GitHub: https://github.com/zaharenok
- Email: olegzakharchenko@gmail.com

---

**Last Updated:** 2026-01-03
