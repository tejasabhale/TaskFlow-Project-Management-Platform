import { sendEmail } from "../config/mail.js";
import { otpTemplate } from "../templates/otp.template.js";
import { passwordChangedTemplate } from "../templates/passwordChanged.template.js";
import { passwordResetTemplate } from "../templates/passwordReset.template.js";

export const sendOtpEmail = async ({ to, otp }) => {
  try {
    await sendEmail({
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
    await sendEmail({
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
    await sendEmail({
      to,
      subject: "Reset Your TaskFlow Password",
      html: passwordResetTemplate(resetLink),
    });
  } catch (error) {
    console.error("Failed to send password reset email:", error);
    throw error;
  }
};
