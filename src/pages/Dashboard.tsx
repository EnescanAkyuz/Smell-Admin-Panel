import { useState, useEffect } from 'react';
import {
    ShoppingCart,
    Package,
    Truck,
    CheckCircle,
    XCircle,
    DollarSign,
    AlertTriangle,
    Clock
} from 'lucide-react';
import type { DashboardStats, Order, Product } from '../types';
import { dashboardService } from '../services/dashboardService';
import { orderService } from '../services/orderService';
import { productService } from '../services/productService';
import './Dashboard.css';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
};

const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; class: string }> = {
        pending: { label: 'Bekliyor', class: 'badge-warning' },
        payment_confirmed: { label: 'Ödeme Onaylandı', class: 'badge-info' },
        preparing: { label: 'Hazırlanıyor', class: 'badge-primary' },
        shipped: { label: 'Kargoda', class: 'badge-info' },
        delivered: { label: 'Teslim Edildi', class: 'badge-success' },
        cancelled: { label: 'İptal', class: 'badge-danger' },
        refunded: { label: 'İade', class: 'badge-secondary' },
    };
    return statusMap[status] || { label: status, class: 'badge-secondary' };
};

export default function Dashboard() {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [recentOrders, setRecentOrders] = useState<Order[]>([]);
    const [lowStockProducts, setLowStockProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadDashboardData = async () => {
            try {
                const [statsData, ordersData, productsData] = await Promise.all([
                    dashboardService.getStats(),
                    orderService.getAll(),
                    productService.getAll()
                ]);

                setStats(statsData);
                setRecentOrders(ordersData.slice(0, 5));
                setLowStockProducts(productsData.filter(p => p.stock <= 10).slice(0, 5));
            } catch (err) {
                console.error('Dashboard yükleme hatası:', err);
            } finally {
                setLoading(false);
            }
        };

        loadDashboardData();
    }, []);

    if (loading || !stats) {
        return <div className="loading-state">Yükleniyor...</div>;
    }

    return (
        <div className="page dashboard">
            <div className="page-header">
                <h1 className="page-title">Dashboard</h1>
                <div className="date-info">
                    <Clock size={16} />
                    <span>{new Date().toLocaleDateString('tr-TR', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    })}</span>
                </div>
            </div>

            {/* Order Stats */}
            <section className="stats-section">
                <h2 className="section-title">Sipariş Özeti</h2>
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon primary">
                            <ShoppingCart size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Toplam Sipariş</span>
                            <span className="stat-value">{stats.totalOrders}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon warning">
                            <Clock size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Bekleyen</span>
                            <span className="stat-value">{stats.pendingOrders}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon info">
                            <Truck size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Kargoda</span>
                            <span className="stat-value">{stats.shippedOrders}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon success">
                            <CheckCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Tamamlanan</span>
                            <span className="stat-value">{stats.completedOrders}</span>
                        </div>
                    </div>

                    <div className="stat-card">
                        <div className="stat-icon danger">
                            <XCircle size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">İptal</span>
                            <span className="stat-value">{stats.cancelledOrders}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Revenue Stats */}
            <section className="stats-section">
                <h2 className="section-title">Ciro Özeti</h2>
                <div className="stats-grid revenue-grid">
                    <div className="stat-card revenue-card">
                        <div className="stat-icon success">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Bugün</span>
                            <span className="stat-value">{formatCurrency(stats.todayRevenue)}</span>
                        </div>
                    </div>

                    <div className="stat-card revenue-card total">
                        <div className="stat-icon primary">
                            <DollarSign size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Toplam Ciro</span>
                            <span className="stat-value">{formatCurrency(stats.totalRevenue)}</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Recent Orders */}
                <section className="dashboard-section orders-section">
                    <div className="section-header">
                        <h2 className="section-title">Son Siparişler</h2>
                        <a href="/orders" className="btn btn-ghost btn-sm">Tümünü Gör</a>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Sipariş No</th>
                                    <th>Müşteri</th>
                                    <th>Tutar</th>
                                    <th>Durum</th>
                                    <th>Tarih</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recentOrders.map((order) => {
                                    const status = getStatusBadge(order.status);
                                    return (
                                        <tr key={order.id}>
                                            <td>
                                                <a href={`/orders/${order.id}`} className="order-link">
                                                    {order.orderNumber}
                                                </a>
                                            </td>
                                            <td>{order.customerName}</td>
                                            <td className="font-medium">{formatCurrency(order.total)}</td>
                                            <td>
                                                <span className={`badge ${status.class}`}>{status.label}</span>
                                            </td>
                                            <td className="text-muted">{formatDate(order.orderDate)}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                {/* Alerts Section */}
                <section className="dashboard-section alerts-section">
                    <div className="section-header">
                        <h2 className="section-title">Uyarılar</h2>
                    </div>

                    {/* Low Stock Alerts */}
                    <div className="alert-group">
                        <h3 className="alert-group-title">
                            <Package size={16} /> Düşük Stok
                        </h3>
                        {lowStockProducts.map((product) => (
                            <div key={product.id} className="alert-item warning">
                                <AlertTriangle size={16} />
                                <div className="alert-content">
                                    <span className="alert-title">{product.name}</span>
                                    <span className="alert-detail">
                                        Stok: {product.stock}
                                    </span>
                                </div>
                                <a href={`/products/${product.id}`} className="btn btn-sm btn-ghost">
                                    Düzenle
                                </a>
                            </div>
                        ))}
                        {lowStockProducts.length === 0 && <p className="text-muted p-sm">Düşük stoklu ürün yok.</p>}
                    </div>
                </section>
            </div>
        </div>
    );
}
