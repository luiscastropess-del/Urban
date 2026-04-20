"use client";

import { useToast } from "@/components/ToastProvider";
import {
  Compass,
  Moon,
  Bell,
  Search,
  SlidersHorizontal,
  MapPin,
  ChevronDown,
  RotateCcw,
  Heart,
  Star,
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getPlaces } from "@/app/actions";
import { Place } from "@prisma/client";

export default function ExplorePage() {
  const { showToast } = useToast();
  const [view, setView] = useState<"map" | "list">("map");
  const [places, setPlaces] = useState<Place[]>([]);
  const [currentCity, setCurrentCity] = useState("Holambra");
  const [currentState, setCurrentState] = useState("SP");
  const [showCitySelector, setShowCitySelector] = useState(false);
  const [tempCity, setTempCity] = useState("");
  const [tempState, setTempState] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todos");

  useEffect(() => {
    getPlaces().then(setPlaces).catch(console.error);
    
    // Push the state setters to the end of the execution stack to avoid React warning
    setTimeout(() => {
      // Check if location is already saved in localStorage
      const savedCity = localStorage.getItem('userCity');
      const savedState = localStorage.getItem('userState');
      
      if (savedCity && savedState) {
        setCurrentCity(savedCity);
        setCurrentState(savedState);
      } else {
        // Auto-detect location on first load without heavy blocking
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;
              try {
                const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
                const data = await res.json();
                if (data && data.address) {
                  const city = data.address.city || data.address.town || data.address.village || 'Sua Cidade';
                  const state = data.address.state || 'UF';
                  
                  setCurrentCity(city);
                  setCurrentState(state);
                  localStorage.setItem('userCity', city);
                  localStorage.setItem('userState', state);
                  showToast(`📍 Detectamos que você está em ${city}, ${state}`);
                }
              } catch (e) {
                // Silently fail on auto-detect network error to not annoy user
              }
            },
            (error) => {
              // Silently fail if blocked automatically
            }
          );
        }
      }
    }, 0);
  }, [showToast]);

  const getUserLocation = () => {
    if (navigator.geolocation) {
      showToast('📍 Detectando sua localização...');
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`);
            const data = await res.json();
            if (data && data.address) {
              const city = data.address.city || data.address.town || data.address.village || 'Sua Cidade';
              const state = data.address.state || 'UF';
              setCurrentCity(city);
              setCurrentState(state);
              localStorage.setItem('userCity', city);
              localStorage.setItem('userState', state);
              showToast(`✅ Localização atualizada para ${city}, ${state}`);
              setShowCitySelector(false);
            }
          } catch (e) {
            showToast('⚠️ Erro ao obter nome da cidade.');
          }
        },
        (error) => {
          showToast('⚠️ Erro ao obter localização. Permissão negada.');
        }
      );
    } else {
      showToast('⚠️ Geolocalização não suportada neste dispositivo.');
    }
  };

  const filteredPlaces = places.filter(p => {
    // 1. Filtro de Cidade (ignora acentos e converte state para UF)
    const ufMap: Record<string, string> = {
      'acre': 'AC', 'alagoas': 'AL', 'amapá': 'AP', 'amazonas': 'AM', 'bahia': 'BA', 'ceará': 'CE',
      'distrito federal': 'DF', 'espírito santo': 'ES', 'goiás': 'GO', 'maranhão': 'MA', 'mato grosso': 'MT',
      'mato grosso do sul': 'MS', 'minas gerais': 'MG', 'pará': 'PA', 'paraíba': 'PB', 'paraná': 'PR',
      'pernambuco': 'PE', 'piauí': 'PI', 'rio de janeiro': 'RJ', 'rio grande do norte': 'RN',
      'rio grande do sul': 'RS', 'rondônia': 'RO', 'roraima': 'RR', 'santa catarina': 'SC',
      'são paulo': 'SP', 'sergipe': 'SE', 'tocantins': 'TO'
    };

    const getUF = (stateStr: string) => {
      const normalized = stateStr.toLowerCase().trim();
      return ufMap[normalized] ? ufMap[normalized] : (normalized.length === 2 ? normalized.toUpperCase() : stateStr.toUpperCase());
    };

    const normalizeText = (text: string) => text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().trim();

    const c = p.city || 'Holambra';
    const s = p.state || 'SP';
    
    // Check if lengths and texts match after removing accents and translating states to UF (e.g. "São Paulo" -> "SP")
    const matchCity = normalizeText(c) === normalizeText(currentCity) && getUF(s) === getUF(currentState);

    // 2. Filtro de Busca por Texto
    let matchSearch = true;
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      matchSearch = Boolean(
        p.name.toLowerCase().includes(search) || 
        (p.type && p.type.toLowerCase().includes(search)) || 
        (p.description && p.description.toLowerCase().includes(search)) ||
        (p.tags && p.tags.toLowerCase().includes(search))
      );
    }

    // 3. Filtro de Categoria
    let matchCategory = true;
    if (selectedCategory !== "Todos") {
      const type = p.type.toLowerCase();
      if (selectedCategory === "Gastronomia") {
        matchCategory = ['café', 'cafe', 'restaurante', 'bar', 'padaria', 'sorveteria', 'gastronomia'].includes(type);
      } else if (selectedCategory === "Parques & Campos") {
        matchCategory = ['parque', 'campo', 'campos', 'jardim', 'natureza'].includes(type);
      } else if (selectedCategory === "Cultura & Museus") {
        matchCategory = ['museu', 'cultura', 'moinho', 'história'].includes(type);
      } else if (selectedCategory === "Hospedagem") {
        matchCategory = ['hotel', 'pousada', 'chalé', 'hospedagem'].includes(type);
      } else {
        matchCategory = type.includes(selectedCategory.toLowerCase());
      }
    }

    return matchCity && matchSearch && matchCategory;
  });

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Modal de Cidade */}
      {showCitySelector && (
        <div className="absolute inset-0 bg-black/60 z-50 flex items-center justify-center p-5">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 w-full max-w-sm shadow-2xl animate-in zoom-in-95">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800 dark:text-white"><MapPin size={20} className="text-orange-500" /> Escolha sua cidade</h3>
            <div className="space-y-4">
              <button onClick={getUserLocation} className="w-full bg-orange-50 dark:bg-orange-900/30 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold hover:bg-orange-100 dark:hover:bg-orange-900/50 transition cursor-pointer text-orange-700 dark:text-orange-300">
                 <div className="bg-orange-200 dark:bg-orange-700/50 text-orange-600 dark:text-orange-300 rounded-full p-2"><MapPin size={18}/></div>
                 Usar minha localização atual
              </button>
              
              <div className="relative flex items-center gap-3">
                 <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
                 <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">ou digite</span>
                 <div className="h-px bg-slate-200 dark:bg-slate-800 flex-1"></div>
              </div>

              <div className="flex gap-3">
                <input type="text" placeholder="Nome da Cidade" value={tempCity} onChange={e => setTempCity(e.target.value)} className="flex-1 bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3.5 text-sm focus:ring-2 focus:ring-orange-500/50 outline-none" />
                <input type="text" placeholder="UF" value={tempState} onChange={e => setTempState(e.target.value)} maxLength={2} className="w-[70px] bg-slate-100 dark:bg-slate-800 border-0 rounded-xl p-3.5 text-sm uppercase focus:ring-2 focus:ring-orange-500/50 outline-none text-center" />
              </div>

              <div className="flex gap-3 pt-4">
                <button onClick={() => setShowCitySelector(false)} className="flex-1 py-3.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-xl transition hover:opacity-80">Cancelar</button>
                <button onClick={() => {
                  if(tempCity && tempState) {
                    setCurrentCity(tempCity);
                    setCurrentState(tempState.toUpperCase());
                    localStorage.setItem('userCity', tempCity);
                    localStorage.setItem('userState', tempState.toUpperCase());
                    setShowCitySelector(false);
                    showToast('✅ Cidade alterada');
                  } else {
                    showToast('⚠️ Preencha cidade e estado');
                  }
                }} className="flex-1 py-3.5 bg-gradient-to-r from-orange-500 to-green-500 text-white font-bold rounded-xl shadow-lg shadow-orange-500/30 transition hover:opacity-90">Confirmar</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="px-5 pt-6 pb-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-orange-500 to-green-500 flex items-center justify-center shadow-lg">
              <Compass className="text-white relative top-2" size={20} />
            </div>
            <div>
              <div 
                className="flex items-center gap-1 cursor-pointer group"
                onClick={() => {
                  setTempCity(currentCity);
                  setTempState(currentState);
                  setShowCitySelector(true);
                }}
              >
                <MapPin className="text-orange-500" size={14} />
                <span className="text-sm font-semibold group-hover:text-orange-500 transition">{currentCity}, {currentState} 🌷</span>
                <ChevronDown className="text-slate-400 group-hover:text-orange-500 transition" size={12} />
              </div>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Descubra a cidade
              </p>
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

        {/* Search */}
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
            size={18}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar lugares, cafés, campos..."
            className="w-full bg-slate-100 dark:bg-slate-800 border-0 rounded-2xl py-3.5 pl-11 pr-24 text-sm placeholder:text-slate-400 focus:ring-2 focus:ring-orange-500/50 outline-none"
          />
          <button
            onClick={() => showToast("🎛️ Filtros Avançados (Em Breve)")}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white dark:bg-slate-700 shadow-sm rounded-xl px-2 py-1.5 text-xs font-medium flex items-center gap-1"
          >
            <SlidersHorizontal className="text-orange-500" size={14} /> Filtros
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24 feed-scroll">
        {/* Categories */}
        <div className="px-5 pt-3 pb-2">
          <div className="flex gap-2 overflow-x-auto scroll-x hide-scroll">
            {[
              { id: 'Todos', label: '🌷 Todos' },
              { id: 'Parques & Campos', label: '🌻 Parques & Campos' },
              { id: 'Gastronomia', label: '🍽️ Gastronomia' },
              { id: 'Cultura & Museus', label: '🎨 Cultura' },
              { id: 'Hospedagem', label: '🏨 Hospedagem' },
            ].map(cat => (
              <CategoryChip 
                key={cat.id} 
                label={cat.label} 
                active={selectedCategory === cat.id} 
                onClick={() => setSelectedCategory(cat.id)}
              />
            ))}
          </div>
        </div>

        <div className="px-5 mt-2 mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              🔥 Em alta em {currentCity}
            </h3>
            <span className="text-xs text-orange-500 font-medium">
              Ver todos
            </span>
          </div>

          <div className="flex gap-4 overflow-x-auto scroll-x hide-scroll">
            {filteredPlaces.filter(p => p.featured).map(p => (
              <PlaceCard
                key={p.id}
                id={p.id}
                emoji={p.emoji}
                coverImage={p.coverImage}
                name={p.name}
                rating={p.rating}
                reviews={p.reviews}
                distance={p.distance}
              />
            ))}
          </div>
        </div>

        <div className="px-5 mb-6">
          <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
            📍 Perto de você
          </h3>
          <div className="space-y-3">
            {filteredPlaces.filter(p => !p.featured).map(p => (
              <ListCard
                key={p.id}
                id={p.id}
                emoji={p.emoji}
                coverImage={p.coverImage}
                name={p.name}
                type={p.type}
                distance={p.distance}
                rating={p.rating}
              />
            ))}
          </div>
        </div>

        {filteredPlaces.length === 0 && (
          <div className="px-5 text-center mt-8 pb-8 text-slate-500 flex flex-col items-center justify-center">
            <div className="h-16 w-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-3">
               <MapPin size={24} className="text-slate-400" />
            </div>
            <p className="font-bold text-slate-700 dark:text-slate-300">Nada por aqui ainda</p>
            <p className="text-xs mt-1 max-w-[200px] leading-relaxed">Não encontramos estabelecimentos em {currentCity}, {currentState}.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function CategoryChip({
  label,
  active = false,
  onClick
}: {
  label: string;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <span
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap shadow-sm cursor-pointer transition ${active ? "bg-orange-500 text-white" : "bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700"}`}
    >
      {label}
    </span>
  );
}

function PlaceCard({ id, emoji, name, rating, reviews, distance, coverImage }: any) {
  const router = useRouter();
  return (
    <div onClick={() => router.push(`/place/${id}`)} className="flex-shrink-0 w-64 bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-2xl overflow-hidden shadow-sm cursor-pointer transition-transform hover:scale-[1.02]">
      <div className="h-32 bg-gradient-to-br from-amber-200 to-orange-300 flex items-center justify-center text-4xl relative overflow-hidden">
        {coverImage ? (
          <img src={coverImage} className="w-full h-full object-cover absolute inset-0" />
        ) : emoji}
      </div>
      <div className="p-3">
        <div className="flex justify-between items-start">
          <h4 className="font-bold truncate pr-2">{name}</h4>
          <button className="text-slate-400 hover:text-rose-500">
            <Heart size={18} />
          </button>
        </div>
        <div className="flex items-center gap-1 text-sm text-amber-500">
          <Star size={12} className="fill-amber-400" />
          <span>{rating}</span>
          <span className="text-slate-400 text-xs ml-1">({reviews})</span>
        </div>
        <p className="text-xs text-slate-500 mt-1 flex items-center">
          <MapPin size={10} className="mr-1" />
          Centro • {distance}
        </p>
      </div>
    </div>
  );
}

function ListCard({ id, emoji, name, type, distance, rating, coverImage }: any) {
  const router = useRouter();
  return (
    <div onClick={() => router.push(`/place/${id}`)} className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 dark:border-white/10 rounded-xl p-3 flex items-center gap-3 cursor-pointer transition-transform hover:scale-[1.02]">
      <div className="h-14 w-14 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-2xl relative overflow-hidden shrink-0">
        {coverImage ? (
          <img src={coverImage} className="w-full h-full object-cover absolute inset-0" />
        ) : emoji}
      </div>
      <div className="flex-1">
        <h4 className="font-semibold">{name}</h4>
        <p className="text-xs text-slate-500">
          {type} • {distance}
        </p>
        <div className="flex items-center gap-1 text-xs text-amber-500">
          <Star size={10} className="fill-amber-500" /> {rating}
        </div>
      </div>
      <button className="text-slate-400">
        <Heart size={18} />
      </button>
    </div>
  );
}
