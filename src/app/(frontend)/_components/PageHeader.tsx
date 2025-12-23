'use client';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
}

export function PageHeader({ title, showBack = true }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="page-header">
      {showBack && (
        <button onClick={() => router.back()} className="page-header-back">
          ← Zpět
        </button>
      )}
      <h1>{title}</h1>
    </header>
  );
}
