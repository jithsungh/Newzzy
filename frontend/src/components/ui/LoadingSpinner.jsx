import React from "react";
import { cn } from "../../lib/utils";

const LoadingSpinner = ({
  size = "md",
  className = "",
  text = "",
  fullscreen = false,
}) => {
  const sizeClasses = {
    sm: "loading-sm",
    md: "loading-md",
    lg: "loading-lg",
    xl: "loading-xl",
  };

  const LoadingContent = () => (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        className
      )}
    >
      <span
        className={cn(
          "loading loading-spinner text-primary",
          sizeClasses[size]
        )}
      ></span>
      {text && <p className="text-sm text-secondary animate-pulse">{text}</p>}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-base-100/80 backdrop-blur-sm">
        <LoadingContent />
      </div>
    );
  }

  return <LoadingContent />;
};

export default LoadingSpinner;
