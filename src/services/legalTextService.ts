import { supabase } from '../lib/supabase';
import type { LegalText } from '../types';

const mapLegalText = (l: any): LegalText => ({
    id: l.id,
    type: l.type,
    title: l.title,
    content: l.content,
    isActive: l.is_active,
    updatedAt: l.updated_at
});

export const legalTextService = {
    async getAll(): Promise<LegalText[]> {
        const { data, error } = await supabase
            .from('legal_texts')
            .select('*')
            .order('title', { ascending: true });

        if (error) {
            console.error('Error fetching legal texts:', error);
            return [];
        }
        return (data || []).map(mapLegalText);
    },

    async update(id: string, text: Partial<LegalText>): Promise<LegalText> {
        const { data, error } = await supabase
            .from('legal_texts')
            .update({
                title: text.title,
                content: text.content,
                is_active: text.isActive,
                updated_at: new Date().toISOString()
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return mapLegalText(data);
    }
};
