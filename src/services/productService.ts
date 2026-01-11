import { supabase } from '../lib/supabase';
import type { Product } from '../types';

const mapProduct = (p: any): Product => ({
    id: p.id,
    name: p.name,
    description: p.description,
    shortDescription: p.short_description,
    price: p.price,
    discountedPrice: p.discounted_price,
    currency: p.currency,
    vatRate: p.vat_rate,
    stock: p.stock,
    sku: p.sku,
    barcode: p.barcode,
    categoryId: p.category_id,
    categoryName: p.categories?.name || '',
    images: p.images || [],
    isFeatured: p.is_featured,
    isActive: p.is_active,
    metaTitle: p.meta_title,
    metaDescription: p.meta_description,
    slug: p.slug,
    createdAt: p.created_at,
    updatedAt: p.updated_at
});

export const productService = {
    async getAll(): Promise<Product[]> {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .order('created_at', { ascending: false });

        if (error) throw error;
        return (data || []).map(mapProduct);
    },

    async getById(id: string): Promise<Product | undefined> {
        const { data, error } = await supabase
            .from('products')
            .select('*, categories(name)')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data ? mapProduct(data) : undefined;
    },

    async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'categoryName'>): Promise<Product> {
        const { data, error } = await supabase
            .from('products')
            .insert({
                name: product.name,
                description: product.description,
                short_description: product.shortDescription,
                price: product.price,
                discounted_price: product.discountedPrice,
                currency: product.currency,
                vat_rate: product.vatRate,
                stock: product.stock,
                sku: product.sku,
                barcode: product.barcode,
                category_id: product.categoryId,
                images: product.images,
                is_featured: product.isFeatured,
                is_active: product.isActive,
                meta_title: product.metaTitle,
                meta_description: product.metaDescription,
                slug: product.slug
            })
            .select('*, categories(name)')
            .single();

        if (error) throw error;
        return mapProduct(data);
    },

    async update(id: string, product: Partial<Product>): Promise<Product> {
        const updateData: any = {};

        if (product.name !== undefined) updateData.name = product.name;
        if (product.description !== undefined) updateData.description = product.description;
        if (product.shortDescription !== undefined) updateData.short_description = product.shortDescription;
        if (product.price !== undefined) updateData.price = product.price;
        if (product.discountedPrice !== undefined) updateData.discounted_price = product.discountedPrice;
        if (product.stock !== undefined) updateData.stock = product.stock;
        if (product.isActive !== undefined) updateData.is_active = product.isActive;
        if (product.isFeatured !== undefined) updateData.is_featured = product.isFeatured;
        if (product.categoryId !== undefined) updateData.category_id = product.categoryId;
        if (product.images !== undefined) updateData.images = product.images;

        const { data, error } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', id)
            .select('*, categories(name)')
            .single();

        if (error) throw error;
        return mapProduct(data);
    },

    async delete(id: string): Promise<void> {
        const { error } = await supabase
            .from('products')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
