import { render } from "@react-email/render";
import OrderEmail from "@/components/emails/OrderEmail";

// 🛡️ Safe Require for Turbopack/Next.js Build
const SibApiV3Sdk = require("@getbrevo/brevo");

/**
 * 💡 Build Error Fix: 
 * Global scope mein 'new' constructor call karne se build fail hoti hai.
 * Isliye hum function ke andar instance banayenge.
 */
const getBrevoApi = () => {
  if (!process.env.BREVO_API_KEY) {
    console.error("❌ BREVO_API_KEY is missing!");
    return null;
  }

  const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();
  apiInstance.setApiKey(
    SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY
  );
  return apiInstance;
};

export async function sendOrderConfirmation(
  email: string,
  customerName: string,
  orderId: string,
  amount: number,
  items: any[]
) {
  const apiInstance = getBrevoApi();
  if (!apiInstance) return { success: false, error: "API not configured" };

  try {
    const emailHtml = await render(
      OrderEmail({
        customerName,
        orderId,
        amount,
        items,
      })
    );

    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    const displayId = orderId.slice(-8).toUpperCase();

    sendSmtpEmail.subject = `Order Confirmed! #${displayId}`;
    sendSmtpEmail.htmlContent = emailHtml;
    sendSmtpEmail.sender = { name: "StickySpot", email: "wecarestickyspot@gmail.com" };
    sendSmtpEmail.to = [{ email, name: customerName }];

    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email Sent:", response.body);
    return { success: true, data: response.body };

  } catch (error: any) {
    console.error("❌ Email Error:", error?.response?.body || error);
    return { success: false, error };
  }
}