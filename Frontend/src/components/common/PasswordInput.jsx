import { useState } from "react";
import { Eye, EyeOff, Lock } from "lucide-react";

export default function PasswordInput({
  id,
  label = "Password",
  placeholder = "Enter your password",
  register,
  error,
  registration = {},
  autoComplete = "current-password",
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div>
      <label
        htmlFor={id}
        className="block text-sm font-medium text-[#17201B] dark:text-[#ECFDF5] mb-2"
      >
        {label}
      </label>

      <div className="relative">
        <Lock
          size={20}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#10B981] dark:text-[#34D399]"
        />

        <input
          id={id}
          type={showPassword ? "text" : "password"}
          placeholder={placeholder}
          autoComplete={autoComplete}
          {...register(id, registration)}
          className={`
            w-full
            bg-white dark:bg-[#10251D]
            text-[#17201B] dark:text-[#ECFDF5]
            placeholder-gray-400 dark:placeholder-[#789A8A]
            border
            ${
              error
                ? "border-red-500"
                : "border-[#A7F3D0] dark:border-[#2D5A47]"
            }
            rounded-lg
            py-3
            pl-10
            pr-11
            outline-none
            focus:ring-2
            ${
              error
                ? "focus:ring-red-500"
                : "focus:ring-[#10B981] dark:focus:ring-[#34D399]"
            }
            focus:border-[#10B981]
            dark:focus:border-[#34D399]
            transition
          `}
        />

        <button
          type="button"
          onClick={() => setShowPassword((value) => !value)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#10B981] dark:hover:text-[#34D399]"
          aria-label={showPassword ? "Hide password" : "Show password"}
        >
          {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
        </button>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
