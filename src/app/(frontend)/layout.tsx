import './styles.css';
import React from 'react';

export const metadata = {
  description: 'Najděte recepty podle ingrediencí, které máte doma.',
  title: 'Co jíst? - Recepty podle ingrediencí',
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props;

  return (
    <html lang="en">
      <body>
        <main>{children}</main>
      </body>
    </html>
  );
}
