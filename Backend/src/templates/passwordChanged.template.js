export const passwordChangedTemplate = () => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta
    name="viewport"
    content="width=device-width, initial-scale=1.0"
  />
  <meta name="color-scheme" content="light" />

  <title>Password Changed - TaskFlow</title>
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
      <td align="center" style="padding:32px 16px;">

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
              style="padding:32px 24px 24px;"
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
                Password changed
              </h1>

              <p
                style="
                  margin:8px 0 0;
                  font-size:14px;
                  line-height:22px;
                  color:#6B7280;
                "
              >
                Your TaskFlow password was changed successfully.
              </p>

            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:8px 32px 32px;">

              <!-- Success -->
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
                      padding:20px;
                      background-color:#ECFDF5;
                      border:1px solid #A7F3D0;
                      border-radius:12px;
                    "
                  >

                    <div
                      style="
                        width:42px;
                        height:42px;
                        margin:0 auto 12px;
                        background-color:#10B981;
                        border-radius:50%;
                        color:#FFFFFF;
                        font-size:22px;
                        line-height:42px;
                        font-weight:bold;
                      "
                    >
                      ✓
                    </div>

                    <p
                      style="
                        margin:0;
                        font-size:14px;
                        line-height:22px;
                        color:#047857;
                        font-weight:600;
                      "
                    >
                      Your password has been updated successfully.
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
                      background-color:#FFF7ED;
                      border:1px solid #FED7AA;
                      border-radius:10px;
                    "
                  >

                    <p
                      style="
                        margin:0;
                        font-size:13px;
                        line-height:20px;
                        color:#9A3412;
                      "
                    >
                      <strong>Security notice:</strong>
                      If you did not make this change, your account
                      may be compromised. Please secure your account
                      immediately.
                    </p>

                  </td>
                </tr>
              </table>

              <p
                style="
                  margin:24px 0 0;
                  font-size:13px;
                  line-height:20px;
                  color:#6B7280;
                  text-align:center;
                "
              >
                If you made this change, no further action is required.
              </p>

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
                This is an automated security notification from TaskFlow.
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
