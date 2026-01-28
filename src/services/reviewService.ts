import { supabase } from '../lib/supabase';
import type { Review } from '../types';

const mapReview = (r: any): Review => ({
    id: r.id,
    productId: r.product_id,
    productName: r.products?.name || 'Ürün Silinmiş',
    customerId: r.customer_id,
    customerName: r.customers?.first_name ? `${r.customers.first_name} ${r.customers.last_name}` : 'Bilinmeyen Müşteri',
    rating: r.rating,
    comment: r.comment,
    status: r.status,
    createdAt: r.created_at
});

export const reviewService = {
    async getAll(): Promise<Review[]> {
        const { data, error } = await supabase
            .from('reviews')
            .select(`
                *,
                products (name),
                customers (first_name, last_name)
            `)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching reviews:', error);
            // Fallback empty array on error to prevent crash
            return [];
        }

        return (data || []).map(mapReview);
    },

    async updateStatus(id: string, status: Review['status']): Promise<void> {
        const { error } = await supabase
            .from('reviews')
            .update({ status })
            .eq('id', id);
        
        if (error) throw error;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('reviews')
            .delete()
            .eq('id', id);
        
        if (error) throw error;
    }
};
