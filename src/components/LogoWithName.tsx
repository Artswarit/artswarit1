
import React from "react";

const LogoWithName = ({
  className = "",
  logoSize = { base: 96, md: 140 },
}: {
  className?: string;
  logoSize?: { base: number; md: number };
}) => (
<div
    className={`flex flex-col items-center justify-center mb-6 sm:mb-8 ${className}`}
    data-testid="logo-with-name"
  >
    <img
      src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
      alt="Artswarit Logo"
      className="object-contain mb-2 w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 lg:w-36 lg:h-36"
    />
    <span className="font-semibold text-sm sm:text-base md:text-lg text-purple-700 tracking-tight font-heading text-center px-2">
      Artswarit
    </span>
  </div>
);

export default LogoWithName;

