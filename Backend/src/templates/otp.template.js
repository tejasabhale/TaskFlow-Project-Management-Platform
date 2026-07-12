export const otpTemplate = (otp) => `
<!DOCTYPE html>
<html>

<body style="font-family: Arial, sans-serif; line-height:1.6">

  <h2>Email Verification</h2>

  <p>Your verification code is:</p>

  <h1
    style="
      letter-spacing:6px;
      color:#2563eb;
    "
  >
    ${otp}
  </h1>

  <p>This OTP expires in 10 minutes.</p>

  <p>Do not share this OTP with anyone.</p>

</body>

</html>
`;