import { NavLink, useLocation } from 'react-router-dom';
import {
    LogOut,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SETTINGS } from '../../config/settings';
import { MENU_ITEMS } from '../../config/menu';
import './Sidebar.css';

interface SidebarProps {
    isCollapsed: boolean;
    onToggle: () => void;
}

export default function Sidebar({ isCollapsed, onToggle }: SidebarProps) {
    const { logout, user } = useAuth();
    const location = useLocation();

    const filteredMenuItems = MENU_ITEMS.filter(item => {
        // Filter by role
        if (item.roles && user && !item.roles.includes(user.role)) {
            return false;
        }

        // Filter by feature flag
        if (item.featureFlag) {
            const flag = item.featureFlag as keyof typeof SETTINGS.MODULAR_FEATURES;
            if (!SETTINGS.MODULAR_FEATURES[flag]) {
                return false;
            }
        }

        return true;
    });

    return (
        <aside className={`sidebar ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="logo">
                    <div className="logo-icon">{SETTINGS.SITE_LOGO_TEXT}</div>
                    {!isCollapsed && <span className="logo-text">{SETTINGS.SITE_NAME}</span>}
                </div>
                <button className="collapse-btn" onClick={onToggle}>
                    {isCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
                </button>
            </div>

            <nav className="sidebar-nav">
                {filteredMenuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path ||
                        (item.path !== '/' && location.pathname.startsWith(item.path));

                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive ? 'active' : ''}`}
                            title={isCollapsed ? item.label : undefined}
                        >
                            <Icon size={20} />
                            {!isCollapsed && <span>{item.label}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            <div className="sidebar-footer">
                {!isCollapsed && user && (
                    <div className="user-info">
                        <div className="avatar">{user.username.charAt(0).toUpperCase()}</div>
                        <div className="user-details">
                            <span className="user-name">{user.username}</span>
                            <span className="user-role">{user.role}</span>
                        </div>
                    </div>
                )}
                <button className="logout-btn" onClick={logout} title="Çıkış Yap">
                    <LogOut size={20} />
                    {!isCollapsed && <span>Çıkış Yap</span>}
                </button>
            </div>
        </aside>
    );
}
