/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code — The Perfume Lab</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logoSection}>
          <Img
            src="https://xkfztnyodbzftlshoqui.supabase.co/storage/v1/object/public/email-assets/lhariri-logo.png"
            alt="Louis Hariri"
            width="120"
            height="auto"
            style={logo}
          />
        </Section>
        <Heading style={h1}>Verification code</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={divider}>—</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can safely ignore this message.
        </Text>
        <Text style={brand}>Louis Hariri · Design. Blend. Evolve.</Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Rajdhani', 'Helvetica Neue', Arial, sans-serif" }
const container = { padding: '40px 30px', maxWidth: '480px', margin: '0 auto' }
const logoSection = { textAlign: 'center' as const, marginBottom: '30px' }
const logo = { margin: '0 auto' }
const h1 = {
  fontSize: '24px',
  fontWeight: 'bold' as const,
  fontFamily: "'Orbitron', 'Helvetica Neue', Arial, sans-serif",
  color: '#0a0b10',
  margin: '0 0 16px',
  letterSpacing: '0.05em',
}
const text = { fontSize: '15px', color: '#6b6e7a', lineHeight: '1.6', margin: '0 0 20px' }
const codeStyle = {
  fontFamily: "'Orbitron', Courier, monospace",
  fontSize: '28px',
  fontWeight: 'bold' as const,
  color: '#2ac0d6',
  margin: '0 0 30px',
  letterSpacing: '0.2em',
  textAlign: 'center' as const,
}
const divider = { fontSize: '14px', color: '#d0d0d0', textAlign: 'center' as const, margin: '30px 0 20px' }
const footer = { fontSize: '12px', color: '#999999', margin: '0 0 8px', lineHeight: '1.5' }
const brand = {
  fontSize: '10px',
  color: '#b0b0b0',
  fontFamily: "'Orbitron', 'Helvetica Neue', Arial, sans-serif",
  letterSpacing: '0.15em',
  textTransform: 'uppercase' as const,
  textAlign: 'center' as const,
  margin: '20px 0 0',
}
