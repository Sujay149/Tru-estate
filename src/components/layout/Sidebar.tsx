import { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  LayoutGrid,
  Users,
  PlayCircle,
  ChevronDown,
  ChevronUp,
  Server,
  FileText,
  Smartphone,
  XCircle,
  CheckCircle,
  FileCheck,
} from 'lucide-react';

interface SubItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface NavItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  children?: SubItem[];
}

const navItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  {
    id: 'nexus',
    label: 'Nexus',
    icon: <Users className="w-5 h-5" />,
  },
  {
    id: 'intake',
    label: 'Intake',
    icon: <PlayCircle className="w-5 h-5" />,
  },
  {
    id: 'services',
    label: 'Services',
    icon: <Server className="w-5 h-5" />,
    children: [
      { id: 'pre-active', label: 'Pre-active', icon: <PlayCircle className="w-5 h-5" /> },
      { id: 'active', label: 'Active', icon: <Smartphone className="w-5 h-5" /> },
      { id: 'blocked', label: 'Blocked', icon: <XCircle className="w-5 h-5" /> },
      { id: 'closed', label: 'Closed', icon: <CheckCircle className="w-5 h-5" /> },
    ],
  },
  {
    id: 'invoices',
    label: 'Invoices',
    icon: <FileText className="w-5 h-5" />,
    children: [
      { id: 'proforma', label: 'Proforma Invoices', icon: <FileCheck className="w-5 h-5" /> },
      { id: 'final', label: 'Final Invoices', icon: <FileCheck className="w-5 h-5" /> },
    ],
  },
];

export const Sidebar = () => {
  const [expandedItems, setExpandedItems] = useState<string[]>(['services', 'invoices']);
  const [activeItem, setActiveItem] = useState('proforma');

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleItemClick = (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      toggleExpand(id);
    } else {
      setActiveItem(id);
    }
  };

  return (
    <aside className="w-64 bg-card h-screen flex flex-col border-r border-border">
      {/* Logo/Brand */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-[#1a1a6e] rounded-xl flex items-center justify-center shadow-sm">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-primary-foreground">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" fill="#4444ff" />
                <path d="M2 17L12 22L22 17" stroke="#4444ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M2 12L12 17L22 12" stroke="#4444ff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <h1 className="text-foreground font-semibold text-base">Vault</h1>
              <p className="text-muted-foreground text-sm">Anurag Yadav</p>
            </div>
          </div>
          <ChevronDown className="w-5 h-5 text-muted-foreground" />
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <div className="space-y-1">
          {navItems.map((item) => (
            <div key={item.id}>
              {/* Parent Item */}
              <button
                onClick={() => handleItemClick(item.id, !!item.children)}
                className={cn(
                  'w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  item.children && expandedItems.includes(item.id)
                    ? 'bg-muted/60 text-foreground'
                    : activeItem === item.id && !item.children
                    ? 'bg-muted text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
                )}
              >
                <div className="flex items-center gap-3">
                  <span className="text-muted-foreground">{item.icon}</span>
                  <span>{item.label}</span>
                </div>
                {item.children && (
                  <span className="text-muted-foreground">
                    {expandedItems.includes(item.id) ? (
                      <ChevronUp className="w-4 h-4" />
                    ) : (
                      <ChevronDown className="w-4 h-4" />
                    )}
                  </span>
                )}
              </button>

              {/* Children */}
              {item.children && expandedItems.includes(item.id) && (
                <div className="mt-1 ml-2 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child.id}
                      onClick={() => setActiveItem(child.id)}
                      className={cn(
                        'w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200',
                        activeItem === child.id
                          ? 'text-foreground font-semibold'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/30'
                      )}
                    >
                      <span className="text-muted-foreground">{child.icon}</span>
                      <span>{child.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>
    </aside>
  );
};
