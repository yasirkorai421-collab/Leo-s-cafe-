// Get the last created OTP from memory store for testing
import { verifyOtpChallenge } from "@/lib/otp-store";

// Since the last request was for +923001234567, let's try verification
// and check the logs for what happens

async function getOtpStatus() {
  try {
    // Try to verify with a dummy OTP to see if it returns info
    const result = await verifyOtpChallenge("+923001234567", "000000");
    console.log("Verification attempt result:", result);
  } catch (err) {
    console.error("Error:", err);
  }
}

getOtpStatus().catch(console.error);
