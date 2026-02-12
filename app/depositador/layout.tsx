import type { ReactNode } from "react";

export default function DepositadorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-screen bg-white overflow-hidden relative">
      <img
        src="/images/imagenesbcp/Original-Dark.svg"
        alt="BCP"
        className="absolute left-4 top-4 w-28 h-auto pointer-events-none select-none"
      />
      {children}
    </div>
  );
}
