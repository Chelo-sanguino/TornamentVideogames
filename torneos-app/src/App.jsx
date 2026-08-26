import { useState } from 'react';
import Torneos from './Torneos';
import Equipos from './Equipos';

// Datos Semilla Globales para Sincronización e Interacción Inmediata
const INITIAL_TORNEOS = [
  { id: 1, nombre: "Copa del Caos", juego: "League of Legends", premio: 5000 },
  { id: 2, nombre: "Valorant Master Series", juego: "Valorant", premio: 15000 },
  { id: 3, nombre: "CS2 Regional Cup", juego: "Counter-Strike 2", premio: 8000 },
  { id: 4, nombre: "Evolution Championship", juego: "Street Fighter 6", premio: 12000 }
];

const INITIAL_EQUIPOS = [
  { id: 1, nombreEquipo: "Sentinels", capitan: "TenZ", torneoId: 2 },
  { id: 2, nombreEquipo: "T1", capitan: "Faker", torneoId: 1 },
  { id: 3, nombreEquipo: "Natus Vincere", capitan: "s1mple", torneoId: 3 },
  { id: 4, nombreEquipo: "Team Liquid", capitan: "Hungrybox", torneoId: 4 }
];

function App() {
  const [torneos, setTorneos] = useState(INITIAL_TORNEOS);
  const [equipos, setEquipos] = useState(INITIAL_EQUIPOS);
  const [activeTab, setActiveTab] = useState('torneos');

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Barra de Navegación Premium */}
      <nav className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-gradient-to-tr from-violet-600 to-fuchsia-600 flex items-center justify-center font-extrabold text-white text-lg tracking-tighter shadow-lg shadow-violet-500/10">
              T
            </div>
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
              TournamentHub
            </span>
          </div>

          {/* Sistema de Pestañas */}
          <div className="flex bg-slate-900/60 p-1 rounded-xl border border-slate-800/80">
            <button
              onClick={() => setActiveTab('torneos')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === 'torneos'
                  ? 'bg-violet-600 text-white shadow-md shadow-violet-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* [REPLACEABLE SVG: TabCupIcon] */}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Torneos
            </button>
            <button
              onClick={() => setActiveTab('equipos')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all duration-300 ${
                activeTab === 'equipos'
                  ? 'bg-fuchsia-600 text-white shadow-md shadow-fuchsia-950/50'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {/* [REPLACEABLE SVG: TabGroupIcon] */}
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              Equipos
            </button>
          </div>
        </div>
      </nav>

      {/* Área de Contenido Dinámico */}
      <main className="flex-grow">
        {activeTab === 'torneos' ? (
          <Torneos torneos={torneos} setTorneos={setTorneos} equipos={equipos} />
        ) : (
          <Equipos torneos={torneos} equipos={equipos} setEquipos={setEquipos} />
        )}
      </main>
    </div>
  );
}

export default App;
