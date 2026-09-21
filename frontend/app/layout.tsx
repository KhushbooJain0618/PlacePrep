import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Navbar } from '../components/layout/Navbar';

export const metadata: Metadata = {
  title: 'PlacePrep — AI-Powered Campus Placement Preparation Assistant',
  description: 'Prepare Smarter. Interview Better. Get Placement Ready. Practice with AI Chat, realistic AI Speech + Vision Mock Interviews, and dynamic Personalized Placement Roadmaps.',
  keywords: ['placement preparation', 'AI mock interview', 'campus placements', 'DSA roadmap', 'Azure AI', 'technical interview'],
  authors: [{ name: 'PlacePrep Team' }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-black text-white flex flex-col selection:bg-purple-600 selection:text-white antialiased">
        <Navbar />
        <main className="flex-1 flex flex-col">
          {children}
        </main>
      </body>
    </html>
  );
}
