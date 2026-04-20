"use client";

import { useToast } from "@/components/ToastProvider";
import {
  Moon,
  Bell,
  ArrowLeft,
  Download,
  Eye,
  Store,
  DollarSign,
  Pointer,
  MoveUp,
  Plus,
  Minus,
  Edit2,
  X,
  Save,
  Database,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { getPlaces, createPlace, updatePlace, deletePlace } from "@/app/actions";
import { Place } from "@prisma/client";

export default function AdminDashboardPage() {
  const { showToast } = useToast();
  const router = useRouter();
  const [places, setPlaces] = useState<Place[]>([]);
  const [placeToDelete, setPlaceToDelete] = useState<Place | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchPlaces = async () => {
    try {
      const data = await getPlaces();
      setPlaces(data);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchPlaces();
  }, []);

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  const handleDeletePlace = async () => {
    if (!placeToDelete) return;
    setIsDeleting(true);
    try {
      await deletePlace(placeToDelete.id);
      showToast("Local excluído com sucesso!");
      setPlaces(places.filter(p => p.id !== placeToDelete.id));
    } catch (e) {
      console.error(e);
      showToast("Erro ao excluir. Pode haver registros dependentes.");
    } finally {
      setIsDeleting(false);
      setPlaceToDelete(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 overflow-hidden relative w-full border-l border-r border-slate-200 dark:border-slate-800">
      {/* Header */}
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.back()}
              className="h-10 w-10 flex shrink-0 items-center justify-center"
            >
              <ArrowLeft
                className="text-slate-600 dark:text-slate-300"
                size={20}
              />
            </button>
            <div>
              <h1 className="text-xl font-bold">Dashboard</h1>
              <div className="flex items-center gap-1 text-xs text-slate-500">
                <Store size={12} />
                <span>Holambra, SP</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleDarkMode}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
            >
              <Moon className="text-slate-600 dark:text-slate-300" size={18} />
            </button>
            <button
              onClick={() => showToast("🔔 Notificações")}
              className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center relative"
            >
              <Bell className="text-slate-600 dark:text-slate-300" size={18} />
              <span className="absolute top-2 right-2 h-2.5 w-2.5 bg-rose-500 rounded-full border-2 border-white dark:border-slate-800"></span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4">
          <div>
            <p className="text-sm font-medium">Olá, Admin 👋</p>
            <p className="text-xs text-slate-500">Hoje, 17 de Abril</p>
          </div>
          <button className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full font-medium flex gap-1 items-center">
            <Download size={14} /> Exportar
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-10 feed-scroll relative">
        {/* Global Action Banner */}
        <div 
           onClick={() => router.push('/admin/import')}
           className="w-full mt-4 mb-4 relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl p-4 cursor-pointer shadow-lg shadow-blue-500/30 transition transform hover:-translate-y-1">
           <div className="relative z-10 flex items-center justify-between">
              <div>
                 <h3 className="text-white font-bold text-lg flex items-center gap-2">
                    <Database size={18} /> Google Places Sync
                 </h3>
                 <p className="text-blue-100 text-xs mt-1 max-w-[200px]">Importe dados oficiais, fotos e avaliações automaticamente.</p>
              </div>
              <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-md shrink-0">
                 <ArrowLeft className="text-white rotate-180" size={20} />
              </div>
           </div>
           {/* Deco */}
           <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
           <div className="absolute -left-6 -bottom-6 w-24 h-24 bg-black/10 rounded-full blur-xl pointer-events-none"></div>
        </div>

        {/* Metrics Grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <MetricCard
            icon={<Eye size={14} />}
            title="Visitantes hoje"
            value="1.284"
            trend="+ 12% vs ontem"
            variant="up"
          />
          <MetricCard
            icon={<Store size={14} />}
            title="Lugares ativos"
            value={places.length.toString()}
            trend="+ novos"
            variant="up"
          />
          <MetricCard
            icon={<DollarSign size={14} />}
            title="Receita mensal"
            value="R$ 4.280"
            trend="- Estável"
            variant="neutral"
          />
          <MetricCard
            icon={<Pointer size={14} />}
            title="Conversão"
            value="3,8%"
            trend="+ 0,5 pp"
            variant="up"
          />
        </div>

        {/* Chart mock */}
        <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-sm">Visitas (7 dias)</h3>
            <span className="text-xs text-orange-500 font-medium">
              Detalhes
            </span>
          </div>
          <div className="flex items-end justify-between h-24 gap-2">
            <ChartBar height="40%" label="S" />
            <ChartBar height="30%" label="T" />
            <ChartBar height="55%" label="Q" />
            <ChartBar height="65%" label="Q" />
            <ChartBar height="80%" label="S" />
            <ChartBar height="100%" label="S" />
            <ChartBar height="70%" label="D" />
          </div>
        </div>

        <div className="flex gap-3 mb-6">
          <button onClick={() => router.push('/admin/add')} className="flex-1 py-3 bg-gradient-to-r from-orange-500 to-green-500 text-white rounded-xl font-medium text-sm shadow-md flex items-center justify-center gap-2 hover:opacity-90 transition-opacity">
            <Plus size={16} /> Novo lugar
          </button>
          <button className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 rounded-xl font-medium text-sm">
            Usuários
          </button>
        </div>

        {/* Recent Places */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm flex items-center gap-2">
              <Store size={16} className="text-orange-500" /> Locais na base
            </h3>
            <span onClick={() => fetchPlaces()} className="text-xs text-orange-500 font-medium cursor-pointer">
              Atualizar
            </span>
          </div>
          <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl overflow-hidden shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr>
                  <th className="py-2 px-3 text-xs font-medium text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    Nome
                  </th>
                  <th className="py-2 px-3 text-xs font-medium text-slate-500 border-b border-slate-200 dark:border-slate-700">
                    Destaque
                  </th>
                  <th className="py-2 px-3 text-xs font-medium text-slate-500 border-b border-slate-200 dark:border-slate-700 text-right">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody>
                {places.length === 0 ? (
                  <tr><td colSpan={3} className="p-4 text-center text-sm text-slate-500">Nenhum local cadastrado</td></tr>
                ) : (
                  places.map((place) => (
                   <tr key={place.id} onClick={() => router.push(`/admin/places/${place.id}`)} className="border-b cursor-pointer border-slate-100 dark:border-slate-800/50 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                     <td className="py-3 px-3 text-sm font-medium flex items-center gap-2">
                       {place.coverImage ? (
                         <div className="h-6 w-6 rounded shrink-0 overflow-hidden bg-slate-100 dark:bg-slate-800">
                           <img src={place.coverImage} className="w-full h-full object-cover" />
                         </div>
                       ) : (
                         <span>{place.emoji}</span>
                       )}
                       <span className="truncate max-w-[120px]">{place.name}</span>
                     </td>
                     <td className="py-3 px-3">
                       <span
                         className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${place.featured ? "bg-green-100 text-green-700 dark:bg-green-900/30" : "bg-slate-100 text-slate-600 dark:bg-slate-800"}`}
                       >
                         {place.featured ? "Sim" : "Não"}
                       </span>
                     </td>
                     <td className="py-3 px-3 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button onClick={(e) => { e.stopPropagation(); router.push(`/place/${place.id}`); }} className="text-slate-400 hover:text-blue-500 transition-colors p-1" title="Visualizar">
                            <Eye size={16} />
                         </button>
                         <button onClick={(e) => { e.stopPropagation(); setPlaceToDelete(place); }} className="text-slate-400 hover:text-red-500 transition-colors p-1" title="Excluir">
                            <Trash2 size={16} />
                         </button>
                       </div>
                     </td>
                   </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {placeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 w-full max-w-sm shadow-xl flex flex-col items-center text-center border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in duration-200">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 text-red-500 flex items-center justify-center mb-4">
              <Trash2 size={24} />
            </div>
            <h3 className="text-lg font-bold mb-2">Excluir Local?</h3>
            <p className="text-sm text-slate-500 mb-6">
              Tem certeza que deseja excluir <strong>{placeToDelete.name}</strong>? Esta ação não poderá ser desfeita.
            </p>
            <div className="flex w-full gap-3">
              <button 
                onClick={() => setPlaceToDelete(null)}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-medium text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition disabled:opacity-50"
              >
                Cancelar
              </button>
              <button 
                onClick={handleDeletePlace}
                disabled={isDeleting}
                className="flex-1 py-2.5 rounded-xl font-medium text-white bg-red-500 hover:bg-red-600 transition shadow-md shadow-red-500/20 disabled:opacity-50 flex justify-center items-center gap-2"
              >
                {isDeleting ? <span className="animate-pulse">Excluindo...</span> : 'Excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ icon, title, value, trend, variant }: any) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 border border-white/20 rounded-2xl p-4 shadow-sm">
      <div className="flex items-center gap-2 text-slate-500 text-xs mb-1">
        {icon} <span>{title}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
      <p
        className={`text-[10px] font-medium mt-1 flex items-center gap-1 ${variant === "up" ? "text-green-600" : "text-amber-600"}`}
      >
        {variant === "up" ? <MoveUp size={10} /> : <Minus size={10} />} {trend}
      </p>
    </div>
  );
}

function ChartBar({ height, label }: any) {
  return (
    <div className="flex-1 flex flex-col items-center gap-2">
      <div
        className="w-full bg-gradient-to-t from-amber-500 to-orange-400 rounded-t-sm"
        style={{ height }}
      ></div>
      <span className="text-[10px] font-medium text-slate-400">{label}</span>
    </div>
  );
}

function TableRow({ name, status, pending }: any) {
  return (
    <tr className="border-b border-slate-100 dark:border-slate-800/50 last:border-0">
      <td className="py-3 px-3 text-sm font-medium">{name}</td>
      <td className="py-3 px-3">
        <span
          className={`inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${pending ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30" : "bg-green-100 text-green-700 dark:bg-green-900/30"}`}
        >
          <span
            className={`h-1.5 w-1.5 rounded-full ${pending ? "bg-amber-500" : "bg-green-500"}`}
          ></span>
          {status}
        </span>
      </td>
    </tr>
  );
}
