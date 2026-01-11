import { supabase } from '../lib/supabase';
import type { DashboardStats } from '../types';

export const dashboardService = {
    async getStats(): Promise<DashboardStats> {
        // Run multiple queries in parallel for efficiency
        const [
            ordersRes,
            revenueRes,
            todayRevenueRes
        ] = await Promise.all([
            // Order counts by status
            supabase.from('orders').select('status'),

            // Total Revenue sum
            supabase.rpc('get_total_revenue'), // We'll create this SQL function

            // Today's Revenue sum
            supabase.rpc('get_today_revenue') // We'll create this SQL function
        ]);

        const orders = ordersRes.data || [];

        return {
            totalOrders: orders.length,
            pendingOrders: orders.filter(o => o.status === 'pending').length,
            shippedOrders: orders.filter(o => o.status === 'shipped').length,
            completedOrders: orders.filter(o => o.status === 'delivered').length,
            cancelledOrders: orders.filter(o => o.status === 'cancelled').length,
            totalRevenue: revenueRes.data || 0,
            todayRevenue: todayRevenueRes.data || 0,
            weekRevenue: 0, // Simplified for now
            monthRevenue: 0 // Simplified for now
        };
    }
};
