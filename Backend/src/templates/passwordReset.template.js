export const passwordResetTemplate = (resetLink) => `
<!DOCTYPE html>
<html>

<head>
  <meta charset="UTF-8" />
</head>

<body style="font-family: Arial, sans-serif; line-height:1.6">

  <h2>Password Reset Request</h2>

  <p>You requested to reset your password.</p>

  <p>
    Click the button below to reset it:
  </p>

  <a
    href="${resetLink}"
    style="
      display:inline-block;
      padding:12px 20px;
      background:#2563eb;
      color:white;
      text-decoration:none;
      border-radius:6px;
    "
  >
    Reset Password
  </a>

  <p>This link expires in 10 minutes.</p>

  <p>If you didn't request this, you can safely ignore this email.</p>

</body>

</html>
`;
