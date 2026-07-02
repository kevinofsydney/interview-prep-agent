import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Interview Prep Agent",
  description: "Source-grounded interview prep reports for specific roles.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
