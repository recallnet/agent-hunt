import type { AppProps } from "next/app";
import { Providers } from "@components/Providers";
import { AppBar } from "@/components/AppBar";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import "@styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <Providers>
      <Head>
        <title>Recall</title>
        <meta name="description" content="Agent Hunt for Recall" />
        <link rel="icon" href="/agent-icon.svg" />
      </Head>

      <div className="content-wrapper flex flex-col min-h-screen">
        <AppBar />
        <main className="flex-grow">
          <Component {...pageProps} />
        </main>
        <footer className="w-full text-center p-4 text-muted-foreground">
          <p>© {new Date().getFullYear()} Recall. All Rights Reserved.</p>
        </footer>
        <Toaster position="bottom-center" />
      </div>
    </Providers>
  );
}

export default MyApp;
