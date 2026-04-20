"use client";

import { useToast } from "@/components/ToastProvider";
import {
  Moon,
  Settings,
  ArrowLeft,
  Camera,
  CheckCircle,
  Star,
  Heart,
  Medal,
  Flag,
  Image as ImageIcon,
  ChevronRight,
  Bell,
  Shield,
  HelpCircle,
  Crown,
} from "lucide-react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { showToast } = useToast();
  const router = useRouter();

  const toggleDarkMode = () => {
    document.documentElement.classList.toggle("dark");
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <header className="px-5 pt-6 pb-2 flex items-center justify-between bg-white/80 dark:bg-slate-900/80 backdrop-blur-md z-10 shrink-0">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center"
          >
            <ArrowLeft
              className="text-slate-600 dark:text-slate-300"
              size={18}
            />
          </button>
          <h1 className="text-xl font-bold">Perfil</h1>
        </div>
        <div className="flex gap-3">
          <button onClick={toggleDarkMode}>
            <Moon className="text-slate-600 dark:text-slate-300" size={18} />
          </button>
          <button onClick={() => showToast("⚙️ Configurações em breve")}>
            <Settings
              className="text-slate-600 dark:text-slate-300"
              size={18}
            />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pb-24 feed-scroll px-5">
        {/* Profile Info */}
        <div className="flex flex-col items-center mt-4 mb-6">
          <div className="relative">
            <div className="h-28 w-28 rounded-full bg-gradient-to-br from-orange-500 to-green-500 p-1 shadow-xl">
              <div className="h-full w-full rounded-full bg-white dark:bg-slate-800 flex items-center justify-center text-5xl">
                👩🏻‍🌾
              </div>
            </div>
            <button className="absolute bottom-0 right-0 h-9 w-9 rounded-full bg-white dark:bg-slate-700 shadow-md flex items-center justify-center border-2 border-white dark:border-slate-600 cursor-pointer">
              <Camera className="text-orange-500" size={14} />
            </button>
          </div>
          <h2 className="text-2xl font-bold mt-3">Ana Flores</h2>
          <div className="flex items-center gap-2 mt-1">
            <span className="bg-orange-100 dark:bg-orange-950/30 text-orange-700 dark:text-orange-300 text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
              🌱 Exploradora Nível 3
            </span>
            <span className="bg-green-100 dark:bg-green-950/30 text-green-700 dark:text-green-300 text-xs px-3 py-1 rounded-full">
              🌻 Holambra
            </span>
          </div>

          <div className="w-full mt-5">
            <div className="flex justify-between text-xs font-medium mb-1">
              <span>🌟 1.240 / 1.800 XP</span>
              <span className="text-orange-500 font-bold">
                Próximo nível: 4
              </span>
            </div>
            <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-20 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-green-500 rounded-20"
                style={{ width: "69%" }}
              ></div>
            </div>
            <p className="text-[10px] text-slate-400 mt-1 text-right">
              Faltam 560 XP
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-6">
          <StatCard
            icon={<CheckCircle className="text-orange-500" size={24} />}
            value="48"
            label="Check-ins"
          />
          <StatCard
            icon={<Star className="text-amber-400" size={24} />}
            value="23"
            label="Avaliações"
          />
          <StatCard
            icon={<Heart className="text-rose-500" size={24} />}
            value="12"
            label="Favoritos"
          />
        </div>

        {/* Badges */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Medal className="text-amber-500" size={18} /> Conquistas
            </h3>
          </div>
          <div className="flex gap-3 overflow-x-auto scroll-x pb-2 hide-scroll">
            <Badge
              icon="🌷"
              name="Tulipa de Ouro"
              desc="10 check-ins"
              gradient="from-amber-400 to-orange-500"
            />
            <Badge
              icon="🌻"
              name="Girassol"
              desc="5 fotos"
              gradient="from-green-400 to-emerald-500"
            />
            <Badge
              icon="🇳🇱"
              name="Holandês"
              desc="1º mês"
              gradient="from-blue-400 to-indigo-500"
            />
            <div className="flex-shrink-0 w-24 bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/30 rounded-2xl p-3 flex flex-col items-center opacity-60">
              <div className="h-12 w-12 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-white text-xl shadow-md">
                🔒
              </div>
              <span className="text-xs font-semibold mt-2 text-center">
                Moinho
              </span>
              <span className="text-[9px] text-slate-400">20 check-ins</span>
            </div>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="mb-6">
          <h3 className="font-bold text-lg mb-3">📋 Atividade recente</h3>
          <div className="space-y-3">
            <ActivityItem
              icon={<CheckCircle size={16} />}
              bg="bg-amber-100 dark:bg-amber-900/30 text-amber-600"
              title="Check-in no Moinho Povos Unidos"
              time="Há 2 horas • +15 XP"
            />
            <ActivityItem
              icon={<Star size={16} />}
              bg="bg-rose-100 dark:bg-rose-900/30 text-rose-500"
              title="Avaliou Bloemen Park com 5⭐"
              time="Ontem • +10 XP"
            />
            <ActivityItem
              icon={<ImageIcon size={16} />}
              bg="bg-blue-100 dark:bg-blue-900/30 text-blue-600"
              title="Adicionou foto no Boulevard"
              time="2 dias atrás • +20 XP"
            />
          </div>
        </div>

        {/* Options */}
        <div className="space-y-2 mb-6">
          <OptionItem
            icon={<Settings className="text-orange-500" size={18} />}
            label="Editar perfil"
          />
          <OptionItem
            icon={<Bell className="text-orange-500" size={18} />}
            label="Notificações"
          />
          <OptionItem
            icon={<Shield className="text-orange-500" size={18} />}
            label="Privacidade"
          />
        </div>

        {/* Demo Links (App Navigation) */}
        <div className="space-y-2 mb-6">
          <h3 className="font-bold text-lg mb-2">Simulações do App</h3>
          <OptionItem
            icon={<Settings size={18} />}
            label="Dashboard Admin Geral"
            href="/admin"
          />
          <OptionItem
            icon={<Star size={18} />}
            label="Planos & Preços (Business)"
            href="/pricing"
          />
          <OptionItem
            icon={<Crown size={18} />}
            label="Dashboard Premium (Café)"
            href="/premium/dashboard"
          />
          <OptionItem
            icon={<ImageIcon size={18} />}
            label="Visão do Cliente (Café Premium)"
            href="/premium/cafe"
          />
        </div>

        <button className="w-full py-4 rounded-xl bg-slate-100 dark:bg-slate-800 text-rose-500 font-medium text-sm mb-4 active:scale-[0.98] transition-transform">
          Sair da conta
        </button>
      </div>
    </div>
  );
}

function StatCard({ icon, value, label }: any) {
  return (
    <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-xl border border-white/30 rounded-2xl p-3 text-center shadow-sm">
      <div className="flex justify-center mb-1">{icon}</div>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}

function Badge({ icon, name, desc, gradient }: any) {
  return (
    <div className="flex-shrink-0 w-24 bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/30 rounded-2xl p-3 flex flex-col items-center">
      <div
        className={`h-12 w-12 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white text-xl shadow-md`}
      >
        {icon}
      </div>
      <span className="text-xs font-semibold mt-2 text-center">{name}</span>
      <span className="text-[9px] text-slate-400">{desc}</span>
    </div>
  );
}

function ActivityItem({ icon, bg, title, time }: any) {
  return (
    <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/30 rounded-xl p-3 shadow-sm">
      <div
        className={`h-10 w-10 min-w-10 rounded-full flex items-center justify-center ${bg}`}
      >
        {icon}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium">{title}</p>
        <p className="text-xs text-slate-400">{time}</p>
      </div>
    </div>
  );
}

function OptionItem({ icon, label, href }: any) {
  const router = useRouter();

  return (
    <div
      onClick={() => href && router.push(href)}
      className="bg-white/70 dark:bg-slate-800/70 backdrop-blur border border-white/30 rounded-xl p-4 flex items-center justify-between cursor-pointer"
    >
      <span className="font-medium flex items-center gap-3">
        {icon}
        {label}
      </span>
      <ChevronRight className="text-slate-400" size={16} />
    </div>
  );
}
