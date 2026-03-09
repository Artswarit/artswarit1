import React from "react";

const LogoWithName = ({
  className = "",
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) => {
  const sizeMap = {
    sm: "w-10 h-10",
    md: "w-14 h-14",
    lg: "w-20 h-20 sm:w-24 sm:h-24",
  };
  return (
    <div
      className={`flex flex-col items-center justify-center gap-0.5 ${className}`}
      data-testid="logo-with-name"
    >
      <img
        src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
        alt="Artswarit Logo"
        className={`object-contain ${sizeMap[size]}`}
      />
      <span className="font-semibold text-base sm:text-lg text-primary tracking-tight font-heading leading-tight">
        Artswarit
      </span>
    </div>
  );
};

export default LogoWithName;
