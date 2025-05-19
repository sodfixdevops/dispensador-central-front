import "@/app/ui/global.css";
import { inter } from "@/app/ui/fonts";
import SessionAuthProvider from "@/app/providers/SessionAuthProvider";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <SessionAuthProvider>{children}</SessionAuthProvider>
      </body>
    </html>
  );
}
