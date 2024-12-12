import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "SUNRINPASSTEST",
  description: "선린패스",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html>
      <body>
        <img className="logo" src="/sp.png" width={150} />
        {children}
      </body>
    </html>
  );
}
