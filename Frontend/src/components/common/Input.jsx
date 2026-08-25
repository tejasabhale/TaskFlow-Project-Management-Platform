export default function Input({
  id,
  label,
  type = "text",
  placeholder,
  icon: Icon,
  error,
  register,
  registration = {},
  autoComplete,
  disabled = false,
}) {
  return (
    <div>
      {label && (
        <label
          htmlFor={id}
          className="block text-sm font-medium text-[#17201B] dark:text-[#ECFDF5] mb-2"
        >
          {label}
        </label>
      )}

      <div className="relative">
        {Icon && (
          <Icon
            size={20}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#10B981] dark:text-[#34D399]"
          />
        )}

        <input
          id={id}
          type={type}
          placeholder={placeholder}
          autoComplete={autoComplete}
          disabled={disabled}
          {...(register ? register(id, registration) : {})}
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
            ${Icon ? "pl-10" : "pl-4"}
            pr-4
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
            disabled:opacity-60
            disabled:cursor-not-allowed
          `}
        />
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
