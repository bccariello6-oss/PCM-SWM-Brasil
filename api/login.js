import { getSupabase, corsHeaders } from './_utils.js';

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { username, password } = req.body;
        const supabase = getSupabase();

        const { data, error } = await supabase
            .from('Usuários')
            .select('*')
            .eq('nome_usuário', username)
            .eq('senha', password)
            .single();

        if (error || !data) {
            return res.status(200).json({ success: false, error: 'Credenciais inválidas' });
        }

        return res.status(200).json({
            success: true,
            user: {
                id: data.id,
                username: data['nome_usuário'],
                role: data['função'],
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ success: false, error: 'Erro interno' });
    }
}
