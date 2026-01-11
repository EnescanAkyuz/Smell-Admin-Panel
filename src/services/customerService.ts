import { supabase } from '../lib/supabase';
import type { Customer } from '../types';

const mapCustomer = (c: any): Customer => ({
    id: c.id,
    firstName: c.first_name,
    lastName: c.last_name,
    email: c.email,
    phone: c.phone || '',
    status: c.status as 'active' | 'inactive',
    addresses: c.addresses || [],
    orderCount: c.order_count || 0,
    totalSpent: c.total_spent || 0,
    createdAt: c.created_at,
    lastOrderDate: c.last_order_date
});

export const customerService = {
    async getAll(): Promise<Customer[]> {
        const { data, error } = await supabase
            .from('customers')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapCustomer);
    },

    async update(id: string, customer: Partial<Customer>): Promise<Customer> {
        const updateData: any = {};
        if (customer.firstName !== undefined) updateData.first_name = customer.firstName;
        if (customer.lastName !== undefined) updateData.last_name = customer.lastName;
        if (customer.email !== undefined) updateData.email = customer.email;
        if (customer.phone !== undefined) updateData.phone = customer.phone;
        if (customer.status !== undefined) updateData.status = customer.status;

        const { data, error } = await supabase
            .from('customers')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return mapCustomer(data);
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('customers')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
