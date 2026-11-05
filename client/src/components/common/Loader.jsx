
import React from "react";

function Loader({
    fullScreen = true,
    label = "Loading...",
}) {
    return (
        <div
            role="status"
            aria-live="polite"
            className={`
                flex flex-col items-center justify-center gap-4
                ${fullScreen ? "min-h-screen w-full bg-[#f7faf9]" : "w-full py-12"}
            `}
        >
            {/* Spinner */}
            <div className="relative flex h-12 w-12 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-[3px] border-[#0f766e]/15" />

                <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-transparent border-t-[#0f766e]" />

                <div className="h-2.5 w-2.5 rounded-full bg-[#0f766e]" />
            </div>

            {/* Loading Text */}
            <div className="flex flex-col items-center gap-1">
                <p className="text-sm font-medium tracking-wide text-[#172b2a]">
                    {label}
                </p>

                <span className="text-xs text-[#172b2a]/45">
                    Please wait a moment
                </span>
            </div>
        </div>
    );
}

export default Loader;
