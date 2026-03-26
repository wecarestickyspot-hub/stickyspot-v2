import { render } from "@react-email/render";
import OrderEmail from "@/components/emails/OrderEmail";

export async function sendOrderConfirmation(
  email: string,
  customerName: string,
  orderId: string,
  amount: number,
  items: any[]
) {
  if (!process.env.BREVO_API_KEY) {
    console.error("❌ BREVO_API_KEY is missing!");
    return { success: false, error: "API Key missing" };
  }

  try {
    // 1. Email ka HTML design banayein
    const emailHtml = await render(
      OrderEmail({ customerName, orderId, amount, items })
    );

    const displayId = orderId.slice(-8).toUpperCase();

    // 🚀 2. Direct Fetch API (100% Vercel Safe, No SDK Needed)
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: { name: "StickySpot", email: "wecarestickyspot@gmail.com" },
        to: [{ email: email, name: customerName }],
        subject: `Order Confirmed! #${displayId}`,
        htmlContent: emailHtml,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Brevo API Error:", data);
      return { success: false, error: data };
    }

    console.log("✅ Email Sent via Fetch API:", data);
    return { success: true, data };

  } catch (error: any) {
    console.error("❌ Email Fetch Error:", error);
    return { success: false, error: error.message };
  }
}