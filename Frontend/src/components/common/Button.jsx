export default function Button({
  children,
  type = "button",
  onClick,
  disabled = false,
  loading = false,
  loadingText = "Please wait...",
  fullWidth = true,
  variant = "primary",
  className = "",
}) {
  const variants = {
    primary:
      "bg-[#10B981] dark:bg-[#34D399] text-white dark:text-[#07130F] hover:bg-[#059669] dark:hover:bg-[#6EE7B7]",
    secondary:
      "bg-[#ECFDF5] dark:bg-[#16382B] text-[#17201B] dark:text-[#ECFDF5] hover:bg-[#D1FAE5] dark:hover:bg-[#1E4A38]",
    outline:
      "border border-[#10B981] dark:border-[#34D399] text-[#10B981] dark:text-[#34D399] hover:bg-[#ECFDF5] dark:hover:bg-[#10251D]",
    danger: "bg-red-500 text-white hover:bg-red-600",
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        ${fullWidth ? "w-full" : "w-auto"}
        ${variants[variant]}
        px-4 py-3
        rounded-lg
        font-semibold
        transition-colors
        duration-200
        disabled:opacity-60
        disabled:cursor-not-allowed
        ${className}
      `}
    >
      {loading ? loadingText : children}
    </button>
  );
}
