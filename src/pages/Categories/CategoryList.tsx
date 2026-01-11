import { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    FolderTree,
} from 'lucide-react';
import type { Category } from '../../types';
import { useTable } from '../../hooks/useTable';
import { categoryService } from '../../services/categoryService';
import './Categories.css';

export default function CategoryList() {
    const {
        data: categoryList,
        loading,
        error,
        deleteItem,
        updateItem,
        setData
    } = useTable<Category>({
        fetchData: categoryService.getAll,
    });

    const [showModal, setShowModal] = useState(false);
    const [editingCategory, setEditingCategory] = useState<Category | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        description: '',
        slug: '',
        metaTitle: '',
        metaDescription: '',
        isActive: true,
    });

    const openAddModal = () => {
        setEditingCategory(null);
        setFormData({
            name: '',
            description: '',
            slug: '',
            metaTitle: '',
            metaDescription: '',
            isActive: true,
        });
        setShowModal(true);
    };

    const openEditModal = (category: Category) => {
        setEditingCategory(category);
        setFormData({
            name: category.name,
            description: category.description || '',
            slug: category.slug,
            metaTitle: category.metaTitle || '',
            metaDescription: category.metaDescription || '',
            isActive: category.isActive,
        });
        setShowModal(true);
    };

    const handleSave = async () => {
        try {
            setIsSaving(true);
            if (editingCategory) {
                const updated = await categoryService.update(editingCategory.id, {
                    ...formData,
                });
                updateItem(c => c.id === editingCategory.id, updated);
            } else {
                const created = await categoryService.create({
                    ...formData,
                    order: categoryList.length + 1,
                });
                setData(prev => [...prev, created]);
            }
            setShowModal(false);
        } catch (err) {
            console.error('Kaydetme hatası:', err);
            alert('Kaydedilirken bir hata oluştu.');
        } finally {
            setIsSaving(false);
        }
    };

    const toggleStatus = async (category: Category) => {
        try {
            const newStatus = !category.isActive;
            await categoryService.update(category.id, { isActive: newStatus });
            updateItem(c => c.id === category.id, { isActive: newStatus });
        } catch (err) {
            console.error('Durum güncelleme hatası:', err);
        }
    };

    const handleDeleteClick = (category: Category) => {
        setSelectedCategory(category);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        if (selectedCategory) {
            try {
                await categoryService.delete(selectedCategory.id);
                deleteItem(c => c.id === selectedCategory.id);
                setShowDeleteModal(false);
                setSelectedCategory(null);
            } catch (err) {
                console.error('Silme hatası:', err);
                alert('Silinirken bir hata oluştu.');
            }
        }
    };

    const generateSlug = () => {
        const slug = formData.name
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        setFormData(prev => ({ ...prev, slug }));
    };

    return (
        <div className="page categories-page">
            <div className="page-header">
                <h1 className="page-title">Kategoriler</h1>
                <div className="page-actions">
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Yeni Kategori
                    </button>
                </div>
            </div>

            {error && <div className="alert alert-danger mb-lg">{error}</div>}

            {loading ? (
                <div className="loading-state">
                    <div className="loading-spinner"></div>
                    <p>Kategoriler yükleniyor...</p>
                </div>
            ) : (
                <div className="categories-grid">
                    {categoryList.map((category, index) => (
                        <div
                            key={category.id}
                            className={`category-card ${!category.isActive ? 'inactive' : ''}`}
                        >
                            <div className="category-drag">
                                <GripVertical size={18} />
                            </div>
                            <div className="category-order">{index + 1}</div>
                            <div className="category-icon">
                                <FolderTree size={24} />
                            </div>
                            <div className="category-info">
                                <h3 className="category-name">{category.name}</h3>
                                <p className="category-description">{category.description || 'Açıklama yok'}</p>
                                <div className="category-meta">
                                    <span className="product-count">{category.productCount} ürün</span>
                                    <span className="category-slug">/{category.slug}</span>
                                </div>
                            </div>
                            <div className="category-actions">
                                <button
                                    className={`status-toggle ${category.isActive ? 'active' : ''}`}
                                    onClick={() => toggleStatus(category)}
                                    title={category.isActive ? 'Yayından Kaldır' : 'Yayına Al'}
                                >
                                    {category.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => openEditModal(category)}
                                    title="Düzenle"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => handleDeleteClick(category)}
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}

                    {categoryList.length === 0 && (
                        <div className="empty-state">
                            <FolderTree size={64} />
                            <h3>Kategori Bulunamadı</h3>
                            <p>Henüz kategori eklenmemiş.</p>
                            <button className="btn btn-primary mt-md" onClick={openAddModal}>
                                <Plus size={18} />
                                İlk Kategoriyi Ekle
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Add/Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingCategory ? 'Kategori Düzenle' : 'Yeni Kategori'}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="form-grid">
                                <div className="input-group full-width">
                                    <label className="input-label">Kategori Adı *</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.name}
                                        onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                        placeholder="Kategori adını girin"
                                    />
                                </div>

                                <div className="input-group full-width">
                                    <label className="input-label">Açıklama</label>
                                    <textarea
                                        className="input"
                                        value={formData.description}
                                        onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                        rows={3}
                                        placeholder="Kategori açıklaması"
                                    />
                                </div>

                                <div className="input-group full-width">
                                    <label className="input-label">URL Slug</label>
                                    <div className="flex gap-sm">
                                        <input
                                            type="text"
                                            className="input"
                                            value={formData.slug}
                                            onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                                            placeholder="kategori-adi"
                                        />
                                        <button type="button" className="btn btn-secondary" onClick={generateSlug}>
                                            Oluştur
                                        </button>
                                    </div>
                                </div>

                                <div className="input-group full-width">
                                    <label className="input-label">Meta Başlık</label>
                                    <input
                                        type="text"
                                        className="input"
                                        value={formData.metaTitle}
                                        onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))}
                                        placeholder="SEO başlığı"
                                    />
                                </div>

                                <div className="input-group full-width">
                                    <label className="input-label">Meta Açıklama</label>
                                    <textarea
                                        className="input"
                                        value={formData.metaDescription}
                                        onChange={(e) => setFormData(prev => ({ ...prev, metaDescription: e.target.value }))}
                                        rows={2}
                                        placeholder="SEO açıklaması"
                                    />
                                </div>

                                <div className="toggle-group full-width">
                                    <span className="toggle-label">Yayında</span>
                                    <label className="toggle">
                                        <input
                                            type="checkbox"
                                            checked={formData.isActive}
                                            onChange={() => setFormData(prev => ({ ...prev, isActive: !prev.isActive }))}
                                        />
                                        <span className="toggle-slider"></span>
                                    </label>
                                </div>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                İptal
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSave}
                                disabled={isSaving}
                            >
                                {isSaving ? 'Kaydediliyor...' : (editingCategory ? 'Güncelle' : 'Ekle')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Modal */}
            {showDeleteModal && selectedCategory && (
                <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">Kategoriyi Sil</h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowDeleteModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p>
                                <strong>{selectedCategory.name}</strong> kategorisini silmek istediğinizden emin misiniz?
                            </p>
                            {selectedCategory.productCount > 0 && (
                                <div className="alert alert-warning mt-md">
                                    Bu kategoride {selectedCategory.productCount} ürün bulunuyor.
                                </div>
                            )}
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
