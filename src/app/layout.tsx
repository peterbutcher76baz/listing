import type { Metadata } from "next";
import { Public_Sans } from "next/font/google";
import "./globals.css";
import { ListingProviders } from "@/contexts/listing-context";

const publicSans = Public_Sans({
  variable: "--font-public-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "RealInfo — Agent Command Centre",
  description: "Infosource.com.au · RealInfo. RESO-compliant listing generator, property gallery, and vendor strategy tools for agents.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${publicSans.variable} font-sans antialiased`}>
        <ListingProviders>{children}</ListingProviders>
      </body>
    </html>
  );
}
