# Leo's Cafe - WhatsApp Order Confirmation Server

A standalone Node.js server for sending and managing WhatsApp order confirmations for Leo's Cafe Next.js application.

## Overview

This server runs separately from the main Next.js application and handles:
- Sending WhatsApp confirmation messages for new orders
- Listening for customer responses (YES/NO)
- Auto-expiring unconfirmed orders after 5 minutes
- Updating order status via callback to the main API

## Prerequisites

- Node.js 18+
- A WhatsApp account (personal or business)
- WhatsApp installed on your phone for scanning QR code

## Installation

1. **Install dependencies:**
   ```bash
   cd whatsapp-server
   npm install
   ```

2. **Create `.env.local`:**
   ```bash
   cp .env.example .env.local
   ```

3. **Configure environment variables:**
   ```env
   # Required for production
   NEXT_JS_API_URL=http://localhost:3000  # URL of main Next.js app
   WHATSAPP_CALLBACK_SECRET=your-secret   # Optional: Bearer token for security
   ```

## Running the Server

### Development (Local)

```bash
npm start
```

On first run, you'll see a QR code in the terminal. Scan it with your WhatsApp to authenticate:

```
🚀 WhatsApp Order Confirmation Server running on port 3001
📱 WhatsApp Client initializing...
   - Sessions stored in: ./whatsapp-sessions
   - API endpoint: http://localhost:3001/send-confirmation

=== WHATSAPP QR CODE ===
Scan this QR code with your WhatsApp:
█████████████████████████
█ ▄▄▄▄▄ █▀ ▀█▀█ ▄▄▄▄▄ █
█ █   █ █▀▄▄██▀█ █   █ █
█ █ ▄ █ █▄▀▀▄▀▀█ █ ▄ █ █
█ █▄█▄█ ▀▀ ▀ ▀ █ █▄█▄█ █
█ ▄▄▄▄▄ █▄██▀▀▀█ ▄▄▄▄▄ █
█ ▄▄▄▄▄ █▀▄█▀▄▀█ ▄▄▄▄▄ █
█▄▄▄▄▄▄▄█ ▀ █▀▀█▄▄▄▄▄▄▄█
█████████████████████████
✅ WhatsApp authenticated successfully
✅ WhatsApp client is ready!
```

Once authenticated, the session is saved in `whatsapp-sessions/` and won't require rescanning on restart.

### Production

```bash
npm start
```

Ensure the `whatsapp-sessions` directory persists across deployments (e.g., use a persistent volume).

## API Endpoints

### POST /send-confirmation

Send a WhatsApp confirmation message to a customer.

**Request:**
```bash
curl -X POST http://localhost:3001/send-confirmation \
  -H "Content-Type: application/json" \
  -d {
    "orderId": "123e4567-e89b-12d3-a456-426614174000",
    "customerPhone": "+923001234567",
    "customerName": "John Doe",
    "orderItems": [
      { "name": "Loaded Pizza", "quantity": 2, "price": 1500 },
      { "name": "Shawarma", "quantity": 1, "price": 300 }
    ],
    "totalPrice": 3300
  }
```

**Response:**
```json
{
  "success": true,
  "message": "WhatsApp confirmation sent",
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "expiresIn": 300000
}
```

**Errors:**
- `400`: Missing required fields
- `503`: WhatsApp client not ready (still connecting)
- `500`: Failed to send message

### GET /status/:orderId

Get the current status of a WhatsApp confirmation.

**Request:**
```bash
curl http://localhost:3001/status/123e4567-e89b-12d3-a456-426614174000
```

**Response:**
```json
{
  "orderId": "123e4567-e89b-12d3-a456-426614174000",
  "status": "pending",
  "sentAt": "2024-01-15T10:30:00Z",
  "expiresAt": "2024-01-15T10:35:00Z"
}
```

Possible statuses:
- `pending`: Waiting for customer response
- `confirmed`: Customer replied YES
- `cancelled`: Customer replied NO
- `expired`: No response within 5 minutes

### GET /health

Health check endpoint.

**Request:**
```bash
curl http://localhost:3001/health
```

**Response:**
```json
{
  "status": "ready",
  "timestamp": "2024-01-15T10:30:00Z"
}
```

## Message Flow

1. **Customer places order:**
   - Next.js app calls `/api/orders/place`
   - If phone is not verified, order status = `pending_whatsapp_confirmation`

2. **Next.js calls WhatsApp server:**
   - Calls `POST /send-confirmation` with order details
   - WhatsApp server sends message: "Hi [name]! Your order... Reply YES or NO"

3. **Customer responds on WhatsApp:**
   - Server detects message in chat
   - If "YES": calls Next.js API `/api/orders/[id]/whatsapp-status` with `status: confirmed`
   - If "NO": calls Next.js API `/api/orders/[id]/whatsapp-status` with `status: cancelled`
   - Sends confirmation message to customer

4. **Auto-expiry:**
   - If no response in 5 minutes, automatically updates order to `expired`

## Session Persistence

WhatsApp sessions are stored in `whatsapp-sessions/` directory using LocalAuth strategy. This means:

- **First run:** Scan QR code in terminal
- **Subsequent runs:** Session restored automatically, no QR code needed
- **Restart safe:** Server can be restarted without losing authentication

## Troubleshooting

### QR Code Not Appearing

**Problem:** QR code should appear but doesn't

**Solutions:**
1. Ensure Node.js 18+ is installed: `node --version`
2. Check console output isn't truncated
3. Delete `whatsapp-sessions` and restart to force re-authentication

### WhatsApp Messages Not Sending

**Problem:** API returns 503 "WhatsApp client not ready"

**Solutions:**
1. Wait 10-15 seconds after starting - client needs time to connect
2. Check WhatsApp is logged in on your phone
3. Restart the server

### Session Lost After Restart

**Problem:** QR code reappears after server restart

**Solutions:**
1. Ensure `whatsapp-sessions/` directory exists and persists
2. Check file permissions: `ls -la whatsapp-sessions/`
3. Don't delete `whatsapp-sessions` directory when deploying

### Messages Going to Wrong Chat

**Problem:** Messages appear in "status" or wrong conversation

**Solutions:**
1. Verify phone number format: `+923001234567` (international format)
2. Ensure the number has an active WhatsApp account
3. Try messaging the contact first from your WhatsApp to ensure chat exists

## Deployment

### Local Network

Set `NEXT_JS_API_URL` in `.env.local`:
```env
NEXT_JS_API_URL=http://localhost:3000
```

### Production (Cloud Server)

1. **Install on cloud server** (e.g., DigitalOcean, AWS, Hetzner)
2. **Keep session persistent** (use volumes, not ephemeral storage)
3. **Set production URL:**
   ```env
   NEXT_JS_API_URL=https://leos-cafe.vercel.app
   WHATSAPP_CALLBACK_SECRET=your-secure-secret
   ```
4. **Use process manager** (e.g., PM2):
   ```bash
   npm install -g pm2
   pm2 start index.js --name "whatsapp-server"
   pm2 save
   ```

### Docker

```dockerfile
FROM node:18-alpine

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

# Create persistent volume for sessions
VOLUME /app/whatsapp-sessions

EXPOSE 3001
CMD ["npm", "start"]
```

```bash
docker build -t leos-cafe-whatsapp .
docker run -p 3001:3001 -v whatsapp-sessions:/app/whatsapp-sessions leos-cafe-whatsapp
```

## Environment Variables

| Variable | Required | Example | Notes |
|----------|----------|---------|-------|
| `NEXT_JS_API_URL` | Yes | `http://localhost:3000` | URL of main Next.js app |
| `WHATSAPP_CALLBACK_SECRET` | No | `your-secret` | Bearer token for security |

## Security Notes

- The server uses Bearer token authentication for callbacks (optional but recommended)
- All order data is in-memory; data is lost on restart (this is intentional)
- Sensitive data (phone numbers) is only logged with limited verbosity
- The WhatsApp session is stored locally in `whatsapp-sessions/`

## Logs

Check server logs for:
- Message sending status
- Customer responses
- Order status updates
- Errors and connection issues

Example log output:
```
📤 Sending WhatsApp confirmation for order 123e4567 to +923001234567
✅ Updated order 123e4567 status to confirmed
✅ Order 123e4567 confirmed via WhatsApp
```

## Support

For issues, check:
1. WhatsApp is authenticated on your phone
2. Internet connection is stable
3. `whatsapp-sessions/` directory exists
4. All environment variables are set correctly
5. Next.js app is running and accessible

## License

MIT
