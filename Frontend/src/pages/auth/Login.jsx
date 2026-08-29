import { Link, useLocation, useNavigate } from "react-router-dom";
import { User } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

import useAuth from "../../hooks/useAuth";
import Input from "../../components/common/Input";
import PasswordInput from "../../components/common/PasswordInput";
import Button from "../../components/common/Button";

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const identifier = data.identifier.trim();

      // Check whether the user entered an email or username
      const isEmail = identifier.includes("@");

      const loginData = {
        userName: isEmail ? "" : identifier,
        email: isEmail ? identifier : "",
        password: data.password,
      };

      console.log("Login data:", loginData);

      const response = await login(loginData);

      toast.success(response?.message || "Login successful!");

      const destination = location.state?.from?.pathname || "/dashboard";

      navigate(destination, {
        replace: true,
      });
    } catch (error) {
      console.error("Login error:", error);

      toast.error(
        error?.response?.data?.message || "Invalid username/email or password.",
      );
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[#ECFDF5] dark:bg-[#07130F] px-4 py-6 sm:px-6 lg:px-8">
      <section className="w-full max-w-md">
        <div className="bg-white dark:bg-[#10251D] p-5 sm:p-8 rounded-2xl shadow-lg border border-[#D1FAE5] dark:border-[#1B4332]">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#17201B] dark:text-[#ECFDF5] mb-2">
              Welcome Back
            </h1>

            <p className="text-sm sm:text-base text-gray-600 dark:text-[#A7C4B5]">
              Login to your TaskFlow account
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Username / Email */}
            <Input
              id="identifier"
              label="Username or Email"
              type="text"
              placeholder="Enter your username or email"
              icon={User}
              register={register}
              error={errors.identifier}
              autoComplete="username"
              registration={{
                required: "Username or email is required",
              }}
            />

            {/* Password */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-[#17201B] dark:text-[#ECFDF5]"
                >
                  Password
                </label>

                <Link
                  to="/forgot-password"
                  className="text-xs sm:text-sm text-[#10B981] dark:text-[#34D399] hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <PasswordInput
                id="password"
                label=""
                placeholder="Enter your password"
                register={register}
                error={errors.password}
                registration={{
                  required: "Password is required",
                }}
              />
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              loading={isSubmitting}
              loadingText="Logging in..."
            >
              Login
            </Button>
          </form>

          {/* Register */}
          <p className="text-center mt-6 text-sm sm:text-base text-gray-600 dark:text-[#A7C4B5]">
            Don't have an account?
            <Link
              to="/register"
              className="text-[#10B981] dark:text-[#34D399] font-semibold ml-1 hover:underline"
            >
              Register
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
