import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/supabase/auth-context";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "DevBounty - Connect Developers to Open Source Projects",
  description:
    "A platform for developers to find and claim open source bounties",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
