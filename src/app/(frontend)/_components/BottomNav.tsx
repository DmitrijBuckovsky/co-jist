'use client';

import { CalendarCheck, ChefHat, List, Search, Shuffle } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

const NAV_ITEMS = [
  { view: 'random', label: 'Náhodné', icon: Shuffle },
  { view: 'match', label: 'Ingredience', icon: ChefHat },
  { view: 'search', label: 'Hledat', icon: Search },
  { view: 'all', label: 'Všechny', icon: List },
  { view: 'zerowaste', label: 'Plán', icon: CalendarCheck },
] as const;

type View = (typeof NAV_ITEMS)[number]['view'];

function BottomNavContent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [activeView, setActiveView] = useState<View | null>(null);

  useEffect(() => {
    if (pathname === '/') {
      // On home page, get view from URL param or default to 'random'
      const urlView = searchParams.get('view') as View | null;
      setActiveView(urlView || 'random');
      // Store in sessionStorage for detail pages
      sessionStorage.setItem('lastView', urlView || 'random');
    } else {
      // On other pages (recipe detail, results), read from sessionStorage
      const lastView = sessionStorage.getItem('lastView') as View | null;
      setActiveView(lastView);
    }
  }, [pathname, searchParams]);

  return (
    <>
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.view;

        return (
          <Link key={item.view} href={`/?view=${item.view}`} className={`bottom-nav-item ${isActive ? 'active' : ''}`}>
            <Icon size={24} strokeWidth={isActive ? 2.5 : 2} />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </>
  );
}

export function BottomNav() {
  return (
    <nav className="bottom-nav">
      <Suspense fallback={null}>
        <BottomNavContent />
      </Suspense>
    </nav>
  );
}
