import { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import Button from "../../components/common/Button";
import { resendOTP, verifyOTP } from "../../services/auth.service";

const OTP_LENGTH = 6;
const RESEND_DELAY = 60;

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();
  const { loadUser } = useAuth();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(""));

  const [countdown, setCountdown] = useState(RESEND_DELAY);

  const inputRefs = useRef([]);

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = useForm();

  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (countdown <= 0) {
      return;
    }

    const timer = setInterval(() => {
      setCountdown((current) => current - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [countdown]);

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) {
      return;
    }

    const digit = value.slice(-1);

    setOtp((current) => {
      const updated = [...current];
      updated[index] = digit;
      return updated;
    });

    if (digit && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, event) => {
    if (event.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }

    if (event.key === "ArrowRight" && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event) => {
    event.preventDefault();

    const pastedValue = event.clipboardData
      .getData("text")
      .replace(/\D/g, "")
      .slice(0, OTP_LENGTH);

    if (!pastedValue) {
      return;
    }

    const updated = Array(OTP_LENGTH).fill("");

    pastedValue.split("").forEach((digit, index) => {
      updated[index] = digit;
    });

    setOtp(updated);

    const focusIndex = Math.min(pastedValue.length, OTP_LENGTH - 1);

    inputRefs.current[focusIndex]?.focus();
  };

  const onSubmit = async () => {
    const otpValue = otp.join("");

    if (otpValue.length !== OTP_LENGTH) {
      toast.error("Please enter the complete OTP.");
      return;
    }

    if (!email) {
      toast.error("Email information is missing.");

      navigate("/register", {
        replace: true,
      });

      return;
    }

    try {
      const response = await verifyOTP({
        email,
        otp: otpValue,
      });

      await loadUser();

      toast.success(response?.message || "Email verified successfully!");

      navigate("/dashboard", {
        replace: true,
      });
    } catch (error) {
      toast.error(error?.response?.data?.message || "Invalid or expired OTP.");
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || !email) {
      return;
    }

    try {
      const response = await resendOTP({
        email,
      });

      setCountdown(RESEND_DELAY);
      setOtp(Array(OTP_LENGTH).fill(""));

      inputRefs.current[0]?.focus();

      toast.success(response?.message || "A new OTP has been sent.");
    } catch (error) {
      toast.error(error?.response?.data?.message || "Unable to resend OTP.");
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#ECFDF5] dark:bg-[#07130F] px-4 py-6 sm:px-6 lg:px-8">
      <section className="w-full max-w-md">
        <div className="bg-white dark:bg-[#10251D] p-5 sm:p-8 rounded-2xl shadow-lg border border-[#D1FAE5] dark:border-[#1B4332]">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17201B] dark:text-[#ECFDF5] mb-2">
              Verify Your Email
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-[#A7C4B5]">
              Enter the 6-digit OTP sent to
            </p>

            <p className="mt-1 text-sm font-medium text-[#10B981] dark:text-[#34D399] break-all">
              {email}
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div
              className="flex justify-center gap-2 sm:gap-3"
              onPaste={handlePaste}
            >
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(element) => {
                    inputRefs.current[index] = element;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => handleChange(index, event.target.value)}
                  onKeyDown={(event) => handleKeyDown(index, event)}
                  aria-label={`OTP digit ${index + 1}`}
                  className="w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-mono font-semibold bg-white dark:bg-[#10251D] text-[#17201B] dark:text-[#ECFDF5] border border-[#A7F3D0] dark:border-[#2D5A47] rounded-lg outline-none focus:ring-2 focus:ring-[#10B981] dark:focus:ring-[#34D399] focus:border-[#10B981] dark:focus:border-[#34D399] transition"
                />
              ))}
            </div>

            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Verifying..."
            >
              Verify OTP
            </Button>
          </form>

          <div className="text-center mt-6">
            <p className="text-sm text-gray-600 dark:text-[#A7C4B5]">
              Didn't receive the code?
            </p>

            <button
              type="button"
              onClick={handleResend}
              disabled={countdown > 0}
              className="mt-2 text-sm font-semibold text-[#10B981] dark:text-[#34D399] hover:underline disabled:text-gray-400 disabled:no-underline disabled:cursor-not-allowed"
            >
              {countdown > 0 ? `Resend OTP in ${countdown}s` : "Resend OTP"}
            </button>
          </div>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm text-[#10B981] dark:text-[#34D399] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
