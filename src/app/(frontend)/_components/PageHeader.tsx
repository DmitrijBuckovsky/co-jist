'use client';
import { useRouter } from 'next/navigation';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({ title, showBack = true, children }: PageHeaderProps) {
  const router = useRouter();

  return (
    <header className="page-header">
      <div className="page-header-left">
        {showBack && (
          <button onClick={() => router.back()} className="page-header-back">
            ← Zpět
          </button>
        )}
        <h1>{title}</h1>
      </div>
      {children && <div className="page-header-actions">{children}</div>}
    </header>
  );
}
