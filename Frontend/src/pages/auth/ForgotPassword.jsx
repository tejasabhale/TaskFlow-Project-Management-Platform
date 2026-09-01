import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import { forgotPassword } from "../../services/auth.service";

export default function ForgotPassword() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await forgotPassword(data);

      toast.success(
        response?.message ||
          "If an account exists, a password reset link has been sent.",
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message || "Unable to process your request.",
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#ECFDF5] dark:bg-[#07130F] px-4 py-6 sm:px-6 lg:px-8">
      <section className="w-full max-w-md">
        <div className="bg-white dark:bg-[#10251D] p-5 sm:p-8 rounded-2xl shadow-lg border border-[#D1FAE5] dark:border-[#1B4332]">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17201B] dark:text-[#ECFDF5] mb-2">
              Forgot Password?
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-[#A7C4B5]">
              Enter your email and we'll send you a password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="Enter your email"
              icon={Mail}
              register={register}
              error={errors.email}
              autoComplete="email"
              registration={{
                required: "Email is required",
                pattern: {
                  value: /^\S+@\S+\.\S+$/,
                  message: "Enter a valid email address",
                },
              }}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Sending..."
            >
              Send Reset Link
            </Button>
          </form>

          <div className="text-center mt-6">
            <Link
              to="/login"
              className="text-sm font-semibold text-[#10B981] dark:text-[#34D399] hover:underline"
            >
              Back to Login
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
