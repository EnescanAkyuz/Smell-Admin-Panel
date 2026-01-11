import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
    Plus,
    Edit,
    Trash2,
    Eye,
    EyeOff,
    Star,
    Package,
} from 'lucide-react';

import type { Product } from '../../types';
import { useTable } from '../../hooks/useTable';
import DataTable, { type Column } from '../../components/common/DataTable';
import './Products.css';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
    }).format(amount);
};

import { productService } from '../../services/productService';

export default function ProductList() {
    const {
        data: productList,
        loading,
        currentPage,
        totalPages,
        searchQuery,
        setSearchQuery,
        goToPage,
        deleteItem,
        updateItem
    } = useTable<Product>({
        fetchData: productService.getAll,
        searchKey: 'name'
    });

    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const toggleProductStatus = async (product: Product) => {
        try {
            const newStatus = !product.isActive;
            const updated = await productService.update(product.id, { isActive: newStatus });
            updateItem(p => p.id === product.id, updated);
        } catch (err) {
            console.error('Durum güncelleme hatası:', err);
        }
    };

    const toggleFeatured = async (product: Product) => {
        try {
            const newStatus = !product.isFeatured;
            const updated = await productService.update(product.id, { isFeatured: newStatus });
            updateItem(p => p.id === product.id, updated);
        } catch (err) {
            console.error('Öne çıkarma hatası:', err);
        }
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedProduct) {
            try {
                await productService.delete(selectedProduct.id);
                deleteItem(p => p.id === selectedProduct.id);
                setShowDeleteModal(false);
                setSelectedProduct(null);
            } catch (err) {
                console.error('Silme hatası:', err);
                alert('Ürün silinirken bir hata oluştu.');
            }
        }
    };

    const getStockStatus = (stock: number) => {
        if (stock === 0) return { label: 'Stok Yok', class: 'badge-danger' };
        if (stock <= 5) return { label: 'Kritik', class: 'badge-danger' };
        if (stock <= 10) return { label: 'Düşük', class: 'badge-warning' };
        return { label: 'Normal', class: 'badge-success' };
    };

    const columns: Column<Product>[] = [
        {
            header: 'Ürün',
            key: 'name',
            render: (product) => (
                <div className="product-cell">
                    <div className="product-image">
                        <Package size={24} />
                    </div>
                    <div className="product-info">
                        <span className="product-name">{product.name}</span>
                        <span className="product-description">{product.shortDescription}</span>
                    </div>
                </div>
            )
        },
        {
            header: 'SKU',
            key: 'sku',
            render: (product) => <code className="sku-code">{product.sku}</code>
        },
        { header: 'Kategori', key: 'categoryName' },
        {
            header: 'Fiyat',
            key: 'price',
            render: (product) => (
                <div className="price-cell">
                    {product.discountedPrice ? (
                        <>
                            <span className="discounted-price">{formatCurrency(product.discountedPrice)}</span>
                            <span className="original-price">{formatCurrency(product.price)}</span>
                        </>
                    ) : (
                        <span>{formatCurrency(product.price)}</span>
                    )}
                </div>
            )
        },
        {
            header: 'Stok',
            key: 'stock',
            render: (product) => {
                const status = getStockStatus(product.stock);
                return (
                    <div className="stock-cell">
                        <span className="stock-number">{product.stock}</span>
                        <span className={`badge ${status.class}`}>{status.label}</span>
                    </div>
                );
            }
        },
        {
            header: 'Durum',
            key: 'isActive',
            render: (product) => (
                <button
                    className={`status-toggle ${product.isActive ? 'active' : ''}`}
                    onClick={() => toggleProductStatus(product)}
                    title={product.isActive ? 'Yayından Kaldır' : 'Yayına Al'}
                >
                    {product.isActive ? <Eye size={18} /> : <EyeOff size={18} />}
                </button>
            )
        },
        {
            header: 'Öne Çıkan',
            key: 'isFeatured',
            render: (product) => (
                <button
                    className={`featured-toggle ${product.isFeatured ? 'active' : ''}`}
                    onClick={() => toggleFeatured(product)}
                    title={product.isFeatured ? 'Öne Çıkandan Kaldır' : 'Öne Çıkar'}
                >
                    <Star size={18} />
                </button>
            )
        }
    ];

    return (
        <div className="page products-page">
            <div className="page-header">
                <h1 className="page-title">Ürünler</h1>
                <div className="page-actions">
                    <Link to="/products/new" className="btn btn-primary">
                        <Plus size={18} />
                        Yeni Ürün
                    </Link>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={productList}
                loading={loading}
                searchable
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                pagination={{
                    currentPage,
                    totalPages,
                    onPageChange: goToPage
                }}
                actions={(product) => (
                    <div className="action-buttons">
                        <Link to={`/products/${product.id}`} className="btn btn-ghost btn-icon" title="Düzenle">
                            <Edit size={16} />
                        </Link>
                        <button
                            className="btn btn-ghost btn-icon"
                            title="Sil"
                            onClick={() => handleDeleteClick(product)}
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                )}
            />

            {/* Delete Modal */}
            {showDeleteModal && selectedProduct && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Ürünü Sil</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowDeleteModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>
                                <strong>{selectedProduct.name}</strong> ürününü silmek istediğinizden emin misiniz?
                            </p>
                            <p className="text-muted text-sm mt-sm">Bu işlem geri alınamaz.</p>
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
