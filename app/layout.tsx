import type { Metadata } from "next";
import "./globals.css";
import SessionWrapper from "@/components/SessionWrapper"; // ইমপোর্ট করো

export const metadata: Metadata = {
  title: "Adiat AI",
  description: "Created by Adiat Sarker",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta name="color-scheme" content="dark" />
      </head>
      <body>
        {/* পুরো অ্যাপকে সেশন দিয়ে র‍্যাপ করে দাও */}
        <SessionWrapper>
          {children}
        </SessionWrapper>
      </body>
    </html>
  );
}