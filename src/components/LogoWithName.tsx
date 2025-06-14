import React from "react";

const LogoWithName = ({
  className = "",
  logoSize = { base: 56, md: 80 }, // default to 56px (h-14 w-14), 80px for md
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
      className="rounded-full object-cover shadow mb-2"
      style={{
        height: logoSize.base,
        width: logoSize.base,
        // scale up for md+ screens
        ...(logoSize && {
          ["@media (min-width: 768px)" as any]: {
            height: logoSize.md,
            width: logoSize.md,
          },
        }),
      }}
    />
    <span className="font-bold text-2xl md:text-3xl text-purple-700 tracking-tight font-heading text-center">
      Artswarit
    </span>
  </div>
);

export default LogoWithName;
