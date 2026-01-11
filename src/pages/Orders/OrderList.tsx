import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
    Search,
    Filter,
    Eye,
    Calendar,
    ShoppingCart,
} from 'lucide-react';
import type { Order, OrderStatus } from '../../types';
import { orderService } from '../../services/orderService';
import './Orders.css';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
};

const statusOptions: { value: OrderStatus | 'all'; label: string }[] = [
    { value: 'all', label: 'Tüm Durumlar' },
    { value: 'pending', label: 'Bekliyor' },
    { value: 'payment_confirmed', label: 'Ödeme Onaylandı' },
    { value: 'preparing', label: 'Hazırlanıyor' },
    { value: 'shipped', label: 'Kargoda' },
    { value: 'delivered', label: 'Teslim Edildi' },
    { value: 'cancelled', label: 'İptal' },
    { value: 'refunded', label: 'İade' },
];

const getStatusBadge = (status: OrderStatus) => {
    const statusMap: Record<OrderStatus, { label: string; class: string }> = {
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

const getPaymentBadge = (status: string) => {
    const map: Record<string, { label: string; class: string }> = {
        pending: { label: 'Bekliyor', class: 'badge-warning' },
        paid: { label: 'Ödendi', class: 'badge-success' },
        failed: { label: 'Başarısız', class: 'badge-danger' },
        refunded: { label: 'İade Edildi', class: 'badge-secondary' },
    };
    return map[status] || { label: status, class: 'badge-secondary' };
};

export default function OrderList() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    useEffect(() => {
        const loadOrders = async () => {
            try {
                const data = await orderService.getAll();
                setOrders(data);
            } catch (err) {
                console.error('Siparişler yüklenirken hata:', err);
            } finally {
                setLoading(false);
            }
        };
        loadOrders();
    }, []);

    const filteredOrders = orders.filter((order) => {
        const matchesSearch =
            order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.customerName.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;

        let matchesDate = true;
        if (dateFrom) {
            matchesDate = new Date(order.orderDate) >= new Date(dateFrom);
        }
        if (dateTo && matchesDate) {
            matchesDate = new Date(order.orderDate) <= new Date(dateTo + 'T23:59:59');
        }

        return matchesSearch && matchesStatus && matchesDate;
    });

    if (loading) {
        return <div className="loading-state">Siparişler yükleniyor...</div>;
    }

    return (
        <div className="page orders-page">
            <div className="page-header">
                <h1 className="page-title">Siparişler</h1>
                <div className="order-stats">
                    <div className="order-stat">
                        <span className="stat-value">{orders.length}</span>
                        <span className="stat-label">Toplam</span>
                    </div>
                    <div className="order-stat pending">
                        <span className="stat-value">{orders.filter(o => o.status === 'pending').length}</span>
                        <span className="stat-label">Bekleyen</span>
                    </div>
                    <div className="order-stat shipped">
                        <span className="stat-value">{orders.filter(o => o.status === 'shipped').length}</span>
                        <span className="stat-label">Kargoda</span>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Sipariş no veya müşteri ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as OrderStatus | 'all')}
                    >
                        {statusOptions.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>

                <div className="filter-group date-filter">
                    <Calendar size={16} />
                    <input
                        type="date"
                        className="input"
                        value={dateFrom}
                        onChange={(e) => setDateFrom(e.target.value)}
                        placeholder="Başlangıç"
                    />
                    <span className="date-separator">-</span>
                    <input
                        type="date"
                        className="input"
                        value={dateTo}
                        onChange={(e) => setDateTo(e.target.value)}
                        placeholder="Bitiş"
                    />
                </div>

                <div className="filter-info">
                    {filteredOrders.length} sipariş bulundu
                </div>
            </div>

            {/* Orders Table */}
            <div className="table-container">
                <table className="table orders-table">
                    <thead>
                        <tr>
                            <th>Sipariş No</th>
                            <th>Müşteri</th>
                            <th>Tarih</th>
                            <th>Tutar</th>
                            <th>Ödeme</th>
                            <th>Durum</th>
                            <th>İşlem</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredOrders.map((order) => {
                            const status = getStatusBadge(order.status);
                            const payment = getPaymentBadge(order.paymentStatus);
                            return (
                                <tr key={order.id}>
                                    <td>
                                        <Link to={`/orders/${order.id}`} className="order-link">
                                            {order.orderNumber}
                                        </Link>
                                    </td>
                                    <td>
                                        <div className="customer-cell">
                                            <span className="customer-name">{order.customerName}</span>
                                            <span className="customer-email">{order.customerEmail}</span>
                                        </div>
                                    </td>
                                    <td className="text-muted">{formatDate(order.orderDate)}</td>
                                    <td className="font-bold">{formatCurrency(order.total)}</td>
                                    <td>
                                        <span className={`badge ${payment.class}`}>{payment.label}</span>
                                    </td>
                                    <td>
                                        <span className={`badge ${status.class}`}>{status.label}</span>
                                    </td>
                                    <td>
                                        <Link to={`/orders/${order.id}`} className="btn btn-ghost btn-icon" title="Detay">
                                            <Eye size={16} />
                                        </Link>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {filteredOrders.length === 0 && (
                <div className="empty-state">
                    <ShoppingCart size={64} />
                    <h3>Sipariş Bulunamadı</h3>
                    <p>Arama kriterlerinize uygun sipariş bulunamadı.</p>
                </div>
            )}
        </div>
    );
}
