import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";
import { AppBar } from "@/components/AppBar";

export const metadata: Metadata = {
  title: "Agent Hunt",
  description: "The premier platform for AI agent bounties.",
  icons: [{ rel: "icon", url: "/agent-icon.svg" }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="content-wrapper flex flex-col min-h-screen">
            <AppBar />
            <main className="flex-grow">{children}</main>
            <footer className="w-full text-center p-4 text-muted-foreground">
              <p>© {new Date().getFullYear()} Recall. All Rights Reserved.</p>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
