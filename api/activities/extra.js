import { getSupabase } from '../_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, description, start_date, end_date, responsibility, category, os, resource } = req.body;
        const supabase = getSupabase();

        // Check if ID already exists
        const { data: existing } = await supabase
            .from('atividades')
            .select('id')
            .eq('id', id)
            .single();

        if (existing) {
            return res.status(400).json({ error: 'ID já existe' });
        }

        const { error } = await supabase
            .from('atividades')
            .insert({
                'id': id,
                'descrição': description,
                'data_inicial': start_date,
                'data_final': end_date,
                'duração': 0,
                'responsabilidade': responsibility,
                'caminho_crítico': false,
                'categoria': category || 'EXTRA',
                'os': os || '',
                'recurso': resource || '',
                'progresso_percentual': 0,
                'peso': 0,
                'é_extra': true,
                'está_cancelada': false,
            });

        if (error) {
            console.error('Insert extra error:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Extra activity error:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
