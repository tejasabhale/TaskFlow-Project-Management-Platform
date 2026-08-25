import { Link, useNavigate } from "react-router-dom";
import { Mail, User, Phone, AtSign } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import authService from "../../services/auth.service";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";

export default function Register() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      userName: "",
      fullName: "",
      mobileNo: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const password = watch("password");

  const onSubmit = async (data) => {
    try {
      const response = await authService.register({
        userName: data.userName,
        fullName: data.fullName,
        mobileNo: data.mobileNo,
        email: data.email,
        password: data.password,
      });

      toast.success(
        response?.message ||
          "Registration successful. Please verify your email.",
      );

      navigate("/verify-otp", {
        replace: true,
        state: {
          email: data.email,
        },
      });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Registration failed. Please try again.",
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#ECFDF5] dark:bg-[#07130F] px-4 py-6 sm:px-6 lg:px-8">
      <section className="w-full max-w-md">
        <div className="bg-white dark:bg-[#10251D] p-5 sm:p-8 rounded-2xl shadow-lg border border-[#D1FAE5] dark:border-[#1B4332]">
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17201B] dark:text-[#ECFDF5] mb-2">
              Create Account
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-[#A7C4B5]">
              Create your TaskFlow account
            </p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              id="fullName"
              label="Full Name"
              type="text"
              placeholder="Enter your full name"
              icon={User}
              register={register}
              error={errors.fullName}
              autoComplete="name"
              registration={{
                required: "Full name is required",
                minLength: {
                  value: 2,
                  message: "Full name must be at least 2 characters",
                },
              }}
            />

            <Input
              id="userName"
              label="Username"
              type="text"
              placeholder="Choose a username"
              icon={AtSign}
              register={register}
              error={errors.userName}
              autoComplete="username"
              registration={{
                required: "Username is required",
                minLength: {
                  value: 3,
                  message: "Username must be at least 3 characters",
                },
              }}
            />

            <Input
              id="mobileNo"
              label="Mobile Number"
              type="tel"
              placeholder="Enter your mobile number"
              icon={Phone}
              register={register}
              error={errors.mobileNo}
              autoComplete="tel"
              registration={{
                required: "Mobile number is required",
                pattern: {
                  value: /^[0-9]{10}$/,
                  message: "Enter a valid 10-digit mobile number",
                },
              }}
            />

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

            <PasswordInput
              id="password"
              label="Password"
              placeholder="Create a password"
              register={register}
              error={errors.password}
              autoComplete="new-password"
              registration={{
                required: "Password is required",
                pattern: {
                  value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
                  message:
                    "Use 8+ characters with uppercase, lowercase, number, and special character",
                },
              }}
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm Password"
              placeholder="Confirm your password"
              register={register}
              error={errors.confirmPassword}
              autoComplete="new-password"
              registration={{
                required: "Please confirm your password",
                validate: (value) =>
                  value === password || "Passwords do not match",
              }}
            />

            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Creating account..."
            >
              Create Account
            </Button>
          </form>

          <p className="text-center mt-6 text-sm sm:text-base text-gray-600 dark:text-[#A7C4B5]">
            Already have an account?
            <Link
              to="/login"
              className="text-[#10B981] dark:text-[#34D399] font-semibold ml-1 hover:underline"
            >
              Login
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
