import nodemailer from "nodemailer";

const isMailConfigured = Boolean(
  process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS,
);

export const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

if (isMailConfigured) {
  transporter.verify((error) => {
    if (error) {
      console.warn("SMTP Server verification warning:", error.message);
    } else {
      console.log("SMTP Server is ready.");
    }
  });
} else {
  console.log("SMTP credentials not fully configured; mail delivery will be simulated or skipped.");
}