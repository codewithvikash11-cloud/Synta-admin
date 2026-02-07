import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
    title: "Synta Admin",
    description: "Internal Admin Panel",
    robots: {
        index: false,
        follow: false,
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body className="antialiased bg-slate-950 text-slate-100 min-h-screen">
                {children}
            </body>
        </html>
    );
}
