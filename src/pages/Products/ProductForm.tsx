import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
    ArrowLeft,
    Save,
    Upload,
    X,
    Package,
} from 'lucide-react';
import type { Product, Category } from '../../types';
import { productService } from '../../services/productService';
import { categoryService } from '../../services/categoryService';
import './Products.css';

export default function ProductForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEdit = Boolean(id);

    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(isEdit);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [formData, setFormData] = useState<Partial<Product>>({
        name: '',
        description: '',
        shortDescription: '',
        price: 0,
        discountedPrice: undefined,
        currency: 'TRY',
        vatRate: 20,
        stock: 0,
        sku: '',
        barcode: '',
        categoryId: '',
        images: [],
        isFeatured: false,
        isActive: true,
        metaTitle: '',
        metaDescription: '',
        slug: '',
        // Perfume Defaults
        scentNotes: { top: [], middle: [], base: [] },
        gender: 'unisex',
        fragranceFamily: undefined,
        concentration: undefined,
        volume: undefined,
        batchCode: '',
        productionDate: '',
        expirationDate: ''
    });

    useEffect(() => {
        // Load categories
        const loadCategories = async () => {
            try {
                const data = await categoryService.getAll();
                setCategories(data);
            } catch (err) {
                console.error('Kategoriler yüklenirken hata:', err);
            }
        };

        // Load product if editing
        const loadProduct = async () => {
            if (!id) return;
            try {
                const product = await productService.getById(id);
                if (product) {
                    setFormData(product);
                }
            } catch (err) {
                console.error('Ürün yüklenirken hata:', err);
                alert('Ürün bulunamadı.');
                navigate('/products');
            } finally {
                setIsLoading(false);
            }
        };

        loadCategories();
        if (isEdit) loadProduct();
    }, [id, isEdit, navigate]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'number' ? parseFloat(value) || 0 : value,
        }));
    };

    const handleToggle = (field: keyof Product) => {
        setFormData(prev => ({
            ...prev,
            [field]: !prev[field],
        }));
    };

    const generateSlug = () => {
        const slug = (formData.name || '')
            .toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .trim();
        setFormData(prev => ({ ...prev, slug }));
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            if (isEdit && id) {
                await productService.update(id, formData);
            } else {
                await productService.create(formData as any);
            }
            navigate('/products');
        } catch (err) {
            console.error('Kaydetme hatası:', err);
            alert('Ürün kaydedilirken bir hata oluştu.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) {
        return (
            <div className="page loading-page">
                <div className="loading-spinner"></div>
                <p>Ürün bilgileri yükleniyor...</p>
            </div>
        );
    }

    return (
        <div className="page product-form-page">
            <div className="page-header">
                <div className="flex items-center gap-md">
                    <button className="btn btn-ghost btn-icon" onClick={() => navigate('/products')}>
                        <ArrowLeft size={20} />
                    </button>
                    <h1 className="page-title">{isEdit ? 'Ürün Düzenle' : 'Yeni Ürün'}</h1>
                </div>
                <div className="page-actions">
                    <button className="btn btn-secondary" onClick={() => navigate('/products')}>
                        İptal
                    </button>
                    <button className="btn btn-primary" onClick={handleSubmit} disabled={isSubmitting}>
                        <Save size={18} />
                        {isSubmitting ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="product-form">
                <div className="form-main">
                    {/* Basic Info */}
                    <div className="form-section">
                        <h2 className="form-section-title">Temel Bilgiler</h2>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label className="input-label">Ürün Adı *</label>
                                <input
                                    type="text"
                                    name="name"
                                    className="input"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ürün adını girin"
                                />
                            </div>

                            <div className="input-group full-width">
                                <label className="input-label">Kısa Açıklama</label>
                                <input
                                    type="text"
                                    name="shortDescription"
                                    className="input"
                                    value={formData.shortDescription}
                                    onChange={handleChange}
                                    placeholder="Ürün için kısa açıklama"
                                />
                            </div>

                            <div className="input-group full-width">
                                <label className="input-label">Açıklama</label>
                                <textarea
                                    name="description"
                                    className="input"
                                    value={formData.description}
                                    onChange={handleChange}
                                    rows={5}
                                    placeholder="Ürün açıklaması"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="form-section">
                        <h2 className="form-section-title">Fiyatlandırma</h2>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Fiyat (₺) *</label>
                                <input
                                    type="number"
                                    name="price"
                                    className="input"
                                    value={formData.price}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">İndirimli Fiyat (₺)</label>
                                <input
                                    type="number"
                                    name="discountedPrice"
                                    className="input"
                                    value={formData.discountedPrice || ''}
                                    onChange={handleChange}
                                    min="0"
                                    step="0.01"
                                    placeholder="Opsiyonel"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Para Birimi</label>
                                <select
                                    name="currency"
                                    className="input"
                                    value={formData.currency}
                                    onChange={handleChange}
                                >
                                    <option value="TRY">TRY (₺)</option>
                                    <option value="USD">USD ($)</option>
                                    <option value="EUR">EUR (€)</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">KDV Oranı (%)</label>
                                <select
                                    name="vatRate"
                                    className="input"
                                    value={formData.vatRate}
                                    onChange={handleChange}
                                >
                                    <option value={0}>%0</option>
                                    <option value={1}>%1</option>
                                    <option value={10}>%10</option>
                                    <option value={20}>%20</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Inventory */}
                    <div className="form-section">
                        <h2 className="form-section-title">Stok Bilgileri</h2>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Stok Adedi *</label>
                                <input
                                    type="number"
                                    name="stock"
                                    className="input"
                                    value={formData.stock}
                                    onChange={handleChange}
                                    min="0"
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">SKU / Ürün Kodu *</label>
                                <input
                                    type="text"
                                    name="sku"
                                    className="input"
                                    value={formData.sku}
                                    onChange={handleChange}
                                    required
                                    placeholder="Örn: PRF-001"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Barkod</label>
                                <input
                                    type="text"
                                    name="barcode"
                                    className="input"
                                    value={formData.barcode}
                                    onChange={handleChange}
                                    placeholder="Opsiyonel"
                                />
                            </div>

                            <div className="input-group">
                                <label className="input-label">Kategori *</label>
                                <select
                                    name="categoryId"
                                    className="input"
                                    value={formData.categoryId}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Kategori Seçin</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-section">
                        <h2 className="form-section-title">Parfüm Özellikleri</h2>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Koku Ailesi</label>
                                <select 
                                    name="fragranceFamily" 
                                    className="input" 
                                    value={formData.fragranceFamily || ''} 
                                    onChange={handleChange}
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="floral">Çiçeksi</option>
                                    <option value="woody">Odunsu</option>
                                    <option value="oriental">Oryantal</option>
                                    <option value="fresh">Fresh</option>
                                    <option value="citrus">Narenciye</option>
                                    <option value="fruity">Meyveli</option>
                                    <option value="spicy">Baharatlı</option>
                                    <option value="gourmand">Gourmand (Şekerli)</option>
                                    <option value="aquatic">Sucul</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Konsantrasyon</label>
                                <select 
                                    name="concentration" 
                                    className="input" 
                                    value={formData.concentration || ''} 
                                    onChange={handleChange}
                                >
                                    <option value="">Seçiniz</option>
                                    <option value="edp">EDP (Eau de Parfum)</option>
                                    <option value="edt">EDT (Eau de Toilette)</option>
                                    <option value="edc">EDC (Eau de Cologne)</option>
                                    <option value="parfum">Parfum / Extrait</option>
                                    <option value="body_mist">Vücut Spreyi</option>
                                </select>
                            </div>

                            <div className="input-group">
                                <label className="input-label">Cinsiyet</label>
                                <select 
                                    name="gender" 
                                    className="input" 
                                    value={formData.gender || 'unisex'} 
                                    onChange={handleChange}
                                >
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                    <option value="unisex">Unisex</option>
                                    <option value="kids">Çocuk</option>
                                </select>
                            </div>

                             <div className="input-group">
                                <label className="input-label">Hacim (ml)</label>
                                <input 
                                    type="number" 
                                    name="volume" 
                                    className="input" 
                                    value={formData.volume || ''} 
                                    onChange={handleChange} 
                                    placeholder="Örn: 50, 100" 
                                />
                            </div>

                            <div className="input-group full-width">
                                <label className="input-label">Üst Notalar (Virgülle ayırın)</label>
                                <input 
                                    type="text" 
                                    className="input" 
                                    placeholder="Örn: Bergamot, Limon, Lavanta"
                                    value={formData.scentNotes?.top?.join(', ') || ''}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        scentNotes: { 
                                            ...prev.scentNotes!, 
                                            top: e.target.value.split(',').map(s => s.trim()) 
                                        } 
                                    }))}
                                />
                            </div>
                            <div className="input-group full-width">
                                <label className="input-label">Orta Notalar</label>
                                <input 
                                    type="text" 
                                    className="input" 
                                    placeholder="Örn: Gül, Yasemin"
                                    value={formData.scentNotes?.middle?.join(', ') || ''}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        scentNotes: { 
                                            ...prev.scentNotes!, 
                                            middle: e.target.value.split(',').map(s => s.trim()) 
                                        } 
                                    }))}
                                />
                            </div>
                            <div className="input-group full-width">
                                <label className="input-label">Alt Notalar</label>
                                <input 
                                    type="text" 
                                    className="input" 
                                    placeholder="Örn: Misk, Amber, Vanilya"
                                    value={formData.scentNotes?.base?.join(', ') || ''}
                                    onChange={(e) => setFormData(prev => ({ 
                                        ...prev, 
                                        scentNotes: { 
                                            ...prev.scentNotes!, 
                                            base: e.target.value.split(',').map(s => s.trim()) 
                                        } 
                                    }))}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Batch Tracking */}
                    <div className="form-section">
                        <h2 className="form-section-title">Üretim & Takip (Batch)</h2>
                        <div className="form-grid">
                            <div className="input-group">
                                <label className="input-label">Batch Kodu</label>
                                <input 
                                    type="text" 
                                    name="batchCode" 
                                    className="input" 
                                    value={formData.batchCode || ''} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Üretim Tarihi</label>
                                <input 
                                    type="date" 
                                    name="productionDate" 
                                    className="input" 
                                    value={formData.productionDate || ''} 
                                    onChange={handleChange} 
                                />
                            </div>
                            <div className="input-group">
                                <label className="input-label">Son Kullanma Tarihi</label>
                                <input 
                                    type="date" 
                                    name="expirationDate" 
                                    className="input" 
                                    value={formData.expirationDate || ''} 
                                    onChange={handleChange} 
                                />
                            </div>
                        </div>
                    </div>

                    {/* SEO */}
                    <div className="form-section">
                        <h2 className="form-section-title">SEO Ayarları</h2>
                        <div className="form-grid">
                            <div className="input-group full-width">
                                <label className="input-label">Meta Başlık</label>
                                <input
                                    type="text"
                                    name="metaTitle"
                                    className="input"
                                    value={formData.metaTitle}
                                    onChange={handleChange}
                                    placeholder="Sayfa başlığı (boş bırakılırsa ürün adı kullanılır)"
                                />
                            </div>

                            <div className="input-group full-width">
                                <label className="input-label">Meta Açıklama</label>
                                <textarea
                                    name="metaDescription"
                                    className="input"
                                    value={formData.metaDescription}
                                    onChange={handleChange}
                                    rows={2}
                                    placeholder="Arama motorları için açıklama"
                                />
                            </div>

                            <div className="input-group full-width">
                                <label className="input-label">URL Slug</label>
                                <div className="flex gap-sm">
                                    <input
                                        type="text"
                                        name="slug"
                                        className="input"
                                        value={formData.slug}
                                        onChange={handleChange}
                                        placeholder="urun-adi"
                                    />
                                    <button type="button" className="btn btn-secondary" onClick={generateSlug}>
                                        Oluştur
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="form-sidebar">
                    {/* Images */}
                    <div className="form-section">
                        <h2 className="form-section-title">Görseller</h2>
                        <div className="image-upload-area">
                            <Upload size={32} />
                            <p>Görsel yüklemek için tıklayın</p>
                            <span className="text-sm text-muted">PNG, JPG, WEBP (max 5MB)</span>
                        </div>
                        <div className="image-grid">
                            {formData.images?.map((img, idx) => (
                                <div key={idx} className="image-preview">
                                    {img ? (
                                        <img src={img} alt={`Ürün ${idx}`} />
                                    ) : (
                                        <Package size={24} />
                                    )}
                                    <button type="button" className="image-preview-remove">
                                        <X size={12} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Status */}
                    <div className="form-section">
                        <h2 className="form-section-title">Yayın Durumu</h2>
                        <div className="toggle-group">
                            <span className="toggle-label">Yayında</span>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={formData.isActive}
                                    onChange={() => handleToggle('isActive')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                        <div className="toggle-group mt-sm">
                            <span className="toggle-label">Öne Çıkan</span>
                            <label className="toggle">
                                <input
                                    type="checkbox"
                                    checked={formData.isFeatured}
                                    onChange={() => handleToggle('isFeatured')}
                                />
                                <span className="toggle-slider"></span>
                            </label>
                        </div>
                    </div>
                </div>
            </form>
        </div>
    );
}
