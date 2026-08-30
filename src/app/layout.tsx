import type { Metadata } from "next";
import { Geist, Geist_Mono, Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/shared/lib/providers/query-provider";
import { Toaster } from "sonner";
import { AuthListener } from "@/features/auth/components/AuthListener";
import { ThemeProvider } from "next-themes";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    template: "%s | NextTemplate",
    default: "NextTemplate | Enterprise Next.js Scaffold",
  },
  description:
    "A production-ready Enterprise Next.js Scaffold.",
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL || "https://next-template.dev",
  ),
  openGraph: {
    title: "NextTemplate | Enterprise Next.js Scaffold",
    description:
      "A production-ready Enterprise Next.js Scaffold.",
    url: "https://next-template.dev",
    siteName: "NextTemplate",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "NextTemplate | Enterprise Next.js Scaffold",
    description:
      "Connecting 450M Offline Stores to the World Through a Map, a Photo, and a Pickup.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${geistSans.variable} ${geistMono.variable} font-[family-name:var(--font-poppins)] antialiased bg-background-primary text-text-primary min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            {/* Kept only the actual components, removed the phantom provider */}
            {children}

            <Toaster position="top-right" theme="system" richColors />
            <AuthListener />
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
