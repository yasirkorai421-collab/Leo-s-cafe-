/**
 * SMS Service Library
 * Unified interface for sending SMS via multiple providers
 * Supports MSG91, Twilio, and generic SMS gateways
 */

export interface SMSResult {
  success: boolean;
  provider?: string;
  error?: string;
}

/**
 * Send SMS via MSG91 (recommended for South Asia/Pakistan)
 */
async function sendViaMSG91(to: string, message: string): Promise<SMSResult> {
  const apiKey = process.env.MSG91_API_KEY;
  const senderId = process.env.MSG91_SENDER_ID || "LEOCAFE";

  if (!apiKey) {
    return { success: false, error: "MSG91 not configured" };
  }

  try {
    const response = await fetch("https://control.msg91.com/api/v5/flow/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "authkey": apiKey,
      },
      body: JSON.stringify({
        sender: senderId,
        mobiles: to.replace(/^\+/, ""),
        message: message,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[SMS] MSG91 error:", error);
      return { success: false, error: `MSG91 API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, provider: "MSG91" };
  } catch (error: any) {
    console.error("[SMS] MSG91 exception:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS via Twilio (international coverage)
 */
async function sendViaTwilio(to: string, message: string): Promise<SMSResult> {
  const accountSid = process.env.TWILIO_ACCOUNT_SID;
  const authToken = process.env.TWILIO_AUTH_TOKEN;
  const fromNumber = process.env.HOST_PHONE_NUMBER || process.env.TWILIO_PHONE_NUMBER;

  if (!accountSid || !authToken || !fromNumber) {
    return { success: false, error: "Twilio not configured" };
  }

  try {
    const response = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Authorization: `Basic ${Buffer.from(`${accountSid}:${authToken}`).toString("base64")}`,
        },
        body: new URLSearchParams({
          To: to,
          From: fromNumber,
          Body: message,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("[SMS] Twilio error:", errorData);
      return { success: false, error: `Twilio API error: ${response.status}` };
    }

    const data = await response.json();
    return { success: true, provider: "Twilio" };
  } catch (error: any) {
    console.error("[SMS] Twilio exception:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS via generic HTTP API
 */
async function sendViaGenericAPI(to: string, message: string): Promise<SMSResult> {
  const apiUrl = process.env.SMS_API_URL;
  const apiKey = process.env.SMS_API_KEY;
  const senderId = process.env.SMS_SENDER_ID;

  if (!apiUrl || !apiKey) {
    return { success: false, error: "Generic SMS not configured" };
  }

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        to: to.replace(/^\+/, ""),
        from: senderId,
        message: message,
      }),
    });

    if (!response.ok) {
      return { success: false, error: `Generic SMS API error: ${response.status}` };
    }

    return { success: true, provider: "Generic SMS" };
  } catch (error: any) {
    console.error("[SMS] Generic SMS exception:", error);
    return { success: false, error: error.message };
  }
}

/**
 * Send SMS with automatic provider fallback
 */
export async function sendSMS(to: string, message: string): Promise<SMSResult> {
  // Normalize phone number
  const normalizedTo = to.startsWith("+") ? to : `+${to}`;

  // Try MSG91 first (best for Pakistan/India)
  let result = await sendViaMSG91(normalizedTo, message);
  if (result.success) {
    console.log(`[SMS] Sent via ${result.provider} to ${normalizedTo}`);
    return result;
  }

  // Try Twilio as fallback
  result = await sendViaTwilio(normalizedTo, message);
  if (result.success) {
    console.log(`[SMS] Sent via ${result.provider} to ${normalizedTo}`);
    return result;
  }

  // Try generic API as last resort
  result = await sendViaGenericAPI(normalizedTo, message);
  if (result.success) {
    console.log(`[SMS] Sent via ${result.provider} to ${normalizedTo}`);
    return result;
  }

  // All providers failed
  console.error("[SMS] All providers failed for:", normalizedTo);
  
  // In development, just log the message
  if (process.env.NODE_ENV === "development") {
    console.log(`[SMS] Development mode - would send to ${normalizedTo}: ${message}`);
    return { success: true, provider: "Development (Console)" };
  }

  return { success: false, error: "All SMS providers failed" };
}

/**
 * Send OTP code via SMS
 */
export async function sendOTPSMS(to: string, otpCode: string): Promise<SMSResult> {
  const message = `Your Leo's Cafe verification code is ${otpCode}. Valid for 5 minutes. Do not share this code.`;
  return sendSMS(to, message);
}

/**
 * Send order confirmation SMS
 */
export async function sendOrderConfirmationSMS(
  to: string,
  orderId: string,
  total: number
): Promise<SMSResult> {
  const message = `Your Leo's Cafe order #${orderId.slice(0, 8)} (Rs. ${total}) has been confirmed! We'll notify you when it's ready for delivery.`;
  return sendSMS(to, message);
}

/**
 * Send reservation confirmation SMS
 */
export async function sendReservationSMS(
  to: string,
  status: string,
  date: string,
  time: string,
  guests: number,
  customMessage?: string
): Promise<SMSResult> {
  let message = "";
  
  if (customMessage) {
    message = `Leo's Cafe Reservation: ${customMessage}`;
  } else if (status === "confirmed") {
    message = `Your table reservation for ${guests} guests on ${date} at ${time} is CONFIRMED! We look forward to seeing you at Leo's Cafe.`;
  } else if (status === "rejected") {
    message = `We're sorry, but your reservation request for ${date} at ${time} could not be confirmed. Please call us to discuss alternative times.`;
  } else {
    message = `Your reservation request for ${guests} guests on ${date} at ${time} is being reviewed. We'll confirm shortly!`;
  }
  
  return sendSMS(to, message);
}

/**
 * Send delivery status update SMS
 */
export async function sendDeliveryUpdateSMS(
  to: string,
  orderId: string,
  status: string
): Promise<SMSResult> {
  let message = "";
  
  switch (status) {
    case "preparing":
      message = `Your Leo's Cafe order #${orderId.slice(0, 8)} is being prepared in our kitchen!`;
      break;
    case "ready":
      message = `Your order #${orderId.slice(0, 8)} is ready and will be delivered soon!`;
      break;
    case "out_for_delivery":
      message = `Your order #${orderId.slice(0, 8)} is out for delivery! Our rider is on the way.`;
      break;
    case "delivered":
      message = `Your order #${orderId.slice(0, 8)} has been delivered. Enjoy your meal from Leo's Cafe! ❤️`;
      break;
    default:
      message = `Order #${orderId.slice(0, 8)} status update: ${status}`;
  }
  
  return sendSMS(to, message);
}
/**
 * Send order status SMS (generic with custom message support)
 */
export async function sendOrderStatusSMS(
  to: string,
  orderId: string,
  status: string,
  customMessage?: string
): Promise<SMSResult> {
  const message =
    customMessage ||
    `Leo's Cafe - Order #${orderId.slice(0, 8)}: Status updated to ${status}`;

  return sendSMS(to, message);
}
