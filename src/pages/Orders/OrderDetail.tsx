import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft,
    Truck,
    CreditCard,
    MapPin,
    Package,
    User,
    Phone,
    Mail,
    ExternalLink,
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

const statusOptions: { value: OrderStatus; label: string; color: string }[] = [
    { value: 'pending', label: 'Bekliyor', color: 'warning' },
    { value: 'payment_confirmed', label: 'Ödeme Onaylandı', color: 'info' },
    { value: 'preparing', label: 'Hazırlanıyor', color: 'primary' },
    { value: 'shipped', label: 'Kargoda', color: 'info' },
    { value: 'delivered', label: 'Teslim Edildi', color: 'success' },
    { value: 'cancelled', label: 'İptal', color: 'danger' },
    { value: 'refunded', label: 'İade', color: 'secondary' },
];

const shippingCompanies = [
    'Yurtiçi Kargo',
    'Aras Kargo',
    'MNG Kargo',
    'PTT Kargo',
    'Sürat Kargo',
];

export default function OrderDetail() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [order, setOrder] = useState<Order | null>(null);
    const [loading, setLoading] = useState(true);
    const [currentStatus, setCurrentStatus] = useState<OrderStatus>('pending');
    const [shippingCompany, setShippingCompany] = useState('');
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingUrl, setTrackingUrl] = useState('');
    const [showShippingModal, setShowShippingModal] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        const loadOrder = async () => {
            if (!id) return;
            try {
                const data = await orderService.getById(id);
                if (data) {
                    setOrder(data);
                    setCurrentStatus(data.status);
                    setShippingCompany(data.shippingCompany || '');
                    setTrackingNumber(data.trackingNumber || '');
                    setTrackingUrl(data.trackingUrl || '');
                }
            } catch (err) {
                console.error('Sipariş yükleme hatası:', err);
            } finally {
                setLoading(false);
            }
        };
        loadOrder();
    }, [id]);

    if (loading) return <div className="loading-state">Sipariş yükleniyor...</div>;

    if (!order) {
        return (
            <div className="page">
                <div className="empty-state">
                    <Package size={64} />
                    <h3>Sipariş Bulunamadı</h3>
                    <button className="btn btn-primary mt-md" onClick={() => navigate('/orders')}>
                        Siparişlere Dön
                    </button>
                </div>
            </div>
        );
    }

    const handleStatusChange = async (newStatus: OrderStatus) => {
        if (newStatus === 'shipped' && !trackingNumber) {
            setShowShippingModal(true);
            return;
        }

        try {
            setSaving(true);
            await orderService.updateStatus(order.id, newStatus);
            setCurrentStatus(newStatus);
        } catch (err) {
            console.error('Durum güncelleme hatası:', err);
        } finally {
            setSaving(false);
        }
    };

    const saveShippingInfo = async () => {
        try {
            setSaving(true);
            await orderService.updateShipping(order.id, {
                company: shippingCompany,
                trackingNumber,
                trackingUrl
            });
            await orderService.updateStatus(order.id, 'shipped');
            setCurrentStatus('shipped');
            setShowShippingModal(false);
        } catch (err) {
            console.error('Kargo güncelleme hatası:', err);
        } finally {
            setSaving(false);
        }
    };

    const currentStatusOption = statusOptions.find(s => s.value === currentStatus);

    return (
        <div className="page order-detail-page">
            <div className="page-header">
                <div className="flex items-center gap-md">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/orders')}>
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="page-title">{order.orderNumber}</h1>
                        <p className="text-muted text-sm">{formatDate(order.orderDate)}</p>
                    </div>
                </div>
                <div className="page-actions">
                    <span className={`badge badge-lg badge-${currentStatusOption?.color}`}>
                        {currentStatusOption?.label}
                    </span>
                </div>
            </div>

            <div className="order-detail-grid">
                {/* Main Content */}
                <div className="order-main">
                    {/* Status Update */}
                    <div className="detail-card">
                        <h3 className="card-title">Sipariş Durumu</h3>
                        <div className="status-buttons">
                            {statusOptions.map((status) => (
                                <button
                                    key={status.value}
                                    className={`status-btn ${currentStatus === status.value ? 'active' : ''} ${status.color}`}
                                    onClick={() => handleStatusChange(status.value)}
                                    disabled={saving}
                                >
                                    {status.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Order Items */}
                    <div className="detail-card">
                        <h3 className="card-title">
                            <Package size={18} /> Sipariş Ürünleri
                        </h3>
                        <div className="order-items">
                            {order.items.map((item) => (
                                <div key={item.id} className="order-item">
                                    <div className="item-image">
                                        <Package size={24} />
                                    </div>
                                    <div className="item-info">
                                        <span className="item-name">{item.productName}</span>
                                        {item.variant && <span className="item-variant">{item.variant}</span>}
                                    </div>
                                    <div className="item-quantity">
                                        {item.quantity} adet
                                    </div>
                                    <div className="item-price">
                                        <span className="unit-price">{formatCurrency(item.unitPrice)} / adet</span>
                                        <span className="total-price">{formatCurrency(item.totalPrice)}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="order-summary">
                            <div className="summary-row">
                                <span>Ara Toplam</span>
                                <span>{formatCurrency(order.subtotal)}</span>
                            </div>
                            <div className="summary-row">
                                <span>KDV</span>
                                <span>{formatCurrency(order.vatAmount)}</span>
                            </div>
                            <div className="summary-row">
                                <span>Kargo</span>
                                <span>{order.shippingCost === 0 ? 'Ücretsiz' : formatCurrency(order.shippingCost)}</span>
                            </div>
                            <div className="summary-row total">
                                <span>Genel Toplam</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="detail-card">
                        <div className="card-header">
                            <h3 className="card-title">
                                <Truck size={18} /> Kargo Bilgileri
                            </h3>
                            <button className="btn btn-secondary btn-sm" onClick={() => setShowShippingModal(true)}>
                                Düzenle
                            </button>
                        </div>
                        {shippingCompany ? (
                            <div className="shipping-info">
                                <div className="info-row">
                                    <span className="info-label">Kargo Firması</span>
                                    <span className="info-value">{shippingCompany}</span>
                                </div>
                                <div className="info-row">
                                    <span className="info-label">Takip Numarası</span>
                                    <span className="info-value">{trackingNumber}</span>
                                </div>
                                {trackingUrl && (
                                    <a href={trackingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                                        <ExternalLink size={14} /> Kargoyu Takip Et
                                    </a>
                                )}
                            </div>
                        ) : (
                            <p className="text-muted">Kargo bilgisi girilmemiş</p>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="order-sidebar">
                    {/* Customer Info */}
                    <div className="detail-card">
                        <h3 className="card-title">
                            <User size={18} /> Müşteri Bilgileri
                        </h3>
                        <div className="customer-info">
                            <div className="info-row">
                                <User size={16} />
                                <span>{order.customerName}</span>
                            </div>
                            <div className="info-row">
                                <Mail size={16} />
                                <a href={`mailto:${order.customerEmail}`}>{order.customerEmail}</a>
                            </div>
                            <div className="info-row">
                                <Phone size={16} />
                                <a href={`tel:${order.customerPhone}`}>{order.customerPhone}</a>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="detail-card">
                        <h3 className="card-title">
                            <MapPin size={18} /> Teslimat Adresi
                        </h3>
                        {order.shippingAddress && (
                            <div className="address-info">
                                <p className="address-name">{order.shippingAddress.fullName}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.district} / {order.shippingAddress.city}</p>
                                <p>{order.shippingAddress.postalCode}</p>
                                <p>{order.shippingAddress.phone}</p>
                            </div>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="detail-card">
                        <h3 className="card-title">
                            <CreditCard size={18} /> Ödeme Bilgileri
                        </h3>
                        <div className="payment-info">
                            <div className="info-row">
                                <span className="info-label">Yöntem</span>
                                <span className="info-value">{order.paymentMethod}</span>
                            </div>
                            <div className="info-row">
                                <span className="info-label">Durum</span>
                                <span className={`badge badge-${order.paymentStatus === 'paid' ? 'success' : 'warning'}`}>
                                    {order.paymentStatus === 'paid' ? 'Ödendi' : 'Bekliyor'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Shipping Modal */}
            {showShippingModal && (
                <div className="modal-overlay" onClick={() => setShowShippingModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Kargo Bilgileri</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowShippingModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group">
                                <label className="input-label">Kargo Firması *</label>
                                <select
                                    className="input"
                                    value={shippingCompany}
                                    onChange={(e) => setShippingCompany(e.target.value)}
                                >
                                    <option value="">Seçin</option>
                                    {shippingCompanies.map((company) => (
                                        <option key={company} value={company}>{company}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="input-group mt-md">
                                <label className="input-label">Takip Numarası *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Kargo takip numarası"
                                />
                            </div>
                            <div className="input-group mt-md">
                                <label className="input-label">Takip Linki</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={trackingUrl}
                                    onChange={(e) => setTrackingUrl(e.target.value)}
                                    placeholder="https://..."
                                />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowShippingModal(false)} disabled={saving}>
                                İptal
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={saveShippingInfo}
                                disabled={saving || !shippingCompany || !trackingNumber}
                            >
                                {saving ? 'Kaydediliyor...' : 'Kaydet'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
