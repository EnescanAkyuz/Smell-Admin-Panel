import { useState, useEffect } from 'react';
import {
    Search,
    Filter,
    Check,
    X,
    Trash2,
    AlertTriangle,
    Star,
    MessageSquare,
} from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import type { Review } from '../../types';
import './Reviews.css';

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    });
};

export default function ReviewList() {
    const [reviewList, setReviewList] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'spam'>('all');

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await reviewService.getAll();
                setReviewList(data);
            } catch (error) {
                console.error("Yorumlar yüklenirken hata:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const filteredReviews = reviewList.filter((review) => {
        const matchesSearch =
            review.productName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            review.comment.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || review.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const updateStatus = async (reviewId: string, status: Review['status']) => {
        try {
            await reviewService.updateStatus(reviewId, status);
            setReviewList(prev => prev.map(r =>
                r.id === reviewId ? { ...r, status } : r
            ));
        } catch (error) {
            console.error("Durum güncellenirken hata:", error);
        }
    };

    const deleteReview = async (reviewId: string) => {
        if (!window.confirm('Bu yorumu silmek istediğinize emin misiniz?')) return;
        try {
            await reviewService.delete(reviewId);
            setReviewList(prev => prev.filter(r => r.id !== reviewId));
        } catch (error) {
            console.error("Yorum silinirken hata:", error);
        }
    };

    const renderStars = (rating: number) => {
        return (
            <div className="stars">
                {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                        key={star}
                        size={16}
                        className={`star ${star <= rating ? 'filled' : ''}`}
                        fill={star <= rating ? 'currentColor' : 'none'}
                    />
                ))}
            </div>
        );
    };

    const getStatusBadge = (status: Review['status']) => {
        const map: Record<Review['status'], { label: string; class: string }> = {
            pending: { label: 'Bekliyor', class: 'badge-warning' },
            approved: { label: 'Onaylı', class: 'badge-success' },
            rejected: { label: 'Reddedildi', class: 'badge-danger' },
            spam: { label: 'Spam', class: 'badge-secondary' },
        };
        return map[status];
    };

    const pendingCount = reviewList.filter(r => r.status === 'pending').length;
    const spamCount = reviewList.filter(r => r.status === 'spam').length;

    return (
        <div className="page reviews-page">
            <div className="page-header">
                <h1 className="page-title">Yorumlar</h1>
                <div className="review-stats">
                    {pendingCount > 0 && (
                        <span className="badge badge-warning">{pendingCount} bekleyen</span>
                    )}
                    {spamCount > 0 && (
                        <span className="badge badge-secondary">{spamCount} spam</span>
                    )}
                </div>
            </div>

            {/* Filters */}
            <div className="filters-bar">
                <div className="search-input">
                    <Search size={18} />
                    <input
                        type="text"
                        className="input"
                        placeholder="Ürün, müşteri veya yorum ara..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                <div className="filter-group">
                    <Filter size={16} />
                    <select
                        className="input"
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                    >
                        <option value="all">Tüm Durumlar</option>
                        <option value="pending">Bekliyor</option>
                        <option value="approved">Onaylı</option>
                        <option value="rejected">Reddedildi</option>
                        <option value="spam">Spam</option>
                    </select>
                </div>

                <div className="filter-info">
                    {filteredReviews.length} yorum bulundu
                </div>
            </div>

            {/* Reviews List */}
            <div className="reviews-list">
                {filteredReviews.map((review) => {
                    const status = getStatusBadge(review.status);
                    return (
                        <div key={review.id} className={`review-card ${review.status}`}>
                            <div className="review-header">
                                <div className="review-product">
                                    <span className="product-name">{review.productName}</span>
                                    <span className={`badge ${status.class}`}>{status.label}</span>
                                </div>
                                <div className="review-rating">
                                    {renderStars(review.rating)}
                                </div>
                            </div>

                            <div className="review-content">
                                <p className="review-comment">{review.comment}</p>
                            </div>

                            <div className="review-footer">
                                <div className="review-author">
                                    <span className="author-name">{review.customerName}</span>
                                    <span className="review-date">{formatDate(review.createdAt)}</span>
                                </div>

                                <div className="review-actions">
                                    {review.status === 'pending' && (
                                        <>
                                            <button
                                                className="btn btn-success btn-sm"
                                                onClick={() => updateStatus(review.id, 'approved')}
                                                title="Onayla"
                                            >
                                                <Check size={14} /> Onayla
                                            </button>
                                            <button
                                                className="btn btn-danger btn-sm"
                                                onClick={() => updateStatus(review.id, 'rejected')}
                                                title="Reddet"
                                            >
                                                <X size={14} /> Reddet
                                            </button>
                                        </>
                                    )}
                                    {review.status !== 'spam' && (
                                        <button
                                            className="btn btn-ghost btn-sm"
                                            onClick={() => updateStatus(review.id, 'spam')}
                                            title="Spam İşaretle"
                                        >
                                            <AlertTriangle size={14} /> Spam
                                        </button>
                                    )}
                                    <button
                                        className="btn btn-ghost btn-sm"
                                        onClick={() => deleteReview(review.id)}
                                        title="Sil"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredReviews.length === 0 && (
                <div className="empty-state">
                    <MessageSquare size={64} />
                    <h3>Yorum Bulunamadı</h3>
                    <p>Arama kriterlerinize uygun yorum bulunamadı.</p>
                </div>
            )}
        </div>
    );
}
