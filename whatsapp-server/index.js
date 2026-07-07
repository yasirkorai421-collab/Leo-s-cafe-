/**
 * WhatsApp Order Confirmation Server
 * Standalone Node.js server for sending WhatsApp confirmations
 * Runs on port 3001
 */

const express = require('express');
const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = 3001;

// Middleware
app.use(express.json());

// In-memory store for order confirmations
const orderConfirmations = new Map();
const confirmationTimeouts = new Map();

// Initialize WhatsApp Client
const client = new Client({
  authStrategy: new LocalAuth({
    clientId: 'leos-cafe',
    dataPath: path.join(__dirname, 'whatsapp-sessions'),
  }),
});

let qrCodeGenerated = false;
let isReady = false;

// WhatsApp Events
client.on('qr', (qr) => {
  if (!qrCodeGenerated) {
    console.log('\n=== WHATSAPP QR CODE ===');
    console.log('Scan this QR code with your WhatsApp:');
    qrcode.toString(qr, { type: 'terminal' }, (err, url) => {
      if (err) console.error('QR Error:', err);
      console.log(url);
    });
    qrCodeGenerated = true;
  }
});

client.on('ready', () => {
  isReady = true;
  console.log('✅ WhatsApp client is ready!');
});

client.on('authenticated', () => {
  console.log('✅ WhatsApp authenticated successfully');
  qrCodeGenerated = false;
});

client.on('auth_failure', (msg) => {
  console.error('❌ Authentication failed:', msg);
});

client.on('disconnected', (reason) => {
  console.log('❌ WhatsApp disconnected:', reason);
  isReady = false;
});

// Listen for incoming messages
client.on('message', async (message) => {
  const from = message.from;
  const body = message.body.toUpperCase().trim();

  // Find matching order
  const [orderId, phone] = Array.from(orderConfirmations.entries()).find(
    ([_, data]) => data.phone === from
  ) || [null, null];

  if (!orderId) {
    console.log(`Message from ${from} (no order found): ${body}`);
    return;
  }

  const confirmation = orderConfirmations.get(orderId);

  if (body === 'YES' || body === '✅' || body === '1') {
    console.log(`✅ Order ${orderId} confirmed via WhatsApp`);
    
    // Call Supabase API to mark as confirmed
    await updateOrderStatus(orderId, 'confirmed');
    
    // Clear timeout
    clearTimeout(confirmationTimeouts.get(orderId));
    confirmationTimeouts.delete(orderId);
    
    // Send confirmation message
    await message.reply('✅ Order confirmed! Your order will be prepared shortly. You will receive a notification when it\'s ready.');
    
    // Update local store
    confirmation.status = 'confirmed';
  } else if (body === 'NO' || body === '❌' || body === '0') {
    console.log(`❌ Order ${orderId} cancelled via WhatsApp`);
    
    // Call Supabase API to mark as cancelled
    await updateOrderStatus(orderId, 'cancelled');
    
    // Clear timeout
    clearTimeout(confirmationTimeouts.get(orderId));
    confirmationTimeouts.delete(orderId);
    
    // Send cancellation message
    await message.reply('❌ Order cancelled. You can place a new order anytime. Thank you!');
    
    // Update local store
    confirmation.status = 'cancelled';
  }
});

/**
 * POST /send-confirmation
 * Trigger WhatsApp confirmation message
 */
app.post('/send-confirmation', async (req, res) => {
  try {
    if (!isReady) {
      return res.status(503).json({ error: 'WhatsApp client not ready' });
    }

    const { orderId, customerPhone, customerName, orderItems, totalPrice } = req.body;

    // Validate required fields
    if (!orderId || !customerPhone || !customerName || !orderItems || !totalPrice) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Format phone number for WhatsApp (add @c.us for WhatsApp format)
    const formattedPhone = customerPhone.replace(/\D/g, '');
    const whatsappId = `${formattedPhone}@c.us`;

    // Build message
    const itemsList = orderItems
      .map((item) => `• ${item.name} x${item.quantity} - Rs.${item.price}`)
      .join('\n');

    const message = `Hi ${customerName}! 👋

Your order at Leo's Cafe:
${itemsList}

Total: Rs.${totalPrice}

Please reply:
✅ YES - to confirm
❌ NO - to cancel

⏱️ This will expire in 5 minutes`;

    // Send message
    console.log(`📤 Sending WhatsApp confirmation for order ${orderId} to ${customerPhone}`);
    await client.sendMessage(whatsappId, message);

    // Store confirmation details
    const timeout = 5 * 60 * 1000; // 5 minutes
    orderConfirmations.set(orderId, {
      orderId,
      phone: whatsappId,
      customerPhone,
      customerName,
      status: 'pending',
      sentAt: new Date(),
      expiresAt: new Date(Date.now() + timeout),
    });

    // Auto-expire after timeout
    const timeoutId = setTimeout(async () => {
      const confirmation = orderConfirmations.get(orderId);
      if (confirmation && confirmation.status === 'pending') {
        console.log(`⏱️ Order ${orderId} confirmation expired`);
        await updateOrderStatus(orderId, 'expired');
        confirmation.status = 'expired';
      }
    }, timeout);

    confirmationTimeouts.set(orderId, timeoutId);

    res.json({ 
      success: true, 
      message: 'WhatsApp confirmation sent',
      orderId,
      expiresIn: timeout 
    });
  } catch (error) {
    console.error('Error sending confirmation:', error);
    res.status(500).json({ error: 'Failed to send confirmation', details: error.message });
  }
});

/**
 * GET /status/:orderId
 * Get current confirmation status
 */
app.get('/status/:orderId', (req, res) => {
  const { orderId } = req.params;
  const confirmation = orderConfirmations.get(orderId);

  if (!confirmation) {
    return res.status(404).json({ error: 'Order not found' });
  }

  res.json({
    orderId,
    status: confirmation.status,
    sentAt: confirmation.sentAt,
    expiresAt: confirmation.expiresAt,
  });
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: isReady ? 'ready' : 'not-ready',
    timestamp: new Date().toISOString(),
  });
});

/**
 * Helper function to update order status in Supabase
 */
async function updateOrderStatus(orderId, status) {
  try {
    const nextJsApiUrl = process.env.NEXT_JS_API_URL || 'http://localhost:3000';
    const response = await fetch(`${nextJsApiUrl}/api/orders/${orderId}/whatsapp-status`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.WHATSAPP_CALLBACK_SECRET || ''}`,
      },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    console.log(`✅ Updated order ${orderId} status to ${status}`);
  } catch (error) {
    console.error(`❌ Failed to update order ${orderId}:`, error.message);
  }
}

// Initialize WhatsApp client
client.initialize();

// Start Express server
app.listen(PORT, () => {
  console.log(`🚀 WhatsApp Order Confirmation Server running on port ${PORT}`);
  console.log(`📱 WhatsApp Client initializing...`);
  console.log(`   - Sessions stored in: ${path.join(__dirname, 'whatsapp-sessions')}`);
  console.log(`   - API endpoint: http://localhost:${PORT}/send-confirmation`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down...');
  await client.destroy();
  process.exit(0);
});
