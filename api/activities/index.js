import { getSupabase, corsHeaders } from '../_utils.js';

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
            .from('atividades')
            .select('*')
            .order('ordem_importação', { ascending: true, nullsFirst: false });

        if (error) {
            console.error('Fetch activities error:', error);
            return res.status(500).json({ error: error.message });
        }

        // Map Portuguese column names to English (as expected by frontend)
        const activities = (data || []).map(a => ({
            id: a.id,
            description: a['descrição'] || '',
            start_date: a['data_inicial'] || '',
            end_date: a['data_final'] || '',
            duration: a['duração'] || 0,
            responsibility: a['responsabilidade'] || '',
            critical_path: a['caminho_crítico'] || false,
            criticality: a['criticidade'] || '',
            category: a['categoria'] || '',
            os: a['os'] || '',
            resource: a['recurso'] || '',
            percent_progress: a['progresso_percentual'] || 0,
            weight: a['peso'] || 0,
            status_calculated: a['status_calculado'] || '',
            delay_calculated: a['atraso_calculado'] || 0,
            last_update: a['última_atualização'] || null,
            is_extra: a['é_extra'] || false,
            is_cancelled: a['está_cancelada'] || false,
        }));

        return res.status(200).json(activities);
    } catch (error) {
        console.error('Activities error:', error);
        return res.status(500).json({ error: 'Erro interno' });
    }
}
