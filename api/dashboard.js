import { getSupabase, corsHeaders } from './_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('registros_de_progresso')
            .select('*')
            .order('carimbo_data_hora', { ascending: true });

        if (error) {
            console.error('Fetch logs error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Map Portuguese column names to English
        const logs = (data || []).map(l => ({
            id: l.id,
            activity_id: l['id_atividade'],
            percent: l['percentual'],
            comment: l['comentário'] || '',
            evidence_url: l['url_evidência'] || null,
            user_id: l['id_usuário'],
            timestamp: l['carimbo_data_hora'],
        }));

        return res.status(200).json({ logs });
    } catch (error) {
        console.error('Dashboard error:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
