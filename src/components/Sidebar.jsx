"use client";
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Ticket, Package, PlusCircle, 
  ShoppingCart, MessageSquare, UserCircle, Layers 
} from 'lucide-react';

const menuItems = [
  { name: 'Dashboard', icon: LayoutDashboard, path: '/dashboard' },
  { name: 'All Service Ticket', icon: Ticket, path: '/all-service-ticket' },
  { name: 'All Products', icon: Layers, path: '/all-products' },
  { name: 'Add Products', icon: PlusCircle, path: '/add-products' },
  { name: 'Orders', icon: ShoppingCart, path: '/orders' },
  
  { name: 'Chat', icon: MessageSquare, path: '/chat' },
  { name: 'Profile', icon: UserCircle, path: '/profile' },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 bg-white h-screen sticky top-0 border-r border-slate-100 flex flex-col">
      <div className="p-8">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white font-black text-xl">A</div>
          <span className="text-xl font-black text-slate-800 tracking-tight">AgroVet</span>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {menuItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link 
              key={item.name} 
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3.5 rounded-2xl font-bold transition-all ${
                isActive 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-100' 
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <item.icon size={22} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 bg-slate-50 m-4 rounded-[2rem] border border-slate-100">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Support</p>
        <p className="text-sm text-slate-600 mt-1">Need help? Contact Dev</p>
      </div>
    </aside>
  );
}