/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface SignupEmailProps {
  siteName: string
  siteUrl: string
  recipient: string
  confirmationUrl: string
}

export const SignupEmail = ({
  siteName,
  siteUrl,
  recipient,
  confirmationUrl,
}: SignupEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Welcome to The Perfume Lab — confirm your identity</Preview>
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
        <Heading style={h1}>Welcome to The Perfume Lab</Heading>
        <Text style={text}>
          Your journey into the world of bespoke fragrance begins here.
        </Text>
        <Text style={text}>
          Confirm your email address (
          <Link href={`mailto:${recipient}`} style={link}>
            {recipient}
          </Link>
          ) to unlock your private atelier.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Confirm &amp; Enter
        </Button>
        <Text style={divider}>—</Text>
        <Text style={footer}>
          If you didn't create an account with{' '}
          <Link href={siteUrl} style={link}>{siteName}</Link>,
          you may safely disregard this message.
        </Text>
        <Text style={brand}>Louis Hariri · Design. Blend. Evolve.</Text>
      </Container>
    </Body>
  </Html>
)

export default SignupEmail

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
const link = { color: '#2ac0d6', textDecoration: 'underline' }
const button = {
  backgroundColor: '#2ac0d6',
  color: '#0a0b10',
  fontSize: '14px',
  fontFamily: "'Orbitron', 'Helvetica Neue', Arial, sans-serif",
  fontWeight: 'bold' as const,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
  letterSpacing: '0.08em',
  textTransform: 'uppercase' as const,
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
