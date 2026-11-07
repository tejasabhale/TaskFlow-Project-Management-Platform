// Brand pieces. Email clients don't support CSS variables, so these are the
// resolved values of TaskFlow's theme tokens.
const COLORS = {
  primary: "#F97316",
  primaryDark: "#C2410C",
  primaryTint: "#FFF7ED",
  primaryBorder: "#FED7AA",
  background: "#FAFAF9",
  surface: "#FFFFFF",
  border: "#E7E5E4",
  text: "#1C1917",
  muted: "#78716C",
  subtle: "#A8A29E",
};

const FONT = "'Plus Jakarta Sans', Arial, Helvetica, sans-serif";

// The logo file lives in the frontend's public/ folder, so it is served from
// the frontend's public URL. Set CLIENT_URL (e.g. https://taskflow.example.com)
// in your backend .env. It must be a public address: "localhost" only works
// on your own machine, not for the people who receive the email.
const LOGO_PATH = "/taskflow-logo.svg";
const LOGO_HEIGHT = 32;

const getClientUrl = () =>
  (
    process.env.CLIENT_URL ||
    process.env.FRONTEND_URL ||
    "http://localhost:5173"
  ).replace(/\/+$/, "");

// Centered logo above the card. If the image is blocked or unsupported, the
// alt text shows instead, styled as the TaskFlow name.
const brandHeader = () => `<tr>
            <td align="center" style="padding:0 0 24px;">
              <a href="${getClientUrl()}" style="text-decoration:none;">
                <img
                  src="${getClientUrl()}${LOGO_PATH}"
                  alt="TaskFlow"
                  height="${LOGO_HEIGHT}"
                  style="
                    display:block;
                    margin:0 auto;
                    height:${LOGO_HEIGHT}px;
                    width:auto;
                    border:0;
                    outline:none;
                    font-family:${FONT};
                    font-size:17px;
                    line-height:${LOGO_HEIGHT}px;
                    font-weight:800;
                    color:${COLORS.text};
                  "
                />
              </a>
            </td>
          </tr>`;

// ---------------------------------------------------------------------------
// Shared building blocks: every TaskFlow email is built from these, in the same
// order: heading, text, key element, note, divider, notice. All centered.
// ---------------------------------------------------------------------------

const heading = (text) => `<h1
                style="
                  margin:0;
                  font-family:${FONT};
                  font-size:28px;
                  line-height:34px;
                  font-weight:800;
                  letter-spacing:-0.8px;
                  text-align:center;
                  color:${COLORS.text};
                "
              >${text}</h1>`;

const paragraph = (text) => `<p
                style="
                  margin:12px auto 0;
                  max-width:340px;
                  font-family:${FONT};
                  font-size:15px;
                  line-height:24px;
                  text-align:center;
                  color:${COLORS.muted};
                "
              >${text}</p>`;

// Centers whatever it wraps (digit boxes, button, check mark).
const centered = (
  inner,
  top = 28,
) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:${top}px;">
                <tr>
                  <td align="center">${inner}</td>
                </tr>
              </table>`;

const note = (text) => `<p
                style="
                  margin:14px 0 0;
                  font-family:${FONT};
                  font-size:13px;
                  line-height:20px;
                  text-align:center;
                  color:${COLORS.muted};
                "
              >${text}</p>`;

const divider = `<table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding:28px 0 0;">
                    <div style="height:1px;line-height:1px;font-size:1px;background-color:${COLORS.border};">&nbsp;</div>
                  </td>
                </tr>
              </table>`;

const notice = (
  title,
  text,
) => `<table width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:24px;">
                <tr>
                  <td
                    align="center"
                    style="
                      padding:16px 20px;
                      background-color:${COLORS.primaryTint};
                      border:1px solid ${COLORS.primaryBorder};
                      border-radius:12px;
                      font-family:${FONT};
                      font-size:13px;
                      line-height:21px;
                      text-align:center;
                      color:${COLORS.muted};
                    "
                  ><strong style="color:${COLORS.text};">${title}</strong> ${text}</td>
                </tr>
              </table>`;

const button = (
  href,
  label,
) => `<table align="center" cellpadding="0" cellspacing="0" border="0">
                  <tr>
                    <td
                      align="center"
                      bgcolor="${COLORS.primary}"
                      style="background-color:${COLORS.primary};border-radius:12px;"
                    >
                      <a
                        href="${href}"
                        style="
                          display:inline-block;
                          padding:14px 28px;
                          font-family:${FONT};
                          font-size:14px;
                          line-height:20px;
                          font-weight:700;
                          color:#FFFFFF;
                          text-decoration:none;
                        "
                      >${label}</a>
                    </td>
                  </tr>
                </table>`;

const emailLayout = ({ title, preview, content, footer }) => `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="color-scheme" content="light" />
  <meta name="supported-color-schemes" content="light" />

  <title>${title}</title>
</head>

<body
  style="
    margin:0;
    padding:0;
    background-color:${COLORS.background};
    font-family:${FONT};
    color:${COLORS.text};
  "
>

  <!-- Inbox preview text -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;font-size:1px;line-height:1px;color:${COLORS.background};">
    ${preview}
  </div>

  <table
    width="100%"
    cellpadding="0"
    cellspacing="0"
    border="0"
    style="background-color:${COLORS.background};"
  >
    <tr>
      <td align="center" style="padding:40px 16px;">

        <table
          width="100%"
          cellpadding="0"
          cellspacing="0"
          border="0"
          style="max-width:480px;"
        >

          <!-- Logo -->
          ${brandHeader()}

          <!-- Card -->
          <tr>
            <td
              align="center"
              style="
                background-color:${COLORS.surface};
                border:1px solid ${COLORS.border};
                border-radius:16px;
                padding:40px 32px 32px;
                text-align:center;
              "
            >
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="padding:24px 16px 0;">
              <p
                style="
                  margin:0;
                  font-family:${FONT};
                  font-size:12px;
                  line-height:18px;
                  text-align:center;
                  color:${COLORS.subtle};
                "
              >
                ${footer}
              </p>
              <p
                style="
                  margin:4px 0 0;
                  font-family:${FONT};
                  font-size:12px;
                  line-height:18px;
                  text-align:center;
                  color:${COLORS.subtle};
                "
              >
                &copy; ${new Date().getFullYear()} TaskFlow
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

// One box per digit, with a small spacer cell between them.
const renderDigits = (otp) =>
  String(otp)
    .split("")
    .map(
      (digit) => `<td
                        align="center"
                        width="44"
                        style="
                          width:44px;
                          height:56px;
                          background-color:${COLORS.primaryTint};
                          border:1px solid ${COLORS.primaryBorder};
                          border-radius:10px;
                          font-family:${FONT};
                          font-size:26px;
                          line-height:56px;
                          font-weight:800;
                          color:${COLORS.primaryDark};
                        "
                      >${digit}</td>`,
    )
    .join(
      `<td width="8" style="width:8px;font-size:0;line-height:0;">&nbsp;</td>`,
    );

export const otpTemplate = (otp) =>
  emailLayout({
    title: "Verify your email - TaskFlow",
    preview: `Your TaskFlow verification code is ${otp}. It expires in 10 minutes.`,
    footer: "This is an automated email from TaskFlow.",
    content: `
              ${heading("Verify your email")}
              ${paragraph(
                "Welcome to TaskFlow. Enter this code to confirm your email address and finish setting up your account.",
              )}
              ${centered(`<table align="center" cellpadding="0" cellspacing="0" border="0">
                    <tr>${renderDigits(otp)}</tr>
                  </table>`)}
              ${note("This code expires in 10 minutes.")}
              ${divider}
              ${notice(
                "Keep this code private.",
                "TaskFlow will never ask you for it. If you didn't create an account, you can safely ignore this email.",
              )}
    `,
  });
