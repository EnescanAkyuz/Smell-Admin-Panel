import { useState, useEffect } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    Shield,
    UserCog,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
} from 'lucide-react';
import { adminService } from '../../services/adminService';
import type { AdminUser, LoginLog } from '../../types';
import './AdminUsers.css';

const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const roleLabels: Record<AdminUser['role'], { label: string; color: string }> = {
    super_admin: { label: 'Süper Admin', color: 'primary' },
    admin: { label: 'Admin', color: 'info' },
    editor: { label: 'Editör', color: 'secondary' },
};

export default function AdminUserList() {
    const [userList, setUserList] = useState<AdminUser[]>([]);
    const [loginLogs, setLoginLogs] = useState<LoginLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [editingUser, setEditingUser] = useState<AdminUser | null>(null);
    const [activeTab, setActiveTab] = useState<'users' | 'logs'>('users');
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        username: '',
        email: '',
        role: 'admin' as AdminUser['role'],
        password: '',
    });

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAll();
            setUserList(data);
        } catch (err) {
            console.error('Yükleme hatası:', err);
            setError('Kullanıcılar yüklenemedi.');
        } finally {
            setLoading(false);
        }
    };

    const loadLogs = async () => {
        try {
            setLogsLoading(true);
            const data = await adminService.getLoginLogs();
            setLoginLogs(data);
        } catch (err) {
            console.error('Log yükleme hatası:', err);
        } finally {
            setLogsLoading(false);
        }
    };

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        if (activeTab === 'logs') {
            loadLogs();
        }
    }, [activeTab]);

    const openAddModal = () => {
        setEditingUser(null);
        setFormData({
            username: '',
            email: '',
            role: 'admin',
            password: '',
        });
        setShowModal(true);
    };

    const openEditModal = (user: AdminUser) => {
        setEditingUser(user);
        setFormData({
            username: user.username,
            email: user.email,
            role: user.role,
            password: '',
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            setError(null);
            if (editingUser) {
                await adminService.update(editingUser.id, {
                    username: formData.username,
                    role: formData.role,
                    email: formData.email
                });
            } else {
                await adminService.create({
                    username: formData.username,
                    email: formData.email,
                    role: formData.role
                });
            }
            await loadUsers();
            setShowModal(false);
        } catch (err: any) {
            setError(err.message || 'Kaydedilemedi.');
        } finally {
            setSaving(false);
        }
    };

    const toggleStatus = async (user: AdminUser) => {
        try {
            const newStatus = user.status === 'active' ? 'inactive' : 'active';
            await adminService.updateStatus(user.id, newStatus);
            setUserList(prev => prev.map(u =>
                u.id === user.id ? { ...u, status: newStatus } : u
            ));
        } catch (err) {
            console.error('Durum güncelleme hatası:', err);
        }
    };

    const deleteUser = async (userId: string) => {
        if (!window.confirm('Bu kullanıcıyı silmek istediğinize emin misiniz?')) return;
        try {
            await adminService.delete(userId);
            setUserList(prev => prev.filter(u => u.id !== userId));
        } catch (err) {
            console.error('Silme hatası:', err);
        }
    };

    if (loading) return <div className="loading-state">Admin kullanıcılar yükleniyor...</div>;

    return (
        <div className="page admin-users-page">
            <div className="page-header">
                <h1 className="page-title">Admin Kullanıcılar</h1>
                {activeTab === 'users' && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Yeni Admin
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'users' ? 'active' : ''}`}
                    onClick={() => setActiveTab('users')}
                >
                    <UserCog size={16} />
                    Kullanıcılar
                </button>
                <button
                    className={`tab ${activeTab === 'logs' ? 'active' : ''}`}
                    onClick={() => setActiveTab('logs')}
                >
                    <Clock size={16} />
                    Giriş Kayıtları
                </button>
            </div>

            {/* Users Tab */}
            {activeTab === 'users' && (
                <div className="users-grid">
                    {userList.map((user) => {
                        const role = roleLabels[user.role];
                        return (
                            <div key={user.id} className={`user-card ${user.status === 'inactive' ? 'inactive' : ''}`}>
                                <div className="user-avatar">
                                    {user.username.charAt(0).toUpperCase()}
                                </div>

                                <div className="user-info">
                                    <h3 className="user-name">{user.username}</h3>
                                    <span className="user-email">{user.email}</span>
                                    <div className="user-meta">
                                        <span className={`badge badge-${role.color}`}>{role.label}</span>
                                        <span className={`status-dot ${user.status}`}></span>
                                        <span className="status-text">{user.status === 'active' ? 'Aktif' : 'Pasif'}</span>
                                    </div>
                                </div>

                                <div className="user-details">
                                    <div className="detail-item">
                                        <span className="detail-label">Oluşturulma</span>
                                        <span className="detail-value">{formatDate(user.createdAt)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Son Giriş</span>
                                        <span className="detail-value">{formatDate(user.lastLogin)}</span>
                                    </div>
                                </div>

                                <div className="user-actions">
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => openEditModal(user)}
                                        title="Düzenle"
                                    >
                                        <Edit size={16} />
                                    </button>
                                    <button
                                        className={`btn btn-ghost btn-icon ${user.status === 'active' ? 'text-success' : 'text-danger'}`}
                                        onClick={() => toggleStatus(user)}
                                        title={user.status === 'active' ? 'Devre Dışı Bırak' : 'Aktif Et'}
                                    >
                                        <Shield size={16} />
                                    </button>
                                    <button
                                        className="btn btn-ghost btn-icon"
                                        onClick={() => deleteUser(user.id)}
                                        title="Sil"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                    {userList.length === 0 && (
                        <div className="empty-state">
                            <UserCog size={48} />
                            <p>Henüz admin kullanıcı bulunmuyor.</p>
                        </div>
                    )}
                </div>
            )}

            {/* Login Logs Tab */}
            {activeTab === 'logs' && (
                <div className="table-container">
                    {logsLoading ? (
                        <div className="p-xl text-center">Loglar yükleniyor...</div>
                    ) : (
                        <table className="table logs-table">
                            <thead>
                                <tr>
                                    <th>Kullanıcı</th>
                                    <th>IP Adresi</th>
                                    <th>Durum</th>
                                    <th>Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loginLogs.map((log) => (
                                    <tr key={log.id}>
                                        <td className="font-medium">{log.username}</td>
                                        <td>
                                            <code className="ip-code">{log.ip}</code>
                                        </td>
                                        <td>
                                            {log.status === 'success' ? (
                                                <span className="log-status success">
                                                    <CheckCircle size={14} /> Başarılı
                                                </span>
                                            ) : (
                                                <span className="log-status failed">
                                                    <XCircle size={14} /> Başarısız
                                                </span>
                                            )}
                                        </td>
                                        <td className="text-muted">{formatDate(log.timestamp)}</td>
                                    </tr>
                                ))}
                                {loginLogs.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center p-xl">Giriş kaydı bulunamadı.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Add/Edit User Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingUser ? 'Admin Düzenle' : 'Yeni Admin Ekle'}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            {error && (
                                <div className="alert alert-danger mb-md">
                                    <AlertCircle size={20} />
                                    <span>{error}</span>
                                </div>
                            )}
                            <div className="input-group">
                                <label className="input-label">Kullanıcı Adı *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.username}
                                    onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                                    placeholder="Kullanıcı adı"
                                />
                            </div>

                            <div className="input-group mt-md">
                                <label className="input-label">E-posta *</label>
                                <input
                                    type="email"
                                    className="input"
                                    value={formData.email}
                                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                                    placeholder="E-posta adresi"
                                />
                            </div>

                            <div className="input-group mt-md">
                                <label className="input-label">Rol *</label>
                                <select
                                    className="input"
                                    value={formData.role}
                                    onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as AdminUser['role'] }))}
                                >
                                    <option value="editor">Editör</option>
                                    <option value="admin">Admin</option>
                                    <option value="super_admin">Süper Admin</option>
                                </select>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)} disabled={saving}>
                                İptal
                            </button>
                            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
                                {saving ? 'Kaydediliyor...' : (editingUser ? 'Güncelle' : 'Ekle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
