/**
 * Notification Service
 * Epic 5 - ONE shared service for all dispatches (CLAUDE.md rule 23)
 * Used for: birthday, win-back, review-claim decisions, order updates
 */

type NotificationType = "birthday" | "winback" | "review_approved" | "review_rejected" | "order_status";

interface NotificationPayload {
  userId: string;
  phone: string;
  type: NotificationType;
  data: Record<string, any>;
}

/**
 * Send notification via WhatsApp/SMS
 * Currently logs - in production, integrate with Twilio/WhatsApp Business API
 */
export async function sendNotification(payload: NotificationPayload) {
  const { userId, phone, type, data } = payload;

  let message = "";

  switch (type) {
    case "birthday":
      message = `🎉 Happy Birthday from Leo's Cafe! ${data.message || ""} Use code ${data.voucherCode} for ${data.discount} off. Valid until ${data.expiresAt}.`;
      break;

    case "winback":
      message = `We miss you at Leo's Cafe! ${data.message || ""} Use code ${data.voucherCode} for ${data.discount} off. Valid until ${data.expiresAt}.`;
      break;

    case "review_approved":
      message = `Your Google review claim has been approved! ${data.points} loyalty points have been credited to your account.`;
      break;

    case "review_rejected":
      message = `Your Google review claim has been rejected. Please contact support for details.`;
      break;

    case "order_status":
      message = `Order #${data.orderId}: Status updated to ${data.status}`;
      break;

    default:
      message = "You have a new update from Leo's Cafe!";
  }

  // TODO: Integrate with actual messaging service (Twilio, WhatsApp Business API)
  console.log(`[NOTIFICATION] To: ${phone}, Type: ${type}, Message: ${message}`);

  // In production, make API call here:
  // await twilioClient.messages.create({ to: phone, body: message, from: TWILIO_NUMBER });

  return {
    success: true,
    userId,
    type,
    sentAt: new Date(),
  };
}

/**
 * Batch send notifications
 */
export async function sendBatchNotifications(payloads: NotificationPayload[]) {
  const results = await Promise.allSettled(
    payloads.map((payload) => sendNotification(payload))
  );

  const successful = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;

  return {
    total: payloads.length,
    successful,
    failed,
    results,
  };
}
