import {
    LayoutDashboard,
    Package,
    FolderTree,
    ShoppingCart,
    Users,
    Image,
    MessageSquare,
    FileText,
    UserCog,
    type LucideIcon,
} from 'lucide-react';
import type { AdminUser } from '../types';

export interface MenuItem {
    path: string;
    icon: LucideIcon;
    label: string;
    roles?: AdminUser['role'][]; // Optional: restrict to certain roles
    featureFlag?: string; // Optional: show only if a feature is enabled in settings
}

export const MENU_ITEMS: MenuItem[] = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: Package, label: 'Ürünler' },
    { path: '/categories', icon: FolderTree, label: 'Kategoriler' },
    { path: '/orders', icon: ShoppingCart, label: 'Siparişler' },
    { path: '/customers', icon: Users, label: 'Müşteriler' },
    {
        path: '/banners',
        icon: Image,
        label: 'Banner & İçerik',
        featureFlag: 'BANNERS'
    },
    {
        path: '/reviews',
        icon: MessageSquare,
        label: 'Yorumlar',
        featureFlag: 'REVIEWS'
    },
    {
        path: '/legal-texts',
        icon: FileText,
        label: 'Yasal Metinler',
        featureFlag: 'LEGAL_TEXTS'
    },
    {
        path: '/admin-users',
        icon: UserCog,
        label: 'Admin Kullanıcılar',
        roles: ['super_admin'] // Only super admins can see this
    },
];
