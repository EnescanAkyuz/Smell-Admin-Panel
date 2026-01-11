import { useState } from 'react';
import {
    Plus,
    Edit,
    Trash2,
    GripVertical,
    Eye,
    EyeOff,
    Image,
    Link as LinkIcon,
    Star,
} from 'lucide-react';
import { banners as initialBanners, showcases as initialShowcases, products } from '../../data/dummyData';
import type { Banner, Showcase } from '../../types';
import './Banners.css';

export default function BannerList() {
    const [bannerList, setBannerList] = useState<Banner[]>(initialBanners);
    const [showcaseList, setShowcaseList] = useState<Showcase[]>(initialShowcases);
    const [activeTab, setActiveTab] = useState<'banners' | 'showcase'>('banners');
    const [showModal, setShowModal] = useState(false);
    const [editingBanner, setEditingBanner] = useState<Banner | null>(null);

    const [formData, setFormData] = useState({
        title: '',
        subtitle: '',
        link: '',
        isActive: true,
    });

    const openAddModal = () => {
        setEditingBanner(null);
        setFormData({
            title: '',
            subtitle: '',
            link: '',
            isActive: true,
        });
        setShowModal(true);
    };

    const openEditModal = (banner: Banner) => {
        setEditingBanner(banner);
        setFormData({
            title: banner.title,
            subtitle: banner.subtitle || '',
            link: banner.link || '',
            isActive: banner.isActive,
        });
        setShowModal(true);
    };

    const handleSave = () => {
        if (editingBanner) {
            setBannerList(prev => prev.map(b =>
                b.id === editingBanner.id
                    ? { ...b, ...formData }
                    : b
            ));
        } else {
            const newBanner: Banner = {
                id: Date.now().toString(),
                ...formData,
                image: '/banners/placeholder.jpg',
                order: bannerList.length + 1,
                createdAt: new Date().toISOString(),
            };
            setBannerList(prev => [...prev, newBanner]);
        }
        setShowModal(false);
    };

    const toggleBannerStatus = (bannerId: string) => {
        setBannerList(prev => prev.map(b =>
            b.id === bannerId ? { ...b, isActive: !b.isActive } : b
        ));
    };

    const deleteBanner = (bannerId: string) => {
        setBannerList(prev => prev.filter(b => b.id !== bannerId));
    };

    const toggleShowcaseStatus = (showcaseId: string) => {
        setShowcaseList(prev => prev.map(s =>
            s.id === showcaseId ? { ...s, isActive: !s.isActive } : s
        ));
    };

    return (
        <div className="page banners-page">
            <div className="page-header">
                <h1 className="page-title">Banner & İçerik Yönetimi</h1>
                {activeTab === 'banners' && (
                    <button className="btn btn-primary" onClick={openAddModal}>
                        <Plus size={18} />
                        Yeni Banner
                    </button>
                )}
            </div>

            {/* Tabs */}
            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'banners' ? 'active' : ''}`}
                    onClick={() => setActiveTab('banners')}
                >
                    <Image size={16} />
                    Banner Yönetimi
                </button>
                <button
                    className={`tab ${activeTab === 'showcase' ? 'active' : ''}`}
                    onClick={() => setActiveTab('showcase')}
                >
                    <Star size={16} />
                    Vitrin Yönetimi
                </button>
            </div>

            {/* Banners Tab */}
            {activeTab === 'banners' && (
                <div className="banners-grid">
                    {bannerList.map((banner, index) => (
                        <div
                            key={banner.id}
                            className={`banner-card ${!banner.isActive ? 'inactive' : ''}`}
                        >
                            <div className="banner-drag">
                                <GripVertical size={18} />
                                <span className="banner-order">{index + 1}</span>
                            </div>

                            <div className="banner-preview">
                                <Image size={48} />
                            </div>

                            <div className="banner-info">
                                <h3 className="banner-title">{banner.title}</h3>
                                {banner.subtitle && (
                                    <p className="banner-subtitle">{banner.subtitle}</p>
                                )}
                                {banner.link && (
                                    <div className="banner-link">
                                        <LinkIcon size={12} />
                                        <span>{banner.link}</span>
                                    </div>
                                )}
                            </div>

                            <div className="banner-actions">
                                <button
                                    className={`status-toggle ${banner.isActive ? 'active' : ''}`}
                                    onClick={() => toggleBannerStatus(banner.id)}
                                    title={banner.isActive ? 'Yayından Kaldır' : 'Yayına Al'}
                                >
                                    {banner.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => openEditModal(banner)}
                                    title="Düzenle"
                                >
                                    <Edit size={16} />
                                </button>
                                <button
                                    className="btn btn-ghost btn-icon"
                                    onClick={() => deleteBanner(banner.id)}
                                    title="Sil"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Showcase Tab */}
            {activeTab === 'showcase' && (
                <div className="showcase-list">
                    {showcaseList.map((showcase) => (
                        <div key={showcase.id} className={`showcase-card ${!showcase.isActive ? 'inactive' : ''}`}>
                            <div className="showcase-header">
                                <div className="showcase-type">
                                    {showcase.type === 'featured_products' && 'Öne Çıkan Ürünler'}
                                    {showcase.type === 'campaign' && 'Kampanya Alanı'}
                                    {showcase.type === 'text_block' && 'Metin Bloğu'}
                                </div>
                                <div className="showcase-actions">
                                    <button
                                        className={`status-toggle ${showcase.isActive ? 'active' : ''}`}
                                        onClick={() => toggleShowcaseStatus(showcase.id)}
                                    >
                                        {showcase.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                                    </button>
                                    <button className="btn btn-ghost btn-icon">
                                        <Edit size={16} />
                                    </button>
                                </div>
                            </div>

                            <h3 className="showcase-title">{showcase.title}</h3>

                            {showcase.content && (
                                <p className="showcase-content">{showcase.content}</p>
                            )}

                            {showcase.productIds && (
                                <div className="showcase-products">
                                    {showcase.productIds.map(productId => {
                                        const product = products.find(p => p.id === productId);
                                        return product ? (
                                            <span key={productId} className="product-tag">{product.name}</span>
                                        ) : null;
                                    })}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Add/Edit Banner Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3 className="modal-title">
                                {editingBanner ? 'Banner Düzenle' : 'Yeni Banner'}
                            </h3>
                            <button className="btn btn-ghost btn-icon" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <div className="input-group">
                                <label className="input-label">Başlık *</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.title}
                                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                                    placeholder="Banner başlığı"
                                />
                            </div>

                            <div className="input-group mt-md">
                                <label className="input-label">Alt Başlık</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.subtitle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, subtitle: e.target.value }))}
                                    placeholder="Banner alt başlığı"
                                />
                            </div>

                            <div className="input-group mt-md">
                                <label className="input-label">Görsel</label>
                                <div className="image-upload-area">
                                    <Image size={32} />
                                    <p>Görsel yüklemek için tıklayın</p>
                                </div>
                            </div>

                            <div className="input-group mt-md">
                                <label className="input-label">Link</label>
                                <input
                                    type="text"
                                    className="input"
                                    value={formData.link}
                                    onChange={(e) => setFormData(prev => ({ ...prev, link: e.target.value }))}
                                    placeholder="/kategori/ornek"
                                />
                            </div>

                            <div className="toggle-group mt-md">
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
                        <div className="modal-footer">
                            <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                                İptal
                            </button>
                            <button className="btn btn-primary" onClick={handleSave}>
                                {editingBanner ? 'Güncelle' : 'Ekle'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
