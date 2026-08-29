export const otpTemplate = (otp) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta name="color-scheme" content="light" />

  <title>Verify your email - TaskFlow</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:#F0FDF9;
    font-family:Arial, Helvetica, sans-serif;
    color:#17201B;
  "
>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color:#F0FDF9;"
  >
    <tr>
      <td
        align="center"
        style="padding:32px 16px;"
      >

        <!-- Main Card -->
        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="
            max-width:520px;
            background-color:#FFFFFF;
            border:1px solid #D1FAE5;
            border-radius:16px;
            overflow:hidden;
          "
        >

          <!-- Header -->
          <tr>
            <td
              align="center"
              style="
                padding:32px 24px 24px;
              "
            >

              <div
                style="
                  display:inline-block;
                  margin-bottom:16px;
                  padding:6px 12px;
                  background-color:#ECFDF5;
                  border:1px solid #A7F3D0;
                  border-radius:20px;
                  color:#047857;
                  font-size:12px;
                  font-weight:700;
                  letter-spacing:0.5px;
                "
              >
                TASKFLOW
              </div>

              <h1
                style="
                  margin:0;
                  font-size:24px;
                  line-height:32px;
                  font-weight:700;
                  color:#17201B;
                "
              >
                Verify your email
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  font-size:14px;
                  line-height:22px;
                  color:#6B7280;
                "
              >
                Welcome to TaskFlow. Let's get your account ready.
              </p>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:8px 32px 32px;">

              <p
                style="
                  margin:0 0 20px;
                  font-size:15px;
                  line-height:24px;
                  color:#4B5563;
                  text-align:center;
                "
              >
                Enter the verification code below to confirm
                your email address.
              </p>

              <!-- OTP -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
              >
                <tr>
                  <td
                    align="center"
                    style="
                      padding:24px 16px;
                      background-color:#ECFDF5;
                      border:1px solid #A7F3D0;
                      border-radius:12px;
                    "
                  >

                    <p
                      style="
                        margin:0 0 10px;
                        font-size:11px;
                        line-height:16px;
                        font-weight:700;
                        letter-spacing:1.5px;
                        text-transform:uppercase;
                        color:#047857;
                      "
                    >
                      Verification Code
                    </p>

                    <div
                      style="
                        font-size:34px;
                        line-height:42px;
                        font-weight:700;
                        letter-spacing:8px;
                        color:#059669;
                      "
                    >
                      ${otp}
                    </div>

                    <p
                      style="
                        margin:10px 0 0;
                        font-size:12px;
                        line-height:18px;
                        color:#6B7280;
                      "
                    >
                      Expires in 10 minutes
                    </p>

                  </td>
                </tr>
              </table>

              <!-- Security Notice -->
              <table
                width="100%"
                cellpadding="0"
                cellspacing="0"
                border="0"
                style="margin-top:24px;"
              >
                <tr>
                  <td
                    style="
                      padding:16px;
                      background-color:#F9FAFB;
                      border-radius:10px;
                    "
                  >

                    <p
                      style="
                        margin:0;
                        font-size:13px;
                        line-height:20px;
                        color:#6B7280;
                      "
                    >
                      <strong style="color:#374151;">
                        Security notice:
                      </strong>
                      Never share this code with anyone.
                      TaskFlow will never ask you for your verification code.
                    </p>

                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td
              align="center"
              style="
                padding:20px 24px;
                background-color:#F9FAFB;
                border-top:1px solid #E5E7EB;
              "
            >

              <p
                style="
                  margin:0;
                  font-size:11px;
                  line-height:18px;
                  color:#9CA3AF;
                "
              >
                This is an automated email from TaskFlow.
              </p>

              <p
                style="
                  margin:4px 0 0;
                  font-size:11px;
                  line-height:18px;
                  color:#D1D5DB;
                "
              >
                © ${new Date().getFullYear()} TaskFlow
              </p>

            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>
`;
