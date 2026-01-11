import { useState } from 'react';
import {
    Edit,
    Trash2,
    Mail,
    Phone,
    User,
} from 'lucide-react';
import type { Customer } from '../../types';
import { useTable } from '../../hooks/useTable';
import DataTable, { type Column } from '../../components/common/DataTable';
import { customerService } from '../../services/customerService';
import './Customers.css';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR');
};

export default function CustomerList() {
    const {
        data: customerList,
        loading,
        currentPage,
        totalPages,
        searchQuery,
        setSearchQuery,
        goToPage,
        deleteItem,
        updateItem
    } = useTable<Customer>({
        fetchData: customerService.getAll,
        searchKey: 'email'
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

    const toggleCustomerStatus = async (customer: Customer) => {
        try {
            const newStatus = customer.status === 'active' ? 'inactive' : 'active';
            const updated = await customerService.update(customer.id, { status: newStatus as any });
            updateItem(c => c.id === customer.id, updated);
        } catch (err) {
            console.error('Durum güncelleme hatası:', err);
        }
    };

    const handleDeleteClick = (customer: Customer) => {
        setSelectedCustomer(customer);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedCustomer) {
            try {
                await customerService.delete(selectedCustomer.id);
                deleteItem(c => c.id === selectedCustomer.id);
                setShowDeleteModal(false);
                setSelectedCustomer(null);
            } catch (err) {
                console.error('Silme hatası:', err);
            }
        }
    };

    const columns: Column<Customer>[] = [
        {
            header: 'Müşteri',
            key: 'firstName',
            render: (customer) => (
                <div className="customer-cell">
                    <div className="avatar">
                        <User size={20} />
                    </div>
                    <div className="customer-info">
                        <span className="customer-name">{customer.firstName} {customer.lastName}</span>
                        <span className="customer-date">Katılım: {formatDate(customer.createdAt)}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'İletişim',
            key: 'email',
            render: (customer) => (
                <div className="contact-cell">
                    <div className="contact-item">
                        <Mail size={14} />
                        <span>{customer.email}</span>
                    </div>
                    {customer.phone && (
                        <div className="contact-item">
                            <Phone size={14} />
                            <span>{customer.phone}</span>
                        </div>
                    )}
                </div>
            )
        },
        {
            header: 'Siparişler',
            key: 'orderCount',
            render: (customer) => (
                <div className="orders-cell">
                    <span className="count">{customer.orderCount} Sipariş</span>
                    <span className="total">{formatCurrency(customer.totalSpent)}</span>
                </div>
            )
        },
        {
            header: 'Durum',
            key: 'status',
            render: (customer) => (
                <span
                    className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}`}
                    onClick={() => toggleCustomerStatus(customer)}
                    style={{ cursor: 'pointer' }}
                >
                    {customer.status === 'active' ? 'Aktif' : 'Pasif'}
                </span>
            )
        }
    ];

    return (
        <div className="page customers-page">
            <div className="page-header">
                <h1 className="page-title">Müşteriler</h1>
            </div>

            <DataTable
                columns={columns}
                data={customerList}
                loading={loading}
                searchable
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: goToPage
                }}
                actions={(customer) => (
                    <div className="action-buttons">
                        <button
                            className="btn btn-ghost btn-icon"
                            title="Düzenle"
                            onClick={() => {/* Edit logic */ }}
                        >
                            <Edit size={16} />
                        </button>
                        <button
                            className="btn btn-ghost btn-icon"
                            title="Sil"
                            onClick={() => handleDeleteClick(customer)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            {/* Delete Modal */}
            {showDeleteModal && selectedCustomer && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Müşteriyi Sil</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowDeleteModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>
                                <strong>{selectedCustomer.firstName} {selectedCustomer.lastName}</strong> isimli müşteriyi silmek istediğinizden emin misiniz?
                            </p>
                            <p className="text-muted text-sm mt-sm">Bu işlem geri alınamaz ve müşterinin tüm verileri silinir.</p>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowDeleteModal(false)}>
                                İptal
                            </button>
                            <button className="btn btn-danger" onClick={confirmDelete}>
                                Sil
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
