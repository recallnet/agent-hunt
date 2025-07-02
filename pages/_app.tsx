import type { AppProps } from "next/app";
import { Providers } from "@components/Providers";
import { AppBar } from "@/components/AppBar";
import { Toaster } from "react-hot-toast";
import Head from "next/head";
import Script from "next/script";
import "@styles/globals.css";

function MyApp({ Component, pageProps }: AppProps) {
  const siteTitle = "Recall | AgentHunt";
  const siteDescription = "Hunt, discover, and vote for the best AI agents on the web.";
  const siteUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://agenthunt.recall.network";
  const previewImageUrl = `${siteUrl}/agent-fallback-icon.png`;
  const twitterHandle = "@recallnet";

  return (
    <Providers>
      <Head>
        <title>{siteTitle}</title>
        <meta name="description" content={siteDescription} />
        <link rel="icon" href="/agent-icon.svg" />

        {/* --- Open Graph / Facebook Meta Tags --- */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={siteUrl} />
        <meta property="og:title" content={siteTitle} />
        <meta property="og:description" content={siteDescription} />
        <meta property="og:image" content={previewImageUrl} />

        {/* --- Twitter Card Meta Tags --- */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta property="twitter:domain" content="agenthunt.recall.network" />
        <meta property="twitter:url" content={siteUrl} />
        <meta name="twitter:title" content={siteTitle} />
        <meta name="twitter:description" content={siteDescription} />
        <meta name="twitter:image" content={previewImageUrl} />
        <meta name="twitter:site" content={twitterHandle} />
      </Head>

      {/* --- Google Tag Manager Scripts --- */}
      {/* The 'afterInteractive' strategy loads the script after the page becomes interactive,
        which is recommended for analytics scripts to not block page rendering.
      */}
      <Script strategy="afterInteractive" src="https://www.googletagmanager.com/gtag/js?id=G-4GFTKYQ794" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-4GFTKYQ794');
        `}
      </Script>

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
