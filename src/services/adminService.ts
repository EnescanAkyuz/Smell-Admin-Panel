import { supabase } from '../lib/supabase';
import type { AdminUser } from '../types';

export const adminService = {
    async getAll(): Promise<AdminUser[]> {
        // RLS hatasını debug etmek için catch ekleyelim
        const { data, error } = await supabase
            .from('admin_profiles')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Admin fetch error details:', error);
            return [];
        }

        if (!data) return [];

        return data.map((u: any) => ({
            id: u.id,
            username: u.username || 'İsimsiz',
            email: u.email || '',
            role: u.role || 'editor',
            status: u.status || 'active',
            createdAt: u.created_at || new Date().toISOString(),
            lastLogin: u.last_login || '',
        }));
    },

    async updateStatus(id: string, status: 'active' | 'inactive'): Promise<any> {
        const { data, error } = await supabase
            .from('admin_profiles')
            .update({ status })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('admin_profiles')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async update(id: string, updates: Partial<AdminUser>): Promise<any> {
        const { data, error } = await supabase
            .from('admin_profiles')
            .update({
                username: updates.username,
                role: updates.role,
                email: updates.email
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async create(user: { username: string, email: string, role: string }): Promise<void> {
        // Önemli: Ekleme yaparken ID belirtmiyoruz, DB generandom_uuid() ile oluşturacak
        const { error } = await supabase
            .from('admin_profiles')
            .insert([{
                username: user.username,
                email: user.email,
                role: user.role,
                status: 'active'
            }]);

        if (error) throw error;
    },

    async getLoginLogs(): Promise<any[]> {
        const { data, error } = await supabase
            .from('admin_login_logs')
            .select('*')
            .order('timestamp', { ascending: false })
            .limit(50);

        if (error) {
            console.error('Logs fetch error details:', error);
            return [];
        }

        if (!data) return [];

        return data.map((log: any) => ({
            id: log.id,
            userId: log.user_id,
            username: log.username,
            ip: log.ip_address || 'Bilinmiyor',
            status: log.status,
            timestamp: log.timestamp,
        }));
    },

    async recordLoginLog(log: { userId?: string, username: string, ip: string, status: 'success' | 'failed' }): Promise<void> {
        const { error } = await supabase
            .from('admin_login_logs')
            .insert([{
                user_id: log.userId,
                username: log.username,
                ip_address: log.ip,
                status: log.status,
                timestamp: new Date().toISOString()
            }]);

        if (error) console.error('Record log error:', error);
    }
};
