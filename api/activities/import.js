import { getSupabase } from '../_utils.js';
import * as XLSX from 'xlsx';

export const config = {
    api: {
        bodyParser: {
            sizeLimit: '10mb',
        },
    },
};

export default async function handler(req, res) {
    if (req.method === 'OPTIONS') {
        return res.status(200).json({});
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { fileData } = req.body;
        if (!fileData) {
            return res.status(400).json({ error: 'Nenhum arquivo enviado' });
        }

        const supabase = getSupabase();

        // Parse base64 Excel file
        const buffer = Buffer.from(fileData, 'base64');
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

        if (!rows || rows.length === 0) {
            return res.status(400).json({ error: 'Planilha vazia ou formato inválido' });
        }

        // Map possible column names (the spreadsheet may use different names)
        const findColumn = (row, possibilities) => {
            for (const p of possibilities) {
                if (row[p] !== undefined) return row[p];
            }
            return '';
        };

        // First pass: calculate weights
        const activities = [];
        let totalDuration = 0;

        for (let i = 0; i < rows.length; i++) {
            const row = rows[i];
            const id = findColumn(row, ['ID', 'Id', 'id', 'Código', 'codigo', 'CÓDIGO']);
            if (!id) continue;

            const description = findColumn(row, ['Descricao', 'Descrição', 'DESCRIÇÃO', 'DESCRICAO', 'Description', 'description']);
            const startDate = findColumn(row, ['Inicio', 'Início', 'INICIO', 'INÍCIO', 'Start', 'start', 'Data Inicial', 'data_inicial']);
            const endDate = findColumn(row, ['Fim', 'FIM', 'End', 'end', 'Data Final', 'data_final', 'Término', 'TÉRMINO']);
            const duration = parseFloat(findColumn(row, ['Duracao', 'Duração', 'DURAÇÃO', 'DURACAO', 'Duration', 'duration', 'Horas']) || '0');
            const responsibility = findColumn(row, ['Responsavel', 'Responsável', 'RESPONSÁVEL', 'RESPONSAVEL', 'Responsible']);
            const critical = findColumn(row, ['Critico', 'Crítico', 'CRÍTICO', 'CRITICO', 'Critical']);
            const criticality = findColumn(row, ['Criticidade', 'CRITICIDADE', 'Criticality']);
            const category = findColumn(row, ['Categoria', 'CATEGORIA', 'Category', 'category']);
            const os = findColumn(row, ['OS', 'Os', 'os', 'Ordem']);
            const resource = findColumn(row, ['Recurso', 'RECURSO', 'Resource', 'resource']);

            // Parse dates - handle Excel serial numbers
            let parsedStart, parsedEnd;
            if (typeof startDate === 'number') {
                parsedStart = new Date((startDate - 25569) * 86400 * 1000).toISOString();
            } else {
                parsedStart = startDate ? new Date(startDate).toISOString() : new Date().toISOString();
            }
            if (typeof endDate === 'number') {
                parsedEnd = new Date((endDate - 25569) * 86400 * 1000).toISOString();
            } else {
                parsedEnd = endDate ? new Date(endDate).toISOString() : new Date().toISOString();
            }

            const act = {
                id: String(id),
                description: String(description),
                start_date: parsedStart,
                end_date: parsedEnd,
                duration: duration || 0,
                responsibility: String(responsibility),
                critical_path: String(critical).toLowerCase() === 'sim' || String(critical).toLowerCase() === 'true' || String(critical) === '1',
                criticality: String(criticality),
                category: String(category),
                os: String(os),
                resource: String(resource),
                import_order: i,
            };

            totalDuration += act.duration || 1;
            activities.push(act);
        }

        // Calculate weights
        const activitiesWithWeights = activities.map(a => ({
            ...a,
            weight: totalDuration > 0 ? (a.duration || 1) / totalDuration : 1 / activities.length,
        }));

        // Clear existing data first
        await supabase.from('registros_de_progresso').delete().neq('id', 0);
        await supabase.from('atividades').delete().neq('id', '');

        // Insert in batches of 50
        const batchSize = 50;
        for (let i = 0; i < activitiesWithWeights.length; i += batchSize) {
            const batch = activitiesWithWeights.slice(i, i + batchSize).map(a => ({
                'id': a.id,
                'descrição': a.description,
                'data_inicial': a.start_date,
                'data_final': a.end_date,
                'duração': a.duration,
                'responsabilidade': a.responsibility,
                'caminho_crítico': a.critical_path,
                'criticidade': a.criticality,
                'categoria': a.category,
                'os': a.os,
                'recurso': a.resource,
                'progresso_percentual': 0,
                'peso': a.weight,
                'é_extra': false,
                'está_cancelada': false,
                'ordem_importação': a.import_order,
            }));

            const { error } = await supabase
                .from('atividades')
                .upsert(batch, { onConflict: 'id' });

            if (error) {
                console.error('Import batch error:', error);
                return res.status(500).json({ error: `Erro ao importar lote: ${error.message}` });
            }
        }

        return res.status(200).json({
            success: true,
            count: activitiesWithWeights.length,
        });
    } catch (error) {
        console.error('Import error:', error);
        return res.status(500).json({ error: 'Erro ao processar importação: ' + error.message });
    }
}
