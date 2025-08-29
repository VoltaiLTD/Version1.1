import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, CreditCard, History, Settings } from 'lucide-react';

export default function BottomBar() {
  const pathname = usePathname();
  
  const navItems = [
    { href: '/dashboard', label: 'Home', icon: Home },
    { href: '/pos', label: 'POS', icon: CreditCard },
    { href: '/transactions', label: 'History', icon: History },
    { href: '/settings', label: 'Settings', icon: Settings },
  ];
  
  return (
    <div className="fixed bottom-0 inset-x-0 border-t bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 z-40 md:hidden">
      <div className="mx-auto max-w-screen-sm flex justify-around py-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`
                flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-0
                ${isActive 
                  ? 'text-primary-600' 
                  : 'text-neutral-500 hover:text-neutral-700'
                }
              `}
            >
              <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : ''}`} />
              <span className={`text-xs mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}