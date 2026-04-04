import nodemailer from "nodemailer";

let cachedTransporter = null;

function buildTransporter() {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    throw new Error("SMTP configuration is missing");
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });
}

export function getMailer() {
  if (!cachedTransporter) {
    cachedTransporter = buildTransporter();
  }

  return cachedTransporter;
}

export async function sendPasswordResetOtp({ email, otp }) {
  const transporter = getMailer();
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;

  await transporter.sendMail({
    from,
    to: email,
    subject: "StreamFlix password reset OTP",
    text: `Your StreamFlix password reset OTP is: ${otp}`,
    html: `<p>Your StreamFlix password reset OTP is: <strong>${otp}</strong></p>`,
  });
}
