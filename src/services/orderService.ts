import { supabase } from '../lib/supabase';
import type { Order, OrderStatus, PaymentStatus } from '../types';

const mapOrder = (o: any): Order => ({
    id: o.id,
    orderNumber: o.order_number,
    customerId: o.customer_id || '',
    customerName: o.customer_name,
    customerEmail: o.customer_email || '',
    customerPhone: o.customer_phone || '',
    shippingAddress: o.shipping_address || {},
    billingAddress: o.billing_address || {},
    items: o.items || [],
    subtotal: o.subtotal || 0,
    vatAmount: o.vat_amount || 0,
    shippingCost: o.shipping_cost || 0,
    total: o.total_amount,
    status: o.status as OrderStatus,
    paymentStatus: o.payment_status as PaymentStatus,
    paymentMethod: o.payment_method || '',
    orderDate: o.order_date,
    history: o.history || [],
    shippingCompany: o.shipping_company,
    trackingNumber: o.tracking_number,
    trackingUrl: o.tracking_url,
    paymentDate: o.payment_date,
});

export const orderService = {
    async getAll(): Promise<Order[]> {
        const { data, error } = await supabase
            .from('orders')
            .select('*')
            .order('order_date', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapOrder);
    },

    async getById(id: string): Promise<Order | undefined> {
        // Fetch order with its items
        const { data, error } = await supabase
            .from('orders')
            .select('*, order_items(*)')
            .eq('id', id)
            .single();

        if (error) throw error;
        if (!data) return undefined;

        return mapOrder({
            ...data,
            items: (data.order_items || []).map((item: any) => ({
                id: item.id,
                productId: item.product_id,
                productName: item.product_name,
                quantity: item.quantity,
                unitPrice: item.unit_price,
                totalPrice: item.total_price,
            }))
        });
    },

    async updateStatus(id: string, status: OrderStatus): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .update({ status })
            .eq('id', id);

        if (error) throw error;
    },

    async updateShipping(id: string, info: { company: string; trackingNumber: string; trackingUrl?: string }): Promise<void> {
        const { error } = await supabase
            .from('orders')
            .update({
                shipping_company: info.company,
                tracking_number: info.trackingNumber,
                tracking_url: info.trackingUrl
            })
            .eq('id', id);

        if (error) throw error;
    }
};
