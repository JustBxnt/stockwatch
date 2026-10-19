import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockWatch OS - Kulkas Pintar & AI Vision",
  description: "Kurangi food waste dengan Smart Scan AI Gemma 4 dan pengingat kadaluwarsa pintar.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="antialiased min-h-screen bg-slate-50 dark:bg-zinc-950 text-slate-900 dark:text-zinc-100">
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.getRegistrations().then(function(regs) {
                    for (var r of regs) {
                      r.unregister();
                    }
                  });
                }
                if ('caches' in window) {
                  caches.keys().then(function(names) {
                    for (var name of names) {
                      caches.delete(name);
                    }
                  });
                }
              }
            `,
          }}
        />
        {children}
      </body>
    </html>
  );
}
