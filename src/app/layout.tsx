import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Your conveyancing case",
  description: "Clear, plain-English visibility into the progress of your property purchase.",
};

const RootLayout = ({ children }: Readonly<{ children: React.ReactNode }>) => (
  <html lang="en" className="h-full antialiased">
    <body className="bg-muted/30 min-h-full flex flex-col">{children}</body>
  </html>
);

export default RootLayout;
