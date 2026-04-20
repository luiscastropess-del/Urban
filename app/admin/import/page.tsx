'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Search, MapPin, Star, Check, AlertCircle, Loader2, RefreshCw } from 'lucide-react'; // NOVO: import RefreshCw
import { useToast } from '@/components/ToastProvider';

interface GooglePlace {
  id: string;
  displayName: { text: string };
  primaryTypeDisplayName?: { text: string };
  formattedAddress?: string;
  rating?: number;
  userRatingCount?: number;
  photos?: { name: string }[];
  alreadyImported?: boolean;
}

export default function ImportPlacesPage() {
  const { showToast } = useToast();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState('');
  const [places, setPlaces] = useState<GooglePlace[]>([]);
  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [isReimporting, setIsReimporting] = useState<string | null>(null); // NOVO: estado para reimport

  const searchPlaces = useCallback(async () => {
    if (!searchQuery.trim()) {
      showToast('Digite algo para buscar');
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/search-places?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      if (data.error) {
        showToast(`Erro: ${data.error}`);
      } else {
        setPlaces(data.places || []);
        setSelectedPlaces(new Set());
      }
    } catch (e) {
      showToast('Erro de conexão');
    } finally {
      setLoading(false);
    }
  }, [searchQuery, showToast]);

  const toggleSelect = (placeId: string) => {
    const newSet = new Set(selectedPlaces);
    if (newSet.has(placeId)) {
      newSet.delete(placeId);
    } else {
      newSet.add(placeId);
    }
    setSelectedPlaces(newSet);
  };

  const toggleSelectAll = () => {
    if (selectedPlaces.size === places.filter(p => !p.alreadyImported).length) {
      setSelectedPlaces(new Set());
    } else {
      const toSelect = places.filter(p => !p.alreadyImported).map(p => p.id);
      setSelectedPlaces(new Set(toSelect));
    }
  };

  const importSelected = async () => {
    if (selectedPlaces.size === 0) {
      showToast('Nenhum lugar selecionado');
      return;
    }
    setImporting(true);
    setProgress({ current: 0, total: selectedPlaces.size });

    const ids = Array.from(selectedPlaces);
    for (let i = 0; i < ids.length; i++) {
      try {
        const res = await fetch('/api/admin/import-single', {
          method: 'POST',
          body: JSON.stringify({ placeId: ids[i] }),
        });
        const data = await res.json();
        if (!data.error) {
          showToast(`✅ Importado: ${data.place.name}`);
        } else {
          showToast(`❌ Falha ao importar: ${data.error}`);
        }
      } catch (e) {
        showToast(`❌ Erro de rede ao importar`);
      }
      setProgress({ current: i + 1, total: ids.length });
    }
    setImporting(false);
    setSelectedPlaces(new Set());
    searchPlaces(); // recarrega lista para atualizar status "já importado"
  };

  // NOVO: função para reimportar um lugar existente
  const handleReimport = async (placeId: string, placeName: string) => {
    if (!confirm(`Isso irá sobrescrever os dados atuais de "${placeName}" com as informações mais recentes do Google. Continuar?`)) {
      return;
    }
    setIsReimporting(placeId);
    try {
      const res = await fetch('/api/admin/reimport-single', {
        method: 'POST',
        body: JSON.stringify({ placeId }),
      });
      const data = await res.json();
      if (data.error) {
        showToast(`❌ Erro ao reimportar: ${data.error}`);
      } else {
        showToast(`✅ "${placeName}" foi atualizado com sucesso!`);
        searchPlaces(); // opcional: recarregar para refletir alterações
      }
    } catch (e) {
      showToast('❌ Erro interno de conexão');
    } finally {
      setIsReimporting(null);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Importar Lugares do Google</h1>

      {/* Barra de busca */}
      <div className="flex gap-2 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && searchPlaces()}
            placeholder="Ex: Cafés em Holambra"
            className="w-full pl-10 pr-4 py-3 border rounded-xl"
          />
        </div>
        <button
          onClick={searchPlaces}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
          Buscar
        </button>
      </div>

      {/* Progresso da importação */}
      {importing && (
        <div className="mb-4 p-4 bg-blue-50 rounded-xl">
          <p className="font-medium">Importando... {progress.current}/{progress.total}</p>
          <div className="w-full h-2 bg-blue-200 rounded-full mt-2">
            <div
              className="h-full bg-blue-600 rounded-full transition-all"
              style={{ width: `${(progress.current / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Lista de lugares */}
      {places.length > 0 && (
        <>
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm text-slate-500">{places.length} lugares encontrados</p>
            <button
              onClick={toggleSelectAll}
              className="text-sm text-blue-600 font-medium"
              disabled={importing}
            >
              {selectedPlaces.size === places.filter(p => !p.alreadyImported).length ? 'Desmarcar todos' : 'Selecionar todos'}
            </button>
          </div>

          <div className="space-y-3 mb-6">
            {places.map(place => (
              <div
                key={place.id}
                className={`border rounded-xl p-4 flex items-start gap-3 ${
                  place.alreadyImported ? 'bg-green-50 border-green-200' : 'bg-white'
                }`}
              >
                <input
                  type="checkbox"
                  checked={selectedPlaces.has(place.id)}
                  onChange={() => toggleSelect(place.id)}
                  disabled={place.alreadyImported || importing}
                  className="mt-1 w-4 h-4 accent-blue-600"
                />
                <div className="flex-1">
                  <h3 className="font-bold text-lg">{place.displayName.text}</h3>
                  <p className="text-sm text-slate-600 flex items-center gap-1">
                    <MapPin size={14} /> {place.formattedAddress || 'Endereço não disponível'}
                  </p>
                  {place.rating && (
                    <p className="text-sm flex items-center gap-1 mt-1">
                      <Star size={14} className="fill-amber-400 text-amber-400" />
                      {place.rating} ({place.userRatingCount} avaliações)
                    </p>
                  )}
                  <p className="text-xs text-slate-500 mt-1">{place.primaryTypeDisplayName?.text}</p>
                </div>
                <div className="flex items-center gap-2">
                  {place.alreadyImported ? (
                    <>
                      <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full flex items-center gap-1">
                        <Check size={12} /> Importado
                      </span>
                      {/* NOVO: Botão Re-importar */}
                      <button
                        onClick={() => handleReimport(place.id, place.displayName.text)}
                        disabled={isReimporting === place.id}
                        className="text-xs bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded-full disabled:opacity-50 flex items-center gap-1"
                      >
                        {isReimporting === place.id ? (
                          <>
                            <Loader2 size={12} className="animate-spin" /> Atualizando...
                          </>
                        ) : (
                          <>
                            <RefreshCw size={12} /> Re-importar
                          </>
                        )}
                      </button>
                    </>
                  ) : (
                    <span className="text-xs text-slate-400">Não importado</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Botão de importar selecionados */}
          {selectedPlaces.size > 0 && !importing && (
            <button
              onClick={importSelected}
              className="w-full bg-green-600 text-white py-3 rounded-xl font-medium hover:bg-green-700 flex items-center justify-center gap-2"
            >
              <Check size={18} />
              Importar {selectedPlaces.size} lugar(es) selecionado(s)
            </button>
          )}
        </>
      )}

      {/* Estado vazio */}
      {!loading && places.length === 0 && (
        <div className="text-center py-12">
          <AlertCircle className="mx-auto text-slate-400 mb-2" size={32} />
          <p className="text-slate-500">Nenhum lugar encontrado. Faça uma busca.</p>
        </div>
      )}
    </div>
  );
}
