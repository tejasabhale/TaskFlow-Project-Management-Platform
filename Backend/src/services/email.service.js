import { resend } from "../config/resend.js";
import { ApiError } from "../utils/ApiError.js";

import { passwordResetTemplate } from "../templates/passwordReset.template.js";
import { passwordChangedTemplate } from "../templates/passwordChanged.template.js";
import { otpTemplate } from "../templates/otp.template.js";

const FROM = process.env.RESEND_FROM || "TaskFlow <onboarding@resend.dev>";

export const sendPasswordResetEmail = async ({ to, resetLink }) => {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Reset Your Password",
    html: passwordResetTemplate(resetLink),
  });

  if (error) {
    throw new ApiError(500, "Failed to send password reset email.");
  }

  return data;
};

export const sendPasswordChangedEmail = async ({ to }) => {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Password Changed Successfully",
    html: passwordChangedTemplate(),
  });

  if (error) {
    throw new ApiError(500, "Failed to send password changed email.");
  }

  return data;
};

export const sendOtpEmail = async ({ to, otp }) => {
  const { data, error } = await resend.emails.send({
    from: FROM,
    to,
    subject: "Verify Your Email",
    html: otpTemplate(otp),
  });

  if (error) {
    throw new ApiError(500, "Failed to send verification email.");
  }

  return data;
};
