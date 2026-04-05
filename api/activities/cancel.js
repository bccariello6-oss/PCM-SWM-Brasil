import { getSupabase } from '../_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { id, is_cancelled } = req.body;
        const supabase = getSupabase();

        const { error } = await supabase
            .from('atividades')
            .update({
                'está_cancelada': is_cancelled,
                'atualizado_em': new Date().toISOString(),
            })
            .eq('id', id);

        if (error) {
            console.error('Cancel error:', error);
            return res.status(500).json({ error: error.message });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Cancel activity error:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
