import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SetToClose Dashboard",
  description: "Agency performance dashboard",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
