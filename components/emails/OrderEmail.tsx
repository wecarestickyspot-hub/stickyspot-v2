import {
  Body,
  Container,
  Column,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
  Button,
} from "@react-email/components";
import * as React from "react";

// Props ki definition
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
  orderDate?: string;
}

export default function OrderEmail({
  customerName = "Awesome Customer",
  orderId = "ORD-12345678",
  amount = 499,
  orderDate = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }),
  items = [
    { title: "Developer Sticker Pack", quantity: 1, price: 299 },
    { title: "Anime Holographic Sticker", quantity: 2, price: 100 },
  ],
}: OrderEmailProps) {
  const previewText = `🎉 Your StickySpot order #${orderId.slice(-8).toUpperCase()} is confirmed!`;

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          
          {/* 🌟 Brand Header */}
          <Section style={header}>
            <Text style={logo}>StickySpot.</Text>
          </Section>

          {/* 🎉 Hero Section */}
          <Section style={heroSection}>
            <Heading style={heroTitle}>Order Confirmed!</Heading>
            <Text style={heroText}>
              Hi <strong>{customerName}</strong>, thank you for your order. We're getting your premium stickers ready to be shipped.
            </Text>
          </Section>

          {/* 🧾 Order Details Card */}
          <Section style={orderCard}>
            <Row>
              <Column>
                <Text style={cardLabel}>ORDER ID</Text>
                <Text style={cardValue}>#{orderId.slice(-8).toUpperCase()}</Text>
              </Column>
              <Column align="right">
                <Text style={cardLabel}>ORDER DATE</Text>
                <Text style={cardValue}>{orderDate}</Text>
              </Column>
            </Row>
          </Section>

          {/* 🛍️ Itemized Receipt */}
          <Section style={receiptSection}>
            <Heading style={receiptTitle}>Order Summary</Heading>
            <Hr style={divider} />
            
            {items.map((item, index) => (
              <Row key={index} style={itemRow}>
                <Column style={{ width: "80%" }}>
                  <Text style={itemTitle}>{item.title}</Text>
                  <Text style={itemSubtitle}>Qty: {item.quantity}</Text>
                </Column>
                <Column align="right" style={{ width: "20%" }}>
                  <Text style={itemPrice}>₹{item.price * item.quantity}</Text>
                </Column>
              </Row>
            ))}

            <Hr style={divider} />
            
            <Row style={totalRow}>
              <Column>
                <Text style={totalLabel}>Total Paid</Text>
              </Column>
              <Column align="right">
                <Text style={totalValue}>₹{amount}</Text>
              </Column>
            </Row>
          </Section>

          {/* 🚀 CTA Button */}
          <Section style={ctaSection}>
            <Button style={button} href={`https://stickyspot.in/orders`}>
              View Your Order
            </Button>
          </Section>

          <Hr style={footerDivider} />

          {/* 📞 Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              If you have any questions, simply reply to this email or reach out to our support team at <a href="mailto:wecarestickyspot@gmail.com" style={link}>wecarestickyspot@gmail.com</a>.
            </Text>
            <Text style={footerSignature}>
              Keep Sticking! ✨<br />
              <span style={{ fontWeight: "bold", color: "#0f172a" }}>The StickySpot Team</span>
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  );
}

// ==========================================
// 🎨 PREMIUM STYLES
// ==========================================

const main = {
  backgroundColor: "#f4f4f5", // Light zinc background
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "40px auto",
  borderRadius: "16px",
  boxShadow: "0 4px 24px rgba(0, 0, 0, 0.04)",
  maxWidth: "600px",
  overflow: "hidden",
};

const header = {
  backgroundColor: "#0f172a", // Slate 900
  padding: "32px 48px",
  textAlign: "center" as const,
};

const logo = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "900",
  letterSpacing: "-1px",
  margin: "0",
};

const heroSection = {
  padding: "40px 48px 24px",
  textAlign: "center" as const,
};

const heroTitle = {
  color: "#10b981", // Emerald 500
  fontSize: "32px",
  fontWeight: "800",
  letterSpacing: "-1px",
  margin: "0 0 16px",
};

const heroText = {
  color: "#475569", // Slate 600
  fontSize: "16px",
  lineHeight: "26px",
  margin: "0",
};

const orderCard = {
  backgroundColor: "#f8fafc", // Slate 50
  margin: "0 48px 32px",
  padding: "24px",
  borderRadius: "12px",
  border: "1px solid #e2e8f0", // Slate 200
};

const cardLabel = {
  color: "#64748b", // Slate 500
  fontSize: "10px",
  fontWeight: "bold",
  textTransform: "uppercase" as const,
  letterSpacing: "1px",
  margin: "0 0 4px",
};

const cardValue = {
  color: "#0f172a", // Slate 900
  fontSize: "16px",
  fontWeight: "bold",
  margin: "0",
};

const receiptSection = {
  padding: "0 48px",
};

const receiptTitle = {
  color: "#0f172a",
  fontSize: "18px",
  fontWeight: "bold",
  margin: "0 0 16px",
};

const itemRow = {
  padding: "16px 0",
};

const itemTitle = {
  color: "#1e293b", // Slate 800
  fontSize: "15px",
  fontWeight: "600",
  margin: "0 0 4px",
};

const itemSubtitle = {
  color: "#64748b",
  fontSize: "13px",
  margin: "0",
};

const itemPrice = {
  color: "#0f172a",
  fontSize: "15px",
  fontWeight: "bold",
  margin: "0",
};

const divider = {
  borderColor: "#e2e8f0",
  margin: "12px 0",
};

const totalRow = {
  padding: "16px 0",
};

const totalLabel = {
  color: "#0f172a",
  fontSize: "18px",
  fontWeight: "800",
  margin: "0",
};

const totalValue = {
  color: "#4f46e5", // Indigo 600
  fontSize: "24px",
  fontWeight: "900",
  margin: "0",
};

const ctaSection = {
  padding: "32px 48px",
  textAlign: "center" as const,
};

const button = {
  backgroundColor: "#4f46e5", // Indigo 600
  borderRadius: "8px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "bold",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "block",
  padding: "16px 32px",
};

const footerDivider = {
  borderColor: "#f1f5f9", // Slate 100
  margin: "0",
};

const footer = {
  backgroundColor: "#f8fafc",
  padding: "32px 48px",
  textAlign: "center" as const,
};

const footerText = {
  color: "#64748b",
  fontSize: "13px",
  lineHeight: "22px",
  margin: "0 0 24px",
};

const link = {
  color: "#4f46e5",
  textDecoration: "underline",
};

const footerSignature = {
  color: "#64748b",
  fontSize: "14px",
  lineHeight: "24px",
  margin: "0",
};