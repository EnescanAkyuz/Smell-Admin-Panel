import { supabase } from '../lib/supabase';
import type { Category } from '../types';

const mapCategory = (c: any): Category => ({
    id: c.id,
    name: c.name,
    description: c.description,
    order: c.order,
    isActive: c.is_active,
    slug: c.slug,
    productCount: 0 // This would ideally be a count query or a computed column
});

export const categoryService = {
    async getAll(): Promise<Category[]> {
        const { data, error } = await supabase
            .from('categories')
            .select('*')
            .order('order', { ascending: true });

        if (error) throw error;
        return (data || []).map(mapCategory);
    },

    async update(id: string, category: Partial<Category>): Promise<Category> {
        const updateData: any = {};
        if (category.name !== undefined) updateData.name = category.name;
        if (category.description !== undefined) updateData.description = category.description;
        if (category.order !== undefined) updateData.order = category.order;
        if (category.isActive !== undefined) updateData.is_active = category.isActive;
        if (category.slug !== undefined) updateData.slug = category.slug;

        const { data, error } = await supabase
            .from('categories')
            .update(updateData)
            .eq('id', id)
            .select('*')
            .single();

        if (error) throw error;
        return mapCategory(data);
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async create(category: Omit<Category, 'id' | 'productCount'>): Promise<Category> {
        const { data, error } = await supabase
            .from('categories')
            .insert({
                name: category.name,
                description: category.description,
                order: category.order,
                is_active: category.isActive,
                slug: category.slug
            })
            .select('*')
            .single();

        if (error) throw error;
        return mapCategory(data);
    }
};
