import React from "react";

const LogoWithName = ({
  className = "",
}: {
  className?: string;
}) => (
  <div
    className={`flex flex-col items-center justify-center gap-1 ${className}`}
    data-testid="logo-with-name"
  >
    <img
      src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
      alt="Artswarit Logo"
      className="object-contain w-20 h-20 sm:w-24 sm:h-24"
    />
    <span className="font-semibold text-base sm:text-lg text-primary tracking-tight font-heading">
      Artswarit
    </span>
  </div>
);

export default LogoWithName;
