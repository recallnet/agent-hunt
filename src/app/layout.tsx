import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { AppBar } from "@/components/AppBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Agent Hunt",
  description: "The premier platform for AI agent bounties.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <div className="flex flex-col min-h-screen">
            <AppBar />
            <main className="flex-grow">{children}</main>
            <footer className="w-full text-center p-4 text-muted-foreground">
              <p>&copy; {new Date().getFullYear()} Recall. All Rights Reserved.</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
