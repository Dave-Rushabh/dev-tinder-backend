import { Resend } from "resend";
import dotenv from "dotenv";

dotenv.config();

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendOtpEmail = async (email, otp) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: email,
      subject: "Your OTP for Password Reset",
      html: `
        <div style="font-family:sans-serif;">
          <h2>Password Reset Request</h2>
          <p>Your one-time password (OTP) is:</p>
          <h3 style="color:#007bff;">${otp}</h3>
          <p>This OTP will expire in 5 minutes.</p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Error sending OTP email:", error);
    throw new Error("Failed to send OTP email");
  }
};
