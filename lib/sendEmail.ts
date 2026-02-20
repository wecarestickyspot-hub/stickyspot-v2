import { render } from "@react-email/render";
import OrderEmail from "@/components/emails/OrderEmail";

// 🛡️ Turbopack Fix: Using require to avoid 'Export not found' build errors
const SibApiV3Sdk = require("@getbrevo/brevo");

// 🔴 API Key Check
if (!process.env.BREVO_API_KEY) {
  console.warn("⚠️ BREVO_API_KEY is missing. Emails will not be sent.");
}

// SDK Instance Setup
const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

// API Key Setup
apiInstance.setApiKey(
  SibApiV3Sdk.TransactionalEmailsApiApiKeys.apiKey, 
  process.env.BREVO_API_KEY || ""
);

export async function sendOrderConfirmation(
  email: string,
  customerName: string,
  orderId: string,
  amount: number,
  items: any[]
) {
  try {
    // 1. React Email Component to HTML
    const emailHtml = await render(
      OrderEmail({
        customerName,
        orderId,
        amount,
        items,
      })
    );

    // 2. Prepare Payload
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();
    const displayOrderId = orderId.slice(-8).toUpperCase();

    sendSmtpEmail.subject = `Order Confirmed! #${displayOrderId}`;
    sendSmtpEmail.htmlContent = emailHtml;
    sendSmtpEmail.textContent = `Hi ${customerName}, your order #${displayOrderId} is confirmed! Amount: ₹${amount}. Team StickySpot.`;
    
    // 👇 Sender: Brevo Dashboard mein verified email hi hona chahiye
    sendSmtpEmail.sender = { 
      name: "StickySpot", 
      email: "wecarestickyspot@gmail.com" 
    }; 
    
    sendSmtpEmail.to = [{ email: email, name: customerName }];

    sendSmtpEmail.replyTo = {
      email: "support@stickyspot.in",
      name: "StickySpot Support"
    };

    // 3. Dispatch
    const response = await apiInstance.sendTransacEmail(sendSmtpEmail);
    
    console.log("✅ Email Sent Successfully:", response.body);
    return { success: true, messageId: response.body };

  } catch (error: any) {
    console.error("❌ Email Delivery Error:");
    // Detailed error logging for debugging production
    if (error.response && error.response.body) {
      console.error(JSON.stringify(error.response.body, null, 2));
    } else {
      console.error(error);
    }
    return { success: false, error };
  }
}