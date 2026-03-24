const WEAK_PASSWORDS = new Set([
  "12345678", "123456789", "1234567890", "password", "password1",
  "qwerty123", "qwertyuiop", "abcdefgh", "abc12345", "letmein1",
  "welcome1", "monkey123", "dragon123", "master123", "login123",
  "princess1", "football1", "shadow123", "sunshine1", "trustno1",
  "iloveyou1", "admin123", "passw0rd", "p@ssw0rd", "p@ssword",
]);

export interface PasswordCheck {
  valid: boolean;
  errors: string[];
}

export function validatePassword(password: string): PasswordCheck {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Mindestens 8 Zeichen erforderlich / At least 8 characters required");
  }
  if (!/[A-Z]/.test(password)) {
    errors.push("Mindestens ein Großbuchstabe / At least one uppercase letter");
  }
  if (!/[a-z]/.test(password)) {
    errors.push("Mindestens ein Kleinbuchstabe / At least one lowercase letter");
  }
  if (!/[0-9]/.test(password)) {
    errors.push("Mindestens eine Zahl / At least one number");
  }
  if (!/[^A-Za-z0-9]/.test(password)) {
    errors.push("Mindestens ein Sonderzeichen / At least one special character (!@#$%…)");
  }
  if (WEAK_PASSWORDS.has(password.toLowerCase())) {
    errors.push("Dieses Passwort ist zu häufig / This password is too common");
  }

  return { valid: errors.length === 0, errors };
}
