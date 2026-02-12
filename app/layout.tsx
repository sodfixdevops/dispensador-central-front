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
      <head>
        <link
          rel="icon"
          href="/images/imagenesbcp/Favicon%20Azul/Large.svg"
          type="image/svg+xml"
        />
        <link
          rel="shortcut icon"
          href="/images/imagenesbcp/Favicon%20Azul/Large.svg"
        />
        <meta name="theme-color" content="#0b5fff" />
      </head>
      <body className={`${inter.className} antialiased`}>
        <SessionAuthProvider>{children}</SessionAuthProvider>
      </body>
    </html>
  );
}
