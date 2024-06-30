import type { Metadata } from "next";
import { Raleway } from "next/font/google";
import "./globals.css";
import { GeistSans } from "geist/font/sans";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-raleway" });

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${raleway.variable} ${GeistSans.variable}`}>
        {children}
      </body>
    </html>
  );
}
