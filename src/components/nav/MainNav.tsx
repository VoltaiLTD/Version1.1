import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, History, Settings } from 'lucide-react';

export function MainNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', label: 'Dashboard', icon: Home },
    { href: '/pos', label: 'POS', icon: CreditCard },
    { href: '/transactions', label: 'Transactions', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <nav className="flex items-center gap-2 md:gap-3">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`
              inline-flex items-center px-3 py-2 rounded-lg transition-colors
              ${isActive 
                ? 'bg-primary-100 text-primary-700 font-medium' 
                : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-800'
              }
            `}
          >
            <Icon className="h-4 w-4 mr-2 md:mr-1" />
            <span className="hidden sm:inline">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}