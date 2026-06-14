import {
  LayoutDashboard,
  User,
  Settings,
  Users,
  ShoppingCart,
  Shield,
  Mail,
} from 'lucide-react';
import type { MenuItem } from './SidebarMenuItem';

export const menuItems: MenuItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    href: '/',
  },
  {
    id: 'templates',
    label: 'Templates',
    icon: Mail,
    href: '/templates',
  },
  {
    id: 'profile',
    label: 'Public Profile',
    icon: User,
    children: [
      { id: 'overview', label: 'Overview', href: '/profile' },
      { id: 'settings', label: 'Settings', href: '/profile/settings' },
    ],
  },
  {
    id: 'account',
    label: 'My Account',
    icon: Settings,
    children: [
      { id: 'general', label: 'General', href: '/account' },
      { id: 'security', label: 'Security', href: '/account/security' },
    ],
  },
  {
    id: 'network',
    label: 'Network',
    icon: Users,
    children: [
      { id: 'get-started', label: 'Get Started', href: '/network' },
      { id: 'user-cards', label: 'User Cards', href: '/network/cards' },
      { id: 'user-table', label: 'User Table', href: '/network/table' },
    ],
  },
  {
    id: 'store',
    label: 'Store - Client',
    icon: ShoppingCart,
    children: [
      { id: 'products', label: 'Products', href: '/store/products' },
      { id: 'orders', label: 'Orders', href: '/store/orders' },
    ],
  },
  {
    id: 'auth',
    label: 'Authentication',
    icon: Shield,
    children: [
      { id: 'login', label: 'Login', href: '/login' },
      { id: 'register', label: 'Register', href: '/register' },
    ],
  },
];
