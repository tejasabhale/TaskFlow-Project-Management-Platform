import { transporter } from "../config/mail.js";
import { otpTemplate } from "../templates/otp.template.js";
import { passwordChangedTemplate } from "../templates/passwordChanged.template.js";
import { passwordResetTemplate } from "../templates/passwordReset.template.js";

const FROM = `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_USER}>`;

export const sendOtpEmail = async ({ to, otp }) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: "Verify Your TaskFlow Account",
      html: otpTemplate(otp),
    });
  } catch (error) {
    console.error("Failed to send OTP email:", error);
    throw error;
  }
};

export const sendPasswordChangedEmail = async ({ to }) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: "Password Changed Successfully",
      html: passwordChangedTemplate(),
    });
  } catch (error) {
    console.error("Failed to send password changed email:", error);
    throw error;
  }
};

export const sendPasswordResetEmail = async ({ to, resetLink }) => {
  try {
    await transporter.sendMail({
      from: FROM,
      to,
      subject: "Reset Your TaskFlow Password",
      html: passwordResetTemplate(resetLink),
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};
