import { getSupabase } from '../_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { activity_id, percent, comment, user_id } = req.body;
        const supabase = getSupabase();

        // 1. Insert progress log
        const { error: logError } = await supabase
            .from('registros_de_progresso')
            .insert({
                'id_atividade': activity_id,
                'percentual': percent,
                'comentário': comment || '',
                'id_usuário': user_id,
            });

        if (logError) {
            console.error('Insert log error:', logError);
            return res.status(500).json({ error: logError.message });
        }

        // 2. Update activity progress
        const { error: updateError } = await supabase
            .from('atividades')
            .update({
                'progresso_percentual': percent,
                'última_atualização': new Date().toISOString(),
                'atualizado_em': new Date().toISOString(),
            })
            .eq('id', activity_id);

        if (updateError) {
            console.error('Update activity error:', updateError);
            return res.status(500).json({ error: updateError.message });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Progress error:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
