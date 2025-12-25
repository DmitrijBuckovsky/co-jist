import './styles.css';
import { BottomNav } from './_components/BottomNav';
import React, { Suspense } from 'react';

export const metadata = {
  description: 'Najděte recepty podle ingrediencí, které máte doma.',
  title: 'Co jíst? - Recepty podle ingrediencí',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
        <Suspense fallback={null}>
          <BottomNav />
        </Suspense>
      </body>
    </html>
  );
}
