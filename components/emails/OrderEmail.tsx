import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

// Props ki definition taaki TypeScript khush rahe
interface OrderItem {
  title: string;
  quantity: number;
  price: number;
  image?: string;
}

interface OrderEmailProps {
  customerName: string;
  orderId: string;
  amount: number;
  items: OrderItem[];
}

export default function OrderEmail({
  customerName = "Awesome Customer",
  orderId = "ORD-12345678",
  amount = 499,
  items = [
    { title: "Developer Sticker Pack", quantity: 1, price: 299 },
    { title: "Anime Holographic Sticker", quantity: 2, price: 100 },
  ],
}: OrderEmailProps) {
  // Email ke notification preview mein ye text dikhega
  const previewText = `Your StickySpot order #${orderId.slice(-8).toUpperCase()} is confirmed! 🎉`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header Section */}
          <Section style={header}>
            <Heading style={headerTitle}>StickySpot</Heading>
          </Section>

          {/* Greeting & Main Message */}
          <Section style={messageSection}>
            <Text style={greeting}>Hi {customerName},</Text>
            <Text style={message}>
              Thank you for shopping with us! We've received your order and are getting your awesome stickers ready for shipment. 
            </Text>
          </Section>

          <Hr style={divider} />

          {/* Order Summary Summary */}
          <Section style={orderInfoSection}>
            <Heading style={h3}>Order Summary</Heading>
            <Text style={text}>
              <strong>Order ID:</strong> #{orderId.slice(-8).toUpperCase()} <br />
              <strong>Total Amount:</strong> ₹{amount}
            </Text>
          </Section>

          {/* Items List */}
          <Section style={itemsSection}>
            <Heading style={h3}>Items in your order</Heading>
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column>
                  <Text style={itemTitle}>
                    {item.quantity}x {item.title}
                  </Text>
                </Column>
                <Column align="right">
                  <Text style={itemPrice}>₹{item.price * item.quantity}</Text>
                </Column>
              </Row>
            ))}
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Need help? Reply to this email or reach out to us at support@stickyspot.in
            </Text>
            <Text style={footerText}>
              Keep Sticking! ✨<br />
              The StickySpot Team
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// ==========================================
// 🎨 STYLES (Inline styles required for Emails)
// ==========================================

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  padding: "20px 0 48px",
  borderRadius: "8px",
  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.05)",
  maxWidth: "580px",
};

const header = {
  padding: "0 48px",
  textAlign: "center" as const,
};

const headerTitle = {
  color: "#4f46e5", // Indigo-600
  fontSize: "28px",
  fontWeight: "bold",
  margin: "20px 0",
  letterSpacing: "-0.5px",
};

const messageSection = {
  padding: "0 48px",
};

const greeting = {
  color: "#333",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "16px",
};

const message = {
  color: "#555",
  fontSize: "16px",
  lineHeight: "24px",
};

const orderInfoSection = {
  padding: "0 48px",
  marginTop: "24px",
};

const itemsSection = {
  padding: "0 48px",
  marginTop: "24px",
  backgroundColor: "#fafafa",
  borderRadius: "8px",
  margin: "24px 48px",
  paddingTop: "16px",
  paddingBottom: "16px",
};

const h3 = {
  color: "#333",
  fontSize: "18px",
  fontWeight: "600",
  marginBottom: "12px",
};

const text = {
  color: "#555",
  fontSize: "15px",
  lineHeight: "22px",
};

const itemRow = {
  borderBottom: "1px solid #eaeaea",
  padding: "12px 0",
};

const itemTitle = {
  color: "#333",
  fontSize: "14px",
  margin: "0",
};

const itemPrice = {
  color: "#333",
  fontSize: "14px",
  fontWeight: "bold",
  margin: "0",
};

const divider = {
  borderColor: "#eaeaea",
  margin: "24px 0",
};

const footer = {
  padding: "0 48px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#8898aa",
  fontSize: "12px",
  lineHeight: "16px",
  marginTop: "12px",
};