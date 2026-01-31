import type { ReactNode } from "react";

export default function DepositadorLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen w-screen bg-white overflow-hidden">
      {children}
    </div>
  );
}
