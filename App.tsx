
import React, { useState, useMemo, useRef, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import WeeklyGrid from './components/WeeklyGrid';
import OSForm from './components/OSForm';
import TechnicianForm from './components/TechnicianForm';
import AssetForm from './components/AssetForm';
import WorkOrderList from './components/WorkOrderList';
import TeamManagement from './components/TeamManagement';
import ImportInfoModal from './components/ImportInfoModal';
import ShutdownManagement from './components/ShutdownManagement';
import AssetManagement from './components/AssetManagement';
import { MaintenanceOrder, Technician, Discipline, OSStatus, OSType, OperationalShutdown, Asset, LogEntry, Shift } from './types';
import { mockOS, mockTechnicians, mockShutdowns, mockAssets } from './mockData';
import { supabase } from './supabaseClient';
import Auth from './components/Auth';
import {
  Plus,
  Search,
  Filter,
  FileDown,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Bell,
  Factory,
  ClipboardList,
  FileSpreadsheet,
  Database,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X
} from 'lucide-react';
import * as XLSX from 'xlsx';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState('planning');
  const [orders, setOrders] = useState<MaintenanceOrder[]>([]);
  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [shutdowns, setShutdowns] = useState<OperationalShutdown[]>(mockShutdowns);
  const [assets, setAssets] = useState<Asset[]>(mockAssets);
  const [session, setSession] = useState<any>(null);

  // UX States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // OS Modal State
  const [isOSModalOpen, setIsOSModalOpen] = useState(false);
  const [selectedOS, setSelectedOS] = useState<Partial<MaintenanceOrder> | undefined>();

  // Technician Modal State
  const [isTechModalOpen, setIsTechModalOpen] = useState(false);
  const [selectedTech, setSelectedTech] = useState<Technician | undefined>();

  // Asset Modal State
  const [isAssetModalOpen, setIsAssetModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | undefined>();

  // Import Modal State
  const [isImportInfoOpen, setIsImportInfoOpen] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDiscipline, setFilterDiscipline] = useState<string>('All');
  const [filterTechnician, setFilterTechnician] = useState<string>('All');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Supabase Session effect
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Initial load simulation
  // Fetch maintenance orders from Supabase
  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      // Fetch orders
      const { data: ordersData, error: ordersError } = await supabase
        .from('maintenance_orders')
        .select('*');

      if (ordersError) throw ordersError;

      // Fetch logs for these orders
      const { data: logsData, error: logsError } = await supabase
        .from('log_entries')
        .select('*');

      if (logsError) throw logsError;

      // Group logs by order_id
      const logsByOrder: { [key: string]: LogEntry[] } = {};
      (logsData || []).forEach((log: any) => {
        if (!logsByOrder[log.order_id]) logsByOrder[log.order_id] = [];
        logsByOrder[log.order_id].push({
          id: log.id,
          timestamp: log.timestamp,
          userName: log.user_name,
          action: log.action,
          field: log.field,
          oldValue: log.old_value,
          newValue: log.new_value
        });
      });

      // Format orders
      const formattedOrders: MaintenanceOrder[] = (ordersData || []).map((o: any) => ({
        id: o.id,
        osNumber: o.os_number,
        type: o.type as OSType,
        area: o.area,
        tag: o.tag,
        description: o.description,
        discipline: o.discipline as Discipline,
        priority: o.priority,
        estimatedHours: Number(o.estimated_hours),
        operationalShutdown: o.operational_shutdown,
        status: o.status as OSStatus,
        technicianId: o.technician_id,
        collaboratorId: o.collaborator_id,
        scheduledDay: o.scheduled_day,
        reprogrammingReason: o.reprogramming_reason,
        logs: logsByOrder[o.id] || []
      }));

      setOrders(formattedOrders);
    } catch (err: any) {
      console.error('Erro ao buscar ordens:', err);
      showNotification('Erro ao carregar ordens: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch technicians from Supabase
  const fetchTechnicians = async () => {
    setIsLoading(true);
    try {
      // Tentar buscar de 'técnicos' (como visto no seu Supabase) e fallback para 'technicians'
      let { data, error } = await supabase.from('technicians').select('*');

      if (error) {
        console.warn('Tentando fallback para "técnicos"...', error);
        const fallback = await supabase.from('técnicos').select('*');
        if (!fallback.error) {
          data = fallback.data;
          error = null;
        }
      }

      if (error) throw error;

      const formattedTechnicians: Technician[] = (data || []).map((t: any) => ({
        id: t.id,
        name: t.nome || t.name || 'Sem Nome',
        discipline: t.disciplina || t.discipline || Discipline.MECHANICS,
        shift: t.mudança || t.shift || Shift.ADM,
        isLeader: t.é_líder !== undefined ? t.é_líder : (t.is_leader || false)
      }));

      setTechnicians(formattedTechnicians);
    } catch (err: any) {
      console.error('Erro ao buscar técnicos:', err);
      showNotification('Erro ao carregar técnicos: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    if (session) {
      fetchTechnicians();
      fetchOrders();
    }
  }, [session]);

  const showNotification = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    // Clear toast after 3 seconds
    const timer = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(timer);
  };

  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      const tech = technicians.find(t => t.id === o.technicianId);
      const collab = technicians.find(t => t.id === o.collaboratorId);

      const searchableContent = [
        o.osNumber,
        o.description,
        o.tag,
        o.area,
        o.discipline,
        o.type,
        tech?.name || '',
        collab?.name || ''
      ].join(' ').toLowerCase();

      const matchesSearch = searchableContent.includes(searchTerm.toLowerCase());
      const matchesDiscipline = filterDiscipline === 'All' || o.discipline === filterDiscipline;

      const matchesTechnician = filterTechnician === 'All' ||
        o.technicianId === filterTechnician ||
        o.collaboratorId === filterTechnician;

      return matchesSearch && matchesDiscipline && matchesTechnician;
    });
  }, [orders, searchTerm, filterDiscipline, filterTechnician, technicians]);

  const filteredTechnicians = useMemo(() => {
    if (!searchTerm && filterDiscipline === 'All' && filterTechnician === 'All') return technicians;
    const term = searchTerm.toLowerCase();
    return technicians.filter(t => {
      const matchesName = t.name.toLowerCase().includes(term);
      const matchesTechDiscipline = t.discipline.toLowerCase().includes(term);
      const matchesShift = t.shift.toLowerCase().includes(term);
      const hasFilteredOrders = filteredOrders.some(o => o.technicianId === t.id || o.collaboratorId === t.id);
      const matchesFilterDiscipline = filterDiscipline === 'All' || t.discipline === filterDiscipline;
      const matchesFilterTechnician = filterTechnician === 'All' || t.id === filterTechnician;
      return (matchesName || matchesTechDiscipline || matchesShift || hasFilteredOrders) &&
        matchesFilterDiscipline &&
        matchesFilterTechnician;
    });
  }, [technicians, searchTerm, filteredOrders, filterDiscipline, filterTechnician]);

  const handleSaveOS = async (newOS: MaintenanceOrder, shouldClose: boolean = true) => {
    const timestamp = new Date().toISOString();
    const currentUser = "Diogo Jesus";
    setIsLoading(true);

    try {
      const isUpdate = !!(newOS.id || (selectedOS && selectedOS.id));
      let targetId = newOS.id || selectedOS?.id;
      const logsToInsert: any[] = [];

      const osPayload = {
        os_number: newOS.osNumber || '000000',
        type: newOS.type || OSType.PREVENTIVE,
        area: newOS.area || '',
        tag: newOS.tag || '',
        description: newOS.description || '',
        discipline: newOS.discipline || Discipline.MECHANICS,
        priority: newOS.priority || 'Média',
        estimated_hours: Number(newOS.estimatedHours) || 0,
        operational_shutdown: !!newOS.operationalShutdown,
        status: newOS.status || OSStatus.PLANNED,
        technician_id: newOS.technicianId || null,
        collaborator_id: newOS.collaboratorId || null,
        scheduled_day: newOS.scheduledDay || 'Segunda',
        reprogramming_reason: newOS.reprogrammingReason || null,
        updated_at: timestamp
      };

      if (isUpdate) {
        const oldOS = orders.find(o => o.id === targetId);

        if (oldOS) {
          if (oldOS.status !== newOS.status) {
            logsToInsert.push({
              order_id: targetId,
              user_name: currentUser,
              action: newOS.status === OSStatus.REPROGRAMMED ? 'Reprogramação de OS' : 'Alteração de status',
              field: 'status',
              old_value: oldOS.status,
              new_value: newOS.status,
              timestamp
            });
          }
          if (oldOS.priority !== newOS.priority) {
            logsToInsert.push({
              order_id: targetId,
              user_name: currentUser,
              action: 'Alteração de prioridade',
              field: 'prioridade',
              old_value: oldOS.priority,
              new_value: newOS.priority,
              timestamp
            });
          }
        }

        const { error: updateError } = await supabase
          .from('maintenance_orders')
          .update(osPayload)
          .eq('id', targetId);

        if (updateError) throw updateError;
        showNotification('Ordem de Serviço atualizada com sucesso!');
      } else {
        // Garantir que não estamos tentando enviar um ID temporário/inválido
        const { id, ...insertPayload } = osPayload as any;

        const { data: insertedData, error: insertError } = await supabase
          .from('maintenance_orders')
          .insert([{ ...insertPayload, created_at: timestamp }])
          .select()
          .single();

        if (insertError) throw insertError;
        targetId = insertedData.id;

        logsToInsert.push({
          order_id: targetId,
          user_name: currentUser,
          action: 'Criação da OS',
          timestamp
        });

        showNotification('Nova OS criada com sucesso!');
      }

      // Inserir logs se houver
      if (logsToInsert.length > 0) {
        const { error: logError } = await supabase.from('log_entries').insert(logsToInsert);
        if (logError) console.error('Erro ao salvar logs:', logError);
      }

      // Atualizar lista local
      await fetchOrders();

      if (shouldClose) {
        setIsOSModalOpen(false);
        setSelectedOS(undefined);
      } else {
        // Buscar a OS recém guardada/atualizada da nova lista
        // Usamos um timeout pequeno ou o retorno direto para garantir sincronia
        setTimeout(() => {
          setOrders(currentOrders => {
            const updated = currentOrders.find(o => o.id === targetId);
            if (updated) setSelectedOS(updated);
            return currentOrders;
          });
        }, 100);
      }

    } catch (err: any) {
      console.error('Erro detalhado ao salvar OS:', err);
      const errorMsg = err.message || err.details || 'Verifique se as tabelas foram criadas corretamente.';
      showNotification('Falha no salvamento: ' + errorMsg, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditOS = (os: MaintenanceOrder) => {
    setSelectedOS(os);
    setIsOSModalOpen(true);
  };

  const handleQuickAddOrder = (techId: string, day: string) => {
    setSelectedOS({
      technicianId: techId,
      scheduledDay: day,
      status: OSStatus.PLANNED,
      discipline: technicians.find(t => t.id === techId)?.discipline || Discipline.MECHANICS
    });
    setIsOSModalOpen(true);
  };

  const handleSaveTechnician = async (techData: Technician) => {
    setIsLoading(true);
    try {
      const isUpdate = !!(selectedTech && selectedTech.id);

      // Mapeamento resiliente para o banco (English keys by default, but we should handle DB structure)
      // Se descobrimos que o banco usa Portuguese keys, precisamos mapear aqui também.
      // Por simplicidade, continuaremos usando English keys para INSERT/UPDATE
      // assumindo que o script de criação original as usou.
      // SE o usuário criou a tabela manualmente com outros nomes, este update falhará.

      const techPayload = {
        name: techData.name,
        discipline: techData.discipline,
        shift: techData.shift,
        is_leader: techData.isLeader
      };

      if (isUpdate) {
        const { error } = await supabase
          .from('técnicos') // Tentar 'técnicos' primeiro
          .update(techPayload)
          .eq('id', selectedTech!.id);

        if (error) {
          // Fallback para 'technicians'
          const { error: fallbackError } = await supabase
            .from('technicians')
            .update(techPayload)
            .eq('id', selectedTech!.id);
          if (fallbackError) throw fallbackError;
        }
        showNotification('Técnico atualizado com sucesso!');
      } else {
        const { error } = await supabase
          .from('técnicos')
          .insert([techPayload]);

        if (error) {
          const { error: fallbackError } = await supabase
            .from('technicians')
            .insert([techPayload]);
          if (fallbackError) throw fallbackError;
        }
        showNotification('Novo técnico cadastrado com sucesso!');
      }
      await fetchTechnicians();
      setIsTechModalOpen(false);
      setSelectedTech(undefined);
    } catch (err: any) {
      console.error('Erro ao salvar técnico:', err);
      showNotification('Erro ao salvar técnico: ' + err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTechnician = (tech: Technician) => {
    setSelectedTech(tech);
    setIsTechModalOpen(true);
  };

  const handleDeleteTechnician = async (techId: string) => {
    if (confirm('Tem certeza que deseja excluir este técnico?')) {
      setIsLoading(true);
      try {
        const { error } = await supabase
          .from('technicians')
          .delete()
          .eq('id', techId);

        if (error) throw error;

        await fetchTechnicians();
        showNotification('Técnico removido do sistema.', 'error');
      } catch (err: any) {
        console.error('Erro ao excluir técnico:', err);
        showNotification('Erro ao excluir técnico: ' + err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleSaveAsset = (assetData: Asset) => {
    if (selectedAsset && selectedAsset.id) {
      setAssets(prev => prev.map(a => a.id === selectedAsset.id ? { ...a, ...assetData } : a));
    } else {
      const assetToAdd = { ...assetData, id: `asset-${Date.now()}` };
      setAssets(prev => [...prev, assetToAdd]);
    }
    showNotification('Ativo industrial salvo com sucesso!');
    setIsAssetModalOpen(false);
    setSelectedAsset(undefined);
  };

  const handleImportClick = () => {
    setError(null);
    setIsImportInfoOpen(true);
  };

  const handleProceedWithImport = () => {
    setIsImportInfoOpen(false);
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws) as any[];

          if (data.length === 0) throw new Error("O arquivo selecionado está vazio.");

          const timestamp = new Date().toISOString();
          const ordersToInsert = data.map((row) => {
            const osNumber = String(row['OS'] || row['Número'] || row['osNumber'] || '');
            if (!osNumber) return null;

            return {
              os_number: osNumber,
              type: (row['Tipo'] || OSType.PREVENTIVE) as OSType,
              area: String(row['Área'] || ''),
              tag: String(row['TAG'] || ''),
              description: String(row['Descrição'] || ''),
              discipline: (row['Disciplina'] || Discipline.MECHANICS) as Discipline,
              priority: (row['Prioridade'] || 'Média') as any,
              estimated_hours: Number(row['Horas'] || 1),
              operational_shutdown: row['Parada'] === 'Sim' || row['Parada'] === true,
              status: OSStatus.PLANNED,
              technician_id: technicians.find(t => t.name.toLowerCase() === String(row['Técnico'] || '').toLowerCase())?.id || null,
              collaborator_id: technicians.find(t => t.name.toLowerCase() === String(row['Colaborador'] || '').toLowerCase())?.id || null,
              scheduled_day: String(row['Dia'] || 'Segunda'),
              created_at: timestamp,
              updated_at: timestamp
            };
          }).filter(os => os !== null);

          if (ordersToInsert.length > 0) {
            const { error: insertError } = await supabase
              .from('maintenance_orders')
              .insert(ordersToInsert);

            if (insertError) throw insertError;

            await fetchOrders();
            setIsLoading(false);
            showNotification(`${ordersToInsert.length} ordens importadas e sincronizadas com sucesso!`);
          } else {
            throw new Error("Não foram encontradas ordens válidas na planilha.");
          }
        } catch (err: any) {
          setError(err.message || "Erro ao processar os dados da planilha.");
          setIsLoading(false);
        }
      };
      reader.onerror = () => {
        setError("Erro na leitura do arquivo.");
        setIsLoading(false);
      };
      reader.readAsBinaryString(file);
    } catch (err) {
      setError("Ocorreu um erro inesperado durante a importação.");
      setIsLoading(false);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const clearAllData = async () => {
    if (confirm('ATENÇÃO: Isso irá apagar TODAS as informações de programação da nuvem. Deseja continuar?')) {
      setIsLoading(true);
      try {
        const { error: deleteError } = await supabase
          .from('maintenance_orders')
          .delete()
          .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

        if (deleteError) throw deleteError;

        setOrders([]);
        setError(null);
        showNotification('Programação limpa com sucesso.', 'error');
      } catch (err: any) {
        console.error('Erro ao limpar dados:', err);
        showNotification('Erro ao limpar dados: ' + err.message, 'error');
      } finally {
        setIsLoading(false);
      }
    }
  };

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />

      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept=".xlsx, .xls"
          onChange={handleFileChange}
        />

        {/* Header */}
        <header className="h-20 bg-white border-b border-slate-200 px-8 flex items-center justify-between sticky top-0 z-10 shrink-0">
          <div className="flex items-center gap-6">
            <h2 className="text-xl font-bold text-slate-800 capitalize">
              {activeView === 'planning' ? 'Programação Semanal' :
                activeView === 'orders' ? 'Gestão de OS' :
                  activeView === 'teams' ? 'Equipes & Turnos' :
                    activeView === 'shutdowns' ? 'Paradas Operacionais' :
                      activeView === 'assets' ? 'Gestão de Ativos' :
                        activeView}
            </h2>

            <div className="h-10 px-4 bg-slate-100 rounded-xl flex items-center gap-3 border border-slate-200">
              <CalendarIcon className="w-4 h-4 text-slate-500" />
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <button className="p-1 hover:bg-slate-200 rounded transition-colors"><ChevronLeft className="w-4 h-4" /></button>
                <span>Semana #04 (19/01 - 25/01)</span>
                <button className="p-1 hover:bg-slate-200 rounded transition-colors"><ChevronRight className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar OS, TAG, Técnico..."
                className="pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-64"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>

            <button
              onClick={clearAllData}
              className="p-2 bg-red-50 text-red-500 rounded-xl hover:bg-red-100 transition-colors"
              title="Limpar Banco de Dados"
            >
              <Database className="w-5 h-5" />
            </button>

            <button className="p-2 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                DJ
              </div>
              <div className="hidden lg:block">
                <p className="text-sm font-bold text-slate-800 leading-tight">Diogo Jesus</p>
                <p className="text-xs text-slate-500 font-medium">Técnico de PCM</p>
              </div>
            </div>
          </div>
        </header>

        {/* Error Alert */}
        {error && (
          <div className="mx-6 mt-4 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-3 text-red-700">
              <AlertCircle className="w-5 h-5" />
              <p className="text-sm font-bold">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-xs font-black uppercase text-red-500 hover:text-red-700"
            >
              Fechar
            </button>
          </div>
        )}

        {/* View Content */}
        <div className={`p-6 flex-1 ${['dashboard', 'assets'].includes(activeView) ? 'overflow-hidden' : 'overflow-y-auto'}`}>
          {isLoading ? (
            <div className="h-full w-full flex flex-col items-center justify-center space-y-4">
              <div className="relative">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                <Factory className="w-6 h-6 text-blue-900 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
              </div>
              <p className="text-slate-500 font-bold animate-pulse">Processando dados industriais...</p>
            </div>
          ) : (
            <>
              {activeView === 'dashboard' && <Dashboard orders={orders} technicians={technicians} />}

              {activeView === 'planning' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex gap-2">
                      <select
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none min-w-[160px]"
                        value={filterDiscipline}
                        onChange={e => setFilterDiscipline(e.target.value)}
                      >
                        <option value="All">Todas Disciplinas</option>
                        {Object.values(Discipline).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>

                      <select
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none min-w-[180px]"
                        value={filterTechnician}
                        onChange={e => setFilterTechnician(e.target.value)}
                      >
                        <option value="All">Todos Técnicos</option>
                        {technicians.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                      </select>

                      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">
                        <Filter className="w-4 h-4" />
                        Mais Filtros
                      </button>
                      <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-slate-50">
                        <FileDown className="w-4 h-4" />
                        Exportar PDF
                      </button>
                      <button
                        onClick={handleImportClick}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-colors group"
                      >
                        <FileSpreadsheet className="w-4 h-4" />
                        Importar XLSX
                      </button>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedOS(undefined);
                        setIsOSModalOpen(true);
                      }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all active:scale-95"
                    >
                      <Plus className="w-5 h-5" />
                      Nova Programação
                    </button>
                  </div>

                  {technicians.length > 0 ? (
                    <WeeklyGrid
                      orders={filteredOrders}
                      technicians={filteredTechnicians}
                      onOrderClick={handleEditOS}
                      onAddOrder={handleQuickAddOrder}
                    />
                  ) : (
                    <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-20 text-center flex flex-col items-center">
                      <Users className="w-16 h-16 text-slate-200 mb-4" />
                      <h3 className="text-lg font-bold text-slate-700">Aguardando Equipe</h3>
                      <p className="text-slate-500 max-w-xs mb-6">Para iniciar a programação semanal, cadastre os técnicos na aba Equipes & Turnos ou importe uma planilha.</p>
                      <button
                        onClick={() => setActiveView('teams')}
                        className="px-6 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm"
                      >
                        Cadastrar Equipe
                      </button>
                    </div>
                  )}
                </div>
              )}

              {activeView === 'orders' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-xl text-sm font-bold border border-blue-100">
                        <ClipboardList className="w-4 h-4" />
                        {filteredOrders.length} OS Listadas
                      </div>
                      <select
                        className="px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:outline-none"
                        value={filterDiscipline}
                        onChange={e => setFilterDiscipline(e.target.value)}
                      >
                        <option value="All">Todas Disciplinas</option>
                        {Object.values(Discipline).map(d => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedOS(undefined);
                        setIsOSModalOpen(true);
                      }}
                      className="flex items-center gap-2 bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all"
                    >
                      <Plus className="w-4 h-4" />
                      Criar Nova OS
                    </button>
                  </div>
                  <WorkOrderList
                    orders={filteredOrders}
                    technicians={technicians}
                    onEdit={handleEditOS}
                    isLoading={isLoading}
                  />
                </div>
              )}

              {activeView === 'teams' && (
                <TeamManagement
                  technicians={filteredTechnicians}
                  orders={orders}
                  isLoading={isLoading}
                  onAddTechnician={() => {
                    setSelectedTech(undefined);
                    setIsTechModalOpen(true);
                  }}
                  onEditTechnician={handleEditTechnician}
                  onDeleteTechnician={handleDeleteTechnician}
                />
              )}

              {activeView === 'shutdowns' && (
                <ShutdownManagement
                  shutdowns={shutdowns}
                  onAdd={() => alert('Abrir modal de parada em desenvolvimento')}
                />
              )}

              {activeView === 'assets' && (
                <AssetManagement
                  assets={assets}
                  onAdd={() => {
                    setSelectedAsset(undefined);
                    setIsAssetModalOpen(true);
                  }}
                />
              )}
            </>
          )}
        </div>
      </main>

      {/* Refined Toast Notification System */}
      {toast && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 z-[100] animate-in slide-in-from-bottom-6 fade-in duration-500">
          <div className={`px-8 py-4 rounded-3xl shadow-2xl flex items-center gap-4 backdrop-blur-xl border ${toast.type === 'success'
            ? 'bg-emerald-600/90 text-white border-emerald-400/40'
            : 'bg-red-600/90 text-white border-red-400/40'
            }`}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              {toast.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-bold tracking-tight">{toast.message}</span>
              <span className="text-[10px] opacity-70 font-medium">PCM SWM Industrial</span>
            </div>
            <button
              onClick={() => setToast(null)}
              className="ml-4 hover:bg-white/20 p-2 rounded-full transition-colors shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modals */}
      {isOSModalOpen && (
        <OSForm
          os={selectedOS}
          technicians={technicians}
          onClose={() => setIsOSModalOpen(false)}
          onSave={handleSaveOS}
        />
      )}

      {isTechModalOpen && (
        <TechnicianForm
          technician={selectedTech}
          onClose={() => setIsTechModalOpen(false)}
          onSave={handleSaveTechnician}
        />
      )}

      {isAssetModalOpen && (
        <AssetForm
          asset={selectedAsset}
          onClose={() => setIsAssetModalOpen(false)}
          onSave={handleSaveAsset}
        />
      )}

      {isImportInfoOpen && (
        <ImportInfoModal
          onClose={() => setIsImportInfoOpen(false)}
          onProceed={handleProceedWithImport}
        />
      )}
    </div>
  );
};

export default App;
