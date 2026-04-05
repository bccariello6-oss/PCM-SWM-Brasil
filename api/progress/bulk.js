import { getSupabase } from '../_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { activity_ids, percent, user_id } = req.body;
        const supabase = getSupabase();

        // Update all activities
        for (const activityId of activity_ids) {
            // Insert log
            await supabase
                .from('registros_de_progresso')
                .insert({
                    'id_atividade': activityId,
                    'percentual': percent,
                    'comentário': 'Atualização em massa',
                    'id_usuário': user_id,
                });

            // Update activity
            await supabase
                .from('atividades')
                .update({
                    'progresso_percentual': percent,
                    'última_atualização': new Date().toISOString(),
                    'atualizado_em': new Date().toISOString(),
                })
                .eq('id', activityId);
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Bulk progress error:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
