import React from "react";

const LogoWithName = ({
  className = "",
  logoSize = { base: 96, md: 140 }, // much bigger default
}: {
  className?: string;
  logoSize?: { base: number; md: number };
}) => (
  <div
    className={`flex flex-col items-center justify-center mb-8 ${className}`}
    data-testid="logo-with-name"
  >
    <img
      src="/lovable-uploads/eec23911-0863-40d6-84da-ea787a8759c1.png"
      alt="Artswarit Logo"
      // Remove any background, keep as actual image only (rounded, no shadow, no border)
      className="object-contain mb-2"
      style={{
        height: logoSize.base,
        width: logoSize.base,
        // Responsive for medium screens
        ["@media (min-width: 768px)" as any]: {
          height: logoSize.md,
          width: logoSize.md,
        },
      }}
    />
    <span className="font-semibold text-base md:text-lg text-purple-700 tracking-tight font-heading text-center">
      Artswarit
    </span>
  </div>
);

export default LogoWithName;
