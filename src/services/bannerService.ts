import { supabase } from '../lib/supabase';
import type { Banner, Showcase } from '../types';

const mapBanner = (b: any): Banner => ({
    id: b.id,
    title: b.title,
    subtitle: b.subtitle,
    image: b.image,
    link: b.link,
    order: b.order,
    isActive: b.is_active,
    createdAt: b.created_at
});

const mapShowcase = (s: any): Showcase => ({
    id: s.id,
    type: s.type,
    title: s.title,
    content: s.content,
    productIds: s.product_ids || [],
    isActive: s.is_active,
    order: s.order
});

export const bannerService = {
    // Banners
    async getBanners(): Promise<Banner[]> {
        const { data, error } = await supabase
            .from('banners')
            .select('*')
            .order('order', { ascending: true });

        if (error) {
            console.error('Error fetching banners:', error);
            return [];
        }
        return (data || []).map(mapBanner);
    },

    async createBanner(banner: Partial<Banner>): Promise<Banner> {
        const { data, error } = await supabase
            .from('banners')
            .insert({
                title: banner.title,
                subtitle: banner.subtitle,
                image: banner.image,
                link: banner.link,
                order: banner.order,
                is_active: banner.isActive
            })
            .select()
            .single();

        if (error) throw error;
        return mapBanner(data);
    },

    async updateBanner(id: string, banner: Partial<Banner>): Promise<Banner> {
        const { data, error } = await supabase
            .from('banners')
            .update({
                title: banner.title,
                subtitle: banner.subtitle,
                image: banner.image,
                link: banner.link,
                order: banner.order,
                is_active: banner.isActive
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapBanner(data);
    },

    async deleteBanner(id: string): Promise<void> {
        const { error } = await supabase
            .from('banners')
            .delete()
            .eq('id', id);
        if (error) throw error;
    },

    // Showcases
    async getShowcases(): Promise<Showcase[]> {
        const { data, error } = await supabase
            .from('showcases')
            .select('*')
            .order('order', { ascending: true });

        if (error) {
            console.error('Error fetching showcases:', error);
            return [];
        }
        return (data || []).map(mapShowcase);
    },

    async updateShowcase(id: string, showcase: Partial<Showcase>): Promise<Showcase> {
        const { data, error } = await supabase
            .from('showcases')
            .update({
                title: showcase.title,
                content: showcase.content,
                product_ids: showcase.productIds,
                is_active: showcase.isActive,
                order: showcase.order
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapShowcase(data);
    }
};
