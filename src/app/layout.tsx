import type { Metadata } from 'next';
import { Schibsted_Grotesk } from 'next/font/google';
import './globals.css';

const schibsted = Schibsted_Grotesk({
  variable: '--font-schibsted',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
});

export const metadata: Metadata = {
  title: 'Intro Forge AI',
  description:
    'AI-powered message generator that helps job seekers and professionals craft personalized, compelling outreach messages for LinkedIn, email introductions, and cover letters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={schibsted.variable}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
