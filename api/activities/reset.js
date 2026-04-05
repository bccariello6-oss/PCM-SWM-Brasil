import { getSupabase } from '../_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const supabase = getSupabase();

        // Delete all progress logs first (foreign key constraint)
        const { error: logsError } = await supabase
            .from('registros_de_progresso')
            .delete()
            .neq('id', 0); // Delete all rows

        if (logsError) {
            console.error('Delete logs error:', logsError);
            return res.status(500).json({ success: false, error: logsError.message });
        }

        // Delete all activities
        const { error: activitiesError } = await supabase
            .from('atividades')
            .delete()
            .neq('id', ''); // Delete all rows

        if (activitiesError) {
            console.error('Delete activities error:', activitiesError);
            return res.status(500).json({ success: false, error: activitiesError.message });
        }

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Reset error:', error);
        return res.status(500).json({ success: false, error: 'Erro interno' });
    }
}
