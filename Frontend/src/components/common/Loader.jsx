export default function Loader({ fullScreen = false }) {
  return (
    <div
      className={
        fullScreen
          ? "min-h-screen flex items-center justify-center bg-[#ECFDF5] dark:bg-[#07130F]"
          : "flex items-center justify-center"
      }
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#A7F3D0] border-t-[#10B981] dark:border-[#2D5A47] dark:border-t-[#34D399]" />
    </div>
  );
}
