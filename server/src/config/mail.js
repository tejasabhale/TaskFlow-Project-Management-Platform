import axios from "axios";

export const sendEmail = async ({ to, subject, html }) => {
  try {
    const response = await axios.post(
      "https://smtp.maileroo.com/api/v2/emails",
      {
        from: {
          address: process.env.EMAIL_FROM,
          display_name: process.env.EMAIL_FROM_NAME,
        },
        to: [
          {
            address: to,
          },
        ],
        subject,
        html,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": process.env.MAILEROO_API_KEY,
        },
      },
    );

    return response.data;
  } catch (error) {
    console.error("Maileroo Error:", error.response?.data || error.message);
    throw error;
  }
};
