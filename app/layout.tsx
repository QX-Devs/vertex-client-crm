import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AnimatedBackground from "@/components/ui/AnimatedBackground";
import { LanguageProvider } from "@/lib/LanguageContext";
import { ThemeProvider } from "@/lib/ThemeContext";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const viewport: Viewport = {
  themeColor: "#10b981",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Vertex Client Portal | AI Business & CRM Suite",
    template: "%s | Vertex CRM",
  },
  description: "Unified AI-powered client portal to manage customer conversations, leads, orders, WhatsApp & Instagram channels, and real-time business settings.",
  keywords: [
    "Vertex",
    "Client CRM",
    "Business Portal",
    "WhatsApp Automation",
    "Instagram CRM",
    "Lead Management",
    "Order Tracking",
    "AI Customer Service"
  ],
  authors: [{ name: "Vertex AI" }],
  creator: "Vertex Automation",
  publisher: "Vertex Technologies",
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/icon.svg", sizes: "any" }
    ],
    apple: [
      { url: "/icon.svg", sizes: "180x180", type: "image/svg+xml" }
    ],
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "Vertex Client Portal | AI Business & CRM Suite",
    description: "Manage conversations, leads, bookings, and multi-channel messaging in one unified workspace.",
    siteName: "Vertex Client Portal",
    locale: "ar_JO",
    alternateLocale: ["en_US"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Vertex Client Portal",
    description: "Unified AI-powered client portal for conversations, leads, and orders.",
  },
  applicationName: "Vertex CRM",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className={inter.className} suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var key = 'vertex_client_theme';
                  var saved = localStorage.getItem(key);
                  var isDark = saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                    document.documentElement.style.colorScheme = 'dark';
                  } else {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.style.colorScheme = 'light';
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="font-sans antialiased min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <ThemeProvider>
          <LanguageProvider>
            <AnimatedBackground />
            <div className="relative z-10">{children}</div>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
