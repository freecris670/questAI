import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from './providers';
import { Onboarding } from '@/components/onboarding/Onboarding';

const inter = Inter({ subsets: ['latin', 'cyrillic'] });

export const metadata: Metadata = {
  title: 'QuestAI - Интерактивные квесты с искусственным интеллектом',
  description: 'Создавайте и проходите уникальные квесты, генерируемые искусственным интеллектом',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>
          {children}
          <Toaster />
          <Onboarding />
        </Providers>
      </body>
    </html>
  );
}
