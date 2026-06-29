/**
 * Settings Service
 * Epic 3 - Admin-configurable values (payment details, loyalty rates, etc.)
 * CLAUDE.md: Read from database/config, never hardcode
 */

// For now, using env vars - will move to DB in Epic 4 when admin UI is built
export async function getPaymentSettings() {
  return {
    jazzCashNumber: process.env.JAZZCASH_NUMBER || "03001234567",
    easypaisaNumber: process.env.EASYPAISA_NUMBER || "03001234567",
    bankName: process.env.BANK_NAME || "HBL",
    bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER || "1234567890123",
    bankAccountTitle: process.env.BANK_ACCOUNT_TITLE || "Leo's Cafe",
    whatsappNumber: process.env.WHATSAPP_NUMBER || "923001234567",
  };
}

// Loyalty settings for Epic 5
export async function getLoyaltySettings() {
  return {
    pointsPerCurrencyUnit: parseFloat(process.env.POINTS_PER_RS || "1"),
    redemptionRate: parseFloat(process.env.REDEMPTION_RATE || "1"),
    reviewBonus: parseInt(process.env.REVIEW_BONUS_POINTS || "50"),
  };
}

// Birthday settings
export async function getBirthdaySettings() {
  return {
    discount: parseFloat(process.env.BIRTHDAY_DISCOUNT || "20"),
    validityDays: parseInt(process.env.BIRTHDAY_VALIDITY_DAYS || "7"),
    message: process.env.BIRTHDAY_MESSAGE || "Happy Birthday! Enjoy your special day!",
  };
}

// Win-back settings
export async function getWinbackSettings() {
  return {
    thresholdDays: parseInt(process.env.WINBACK_THRESHOLD_DAYS || "30"),
    discount: parseFloat(process.env.WINBACK_DISCOUNT || "15"),
    validityDays: parseInt(process.env.WINBACK_VALIDITY_DAYS || "14"),
    message: process.env.WINBACK_MESSAGE || "We miss you! Come back and enjoy a special discount.",
  };
}
