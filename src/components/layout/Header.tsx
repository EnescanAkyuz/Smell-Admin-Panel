import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
    Bell,
    Search,
    Menu,
    X,
    User,
    Settings,
    LogOut,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SETTINGS } from '../../config/settings';
import { MENU_ITEMS } from '../../config/menu';
import { systemAlerts } from '../../data/dummyData';
import './Header.css';

interface HeaderProps {
    onMenuClick: () => void;
    isSidebarCollapsed: boolean;
}

export default function Header({ onMenuClick, isSidebarCollapsed }: HeaderProps) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [showNotifications, setShowNotifications] = useState(false);
    const [showProfile, setShowProfile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const notificationRef = useRef<HTMLDivElement>(null);
    const profileRef = useRef<HTMLDivElement>(null);

    const activeMenuItem = MENU_ITEMS.find(item => {
        if (item.path === '/') return location.pathname === '/';
        return location.pathname.startsWith(item.path);
    });

    const pageTitle = activeMenuItem?.label || SETTINGS.DEFAULT_PAGE_TITLE;

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
                setShowNotifications(false);
            }
            if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
                setShowProfile(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const unreadAlerts = systemAlerts.filter(a => a.type === 'error' || a.type === 'warning').length;

    const getAlertIcon = (type: string) => {
        switch (type) {
            case 'error': return '🔴';
            case 'warning': return '🟡';
            default: return '🔵';
        }
    };

    return (
        <header className="header" style={{ left: isSidebarCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-width)' }}>
            <div className="header-left">
                <button className="menu-btn" onClick={onMenuClick}>
                    <Menu size={20} />
                </button>
                <h1 className="page-title">{pageTitle}</h1>
            </div>

            <div className="header-center">
                <div className="search-container">
                    <Search size={18} />
                    <input
                        type="text"
                        placeholder="Ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button className="search-clear" onClick={() => setSearchQuery('')}>
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            <div className="header-right">
                {/* Notifications */}
                <div className="dropdown" ref={notificationRef}>
                    <button
                        className="icon-btn"
                        onClick={() => setShowNotifications(!showNotifications)}
                    >
                        <Bell size={20} />
                        {unreadAlerts > 0 && (
                            <span className="notification-badge">{unreadAlerts}</span>
                        )}
                    </button>

                    {showNotifications && (
                        <div className="dropdown-menu notifications-menu">
                            <div className="dropdown-header">
                                <span>Bildirimler</span>
                                <span className="badge badge-primary">{unreadAlerts} yeni</span>
                            </div>
                            <div className="notifications-list">
                                {systemAlerts.slice(0, 5).map((alert) => (
                                    <div key={alert.id} className={`notification-item ${alert.type}`}>
                                        <span className="notification-icon">{getAlertIcon(alert.type)}</span>
                                        <div className="notification-content">
                                            <p>{alert.message}</p>
                                            <span className="notification-time">
                                                {new Date(alert.createdAt).toLocaleString('tr-TR')}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="dropdown-footer">
                                <a href="/notifications">Tüm bildirimleri gör</a>
                            </div>
                        </div>
                    )}
                </div>

                {/* Profile */}
                <div className="dropdown" ref={profileRef}>
                    <button
                        className="profile-btn"
                        onClick={() => setShowProfile(!showProfile)}
                    >
                        <div className="avatar">
                            {user?.username.charAt(0).toUpperCase()}
                        </div>
                    </button>

                    {showProfile && (
                        <div className="dropdown-menu profile-menu">
                            <div className="profile-header">
                                <div className="avatar avatar-lg">
                                    {user?.username.charAt(0).toUpperCase()}
                                </div>
                                <div className="profile-info">
                                    <span className="profile-name">{user?.username}</span>
                                    <span className="profile-email">{user?.email}</span>
                                </div>
                            </div>
                            <div className="dropdown-divider"></div>
                            <a href="/admin-users" className="dropdown-item">
                                <User size={16} />
                                <span>Profilim</span>
                            </a>
                            <a href="/settings" className="dropdown-item">
                                <Settings size={16} />
                                <span>Ayarlar</span>
                            </a>
                            <div className="dropdown-divider"></div>
                            <button className="dropdown-item danger" onClick={logout}>
                                <LogOut size={16} />
                                <span>Çıkış Yap</span>
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
