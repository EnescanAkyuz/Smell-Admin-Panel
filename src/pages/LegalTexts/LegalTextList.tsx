import { useState } from 'react';
import {
    Edit,
    Eye,
    EyeOff,
    FileText,
    Save,
} from 'lucide-react';
import { legalTexts as initialLegalTexts } from '../../data/dummyData';
import type { LegalText } from '../../types';
import './LegalTexts.css';

const typeLabels: Record<LegalText['type'], string> = {
    privacy_policy: 'Gizlilik Politikası',
    kvkk: 'KVKK Aydınlatma Metni',
    cookie_policy: 'Çerez Politikası',
    distance_sales: 'Mesafeli Satış Sözleşmesi',
    preliminary_info: 'Ön Bilgilendirme Formu',
    terms_of_use: 'Kullanım Koşulları',
    return_policy: 'İade ve Değişim Politikası',
};

export default function LegalTextList() {
    const [legalTextList, setLegalTextList] = useState<LegalText[]>(initialLegalTexts);
    const [editingText, setEditingText] = useState<LegalText | null>(null);
    const [editedContent, setEditedContent] = useState('');
    const [editedTitle, setEditedTitle] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    const toggleStatus = (textId: string) => {
        setLegalTextList(prev => prev.map(t =>
            t.id === textId ? { ...t, isActive: !t.isActive } : t
        ));
    };

    const openEditor = (text: LegalText) => {
        setEditingText(text);
        setEditedTitle(text.title);
        setEditedContent(text.content);
    };

    const closeEditor = () => {
        setEditingText(null);
        setEditedTitle('');
        setEditedContent('');
    };

    const saveContent = async () => {
        if (!editingText) return;

        setIsSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 500));

        setLegalTextList(prev => prev.map(t =>
            t.id === editingText.id
                ? { ...t, title: editedTitle, content: editedContent, updatedAt: new Date().toISOString() }
                : t
        ));

        setIsSaving(false);
        closeEditor();
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

    if (editingText) {
        return (
            <div className="page legal-editor-page">
                <div className="page-header">
                    <div className="flex items-center gap-md">
                        <button className="btn btn-ghost" onClick={closeEditor}>
                            ← Geri
                        </button>
                        <h1 className="page-title">{editedTitle}</h1>
                    </div>
                    <div className="page-actions">
                        <button className="btn btn-secondary" onClick={closeEditor}>
                            İptal
                        </button>
                        <button className="btn btn-primary" onClick={saveContent} disabled={isSaving}>
                            <Save size={18} />
                            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                        </button>
                    </div>
                </div>

                <div className="editor-container">
                    <div className="input-group mb-lg">
                        <label className="input-label">Başlık</label>
                        <input
                            type="text"
                            className="input"
                            value={editedTitle}
                            onChange={(e) => setEditedTitle(e.target.value)}
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">İçerik (HTML)</label>
                        <textarea
                            className="input content-editor"
                            value={editedContent}
                            onChange={(e) => setEditedContent(e.target.value)}
                            rows={20}
                        />
                    </div>

                    <div className="preview-section mt-xl">
                        <h3 className="preview-title">Önizleme</h3>
                        <div
                            className="preview-content"
                            dangerouslySetInnerHTML={{ __html: editedContent }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="page legal-texts-page">
            <div className="page-header">
                <h1 className="page-title">Yasal Metinler</h1>
            </div>

            <div className="legal-texts-grid">
                {legalTextList.map((text) => (
                    <div
                        key={text.id}
                        className={`legal-text-card ${!text.isActive ? 'inactive' : ''}`}
                    >
                        <div className="legal-text-icon">
                            <FileText size={24} />
                        </div>

                        <div className="legal-text-info">
                            <span className="legal-text-type">{typeLabels[text.type]}</span>
                            <h3 className="legal-text-title">{text.title}</h3>
                            <span className="legal-text-date">
                                Son güncelleme: {formatDate(text.updatedAt)}
                            </span>
                        </div>

                        <div className="legal-text-actions">
                            <button
                                className={`status-toggle ${text.isActive ? 'active' : ''}`}
                                onClick={() => toggleStatus(text.id)}
                                title={text.isActive ? 'Yayından Kaldır' : 'Yayına Al'}
                            >
                                {text.isActive ? <Eye size={16} /> : <EyeOff size={16} />}
                            </button>
                            <button
                                className="btn btn-primary btn-sm"
                                onClick={() => openEditor(text)}
                            >
                                <Edit size={14} /> Düzenle
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
