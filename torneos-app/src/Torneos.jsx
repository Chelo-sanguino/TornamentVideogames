import { useState, useMemo } from 'react';

// Datos semilla para poblar el listado inicialmente y dar vida a la interfaz
const INITIAL_TORNEOS = [
  { id: 1, nombre: "Copa del Caos", juego: "League of Legends", premio: 5000 },
  { id: 2, nombre: "Valorant Master Series", juego: "Valorant", premio: 15000 },
  { id: 3, nombre: "CS2 Regional Cup", juego: "Counter-Strike 2", premio: 8000 },
  { id: 4, nombre: "Evolution Championship", juego: "Street Fighter 6", premio: 12000 }
];

export default function Torneos({ torneos: externalTorneos, setTorneos: externalSetTorneos, equipos = [] }) {
  // --- Estados Principales ---
  const [internalTorneos, setInternalTorneos] = useState(INITIAL_TORNEOS);
  
  const torneos = externalTorneos || internalTorneos;
  const setTorneos = externalSetTorneos || setInternalSetTorneos;

  const [nombre, setNombre] = useState('');
  const [juego, setJuego] = useState('');
  const [premio, setPremio] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);
  
  // --- Estados de Validación ---
  const [errors, setErrors] = useState({});

  // --- Funciones del Formulario (CRUD) ---
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    const newErrors = {};
    if (!nombre.trim()) newErrors.nombre = "El nombre del torneo es obligatorio";
    if (!juego.trim()) newErrors.juego = "El juego es obligatorio";
    if (!premio || isNaN(premio) || Number(premio) <= 0) {
      newErrors.premio = "El premio debe ser un número positivo mayor a 0";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    setErrors({});
    
    if (editingId !== null) {
      // Modificación (U de CRUD)
      setTorneos(prev => prev.map(torneo => 
        torneo.id === editingId 
          ? { ...torneo, nombre: nombre.trim(), juego: juego.trim(), premio: Number(premio) } 
          : torneo
      ));
      setEditingId(null);
    } else {
      // Alta (C de CRUD)
      const nuevoTorneo = {
        id: Date.now(),
        nombre: nombre.trim(),
        juego: juego.trim(),
        premio: Number(premio)
      };
      setTorneos(prev => [nuevoTorneo, ...prev]);
    }
    
    // Limpieza de campos
    resetForm();
  };

  const handleEdit = (torneo) => {
    setEditingId(torneo.id);
    setNombre(torneo.nombre);
    setJuego(torneo.juego);
    setPremio(torneo.premio);
    setErrors({});
    // Desactivar confirmaciones de borrado abiertas
    setDeleteConfirmationId(null);
  };

  const handleDelete = (id) => {
    // Baja (D de CRUD)
    setTorneos(prev => prev.filter(torneo => torneo.id !== id));
    setDeleteConfirmationId(null);
    if (editingId === id) {
      resetForm();
    }
  };

  const resetForm = () => {
    setNombre('');
    setJuego('');
    setPremio('');
    setEditingId(null);
    setErrors({});
  };

  // --- Búsqueda y Filtrado (R de CRUD) ---
  const filteredTorneos = useMemo(() => {
    return torneos.filter(torneo => 
      torneo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      torneo.juego.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [torneos, searchTerm]);

  // --- Estadísticas en tiempo real ---
  const stats = useMemo(() => {
    const total = torneos.length;
    const totalPrize = torneos.reduce((sum, t) => sum + Number(t.premio), 0);
    
    // Juego más popular
    const gameCounts = {};
    let popularGame = "N/A";
    let maxCount = 0;
    
    torneos.forEach(t => {
      const g = t.juego.trim();
      gameCounts[g] = (gameCounts[g] || 0) + 1;
      if (gameCounts[g] > maxCount) {
        maxCount = gameCounts[g];
        popularGame = g;
      }
    });

    return { total, totalPrize, popularGame };
  }, [torneos]);

  // Helper para asignar colores dinámicos a los badges de los juegos principales
  const getGameColor = (juego) => {
    const game = juego.toLowerCase();
    if (game.includes('league of legends') || game.includes('lol')) {
      return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
    }
    if (game.includes('valorant')) {
      return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
    }
    if (game.includes('counter-strike') || game.includes('cs2') || game.includes('cs:go')) {
      return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
    }
    if (game.includes('street fighter') || game.includes('tekken') || game.includes('smash')) {
      return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
    return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 selection:bg-violet-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- CABECERA --- */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-violet-400 bg-violet-500/10 rounded-full border border-violet-500/20">
                Panel de Control
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-violet-400 via-fuchsia-400 to-indigo-400 bg-clip-text text-transparent">
              Torneos Hub
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Administración ágil de campeonatos en memoria.
            </p>
          </div>
          
          {/* Barra de Búsqueda */}
          <div className="relative w-full md:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              {/* [REPLACEABLE SVG: SearchIcon] */}
              <svg className="h-5 w-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              placeholder="Buscar torneo o juego..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500 transition-all duration-200"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')} 
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
              >
                {/* [REPLACEABLE SVG: XMarkIcon] */}
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </header>

        {/* --- TARJETAS DE ESTADÍSTICAS --- */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          
          {/* Torneos Totales */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Torneos</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {/* [REPLACEABLE SVG: TournamentCupIcon] */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5a2 2 0 10-2 2h2zm0 0h4m-4 0H8m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Bolsa de Premios Acumulada */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Bolsa de Premios</p>
              <h3 className="text-2xl font-bold mt-1 text-emerald-400">
                ${stats.totalPrize.toLocaleString('es-ES')} USD
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              {/* [REPLACEABLE SVG: CashDollarIcon] */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>

          {/* Juego Favorito / Principal */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Juego Estrella</p>
              <h3 className="text-2xl font-bold mt-1 text-indigo-400 truncate max-w-[160px] sm:max-w-[200px]" title={stats.popularGame}>
                {stats.popularGame}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              {/* [REPLACEABLE SVG: GamepadIcon] */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
              </svg>
            </div>
          </div>

        </section>

        {/* --- GRID DE CONTENIDO PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* COLUMNA 1: FORMULARIO */}
          <section className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Gradiente decorativo superior */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-violet-500 via-fuchsia-500 to-indigo-500"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                {editingId !== null ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Editar Torneo
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-violet-400"></span>
                    Nuevo Torneo
                  </>
                )}
              </h2>
              {editingId !== null && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-slate-400 hover:text-slate-200 text-xs flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-md border border-slate-700/60"
                >
                  Cancelar Edición
                </button>
              )}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Campo Nombre del Torneo */}
              <div>
                <label htmlFor="nombre" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nombre del Torneo
                </label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Masters de Primavera"
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.nombre 
                      ? 'border-rose-500/60 focus:ring-rose-500/20' 
                      : 'border-slate-800 focus:ring-violet-500/20 focus:border-violet-500'
                  }`}
                />
                {errors.nombre && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-400"></span>
                    {errors.nombre}
                  </p>
                )}
              </div>

              {/* Campo Juego */}
              <div>
                <label htmlFor="juego" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Juego / Disciplina
                </label>
                <input
                  id="juego"
                  type="text"
                  placeholder="Ej: Valorant, LoL, CS2"
                  value={juego}
                  onChange={(e) => setJuego(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.juego 
                      ? 'border-rose-500/60 focus:ring-rose-500/20' 
                      : 'border-slate-800 focus:ring-violet-500/20 focus:border-violet-500'
                  }`}
                />
                {errors.juego && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-400"></span>
                    {errors.juego}
                  </p>
                )}
              </div>

              {/* Campo Premio */}
              <div>
                <label htmlFor="premio" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Premio (USD)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500 text-sm">
                    $
                  </div>
                  <input
                    id="premio"
                    type="number"
                    min="1"
                    placeholder="Ej: 5000"
                    value={premio}
                    onChange={(e) => setPremio(e.target.value)}
                    className={`w-full bg-slate-950 border rounded-xl pl-7 pr-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                      errors.premio 
                        ? 'border-rose-500/60 focus:ring-rose-500/20' 
                        : 'border-slate-800 focus:ring-violet-500/20 focus:border-violet-500'
                    }`}
                  />
                </div>
                {errors.premio && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-400"></span>
                    {errors.premio}
                  </p>
                )}
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-lg transition-all duration-200 transform active:scale-[0.98] ${
                  editingId !== null
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/25'
                    : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 shadow-violet-950/20'
                }`}
              >
                {editingId !== null ? 'Guardar Cambios' : 'Crear Torneo'}
              </button>

            </form>
          </section>

          {/* COLUMNA 2-3: LISTADO DE TORNEOS */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>Lista de Torneos</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-medium border border-slate-700/40">
                  {filteredTorneos.length}
                </span>
              </h2>
              {searchTerm && (
                <span className="text-xs text-slate-400 italic">
                  Filtrado por: "{searchTerm}"
                </span>
              )}
            </div>

            {/* Listado en Grid de Tarjetas */}
            {filteredTorneos.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-slate-600 mb-4">
                  {/* [REPLACEABLE SVG: InboxEmptyIcon] */}
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586 3.586a2 2 0 01-2.828 0L12 14m0 0l-3.586 3.586a2 2 0 01-2.828 0L2 14" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-slate-300">No se encontraron torneos</h4>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">
                  {searchTerm 
                    ? "Intenta modificar los términos de tu búsqueda o limpia el filtro actual." 
                    : "Comienza registrando un nuevo torneo en el formulario lateral."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredTorneos.map((torneo) => {
                  const isDeleting = deleteConfirmationId === torneo.id;
                  const isEditingThis = editingId === torneo.id;
                  const hasTeams = equipos.some(e => e.torneoId === torneo.id);

                  return (
                    <article 
                      key={torneo.id}
                      className={`relative bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between shadow-md transition-all duration-300 ${
                        isEditingThis 
                          ? 'border-amber-500/50 bg-slate-900/80 shadow-amber-900/5 scale-[1.01]' 
                          : 'border-slate-800 hover:border-slate-700/80 hover:shadow-slate-950/20'
                      }`}
                    >
                      {/* Destacar el item que se está editando */}
                      {isEditingThis && (
                        <span className="absolute top-3 right-3 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20 uppercase tracking-wider animate-pulse">
                          Editando
                        </span>
                      )}

                      <div className="space-y-3">
                        <div className="flex items-start justify-between">
                          {/* Badge del Juego */}
                          <span className={`px-2.5 py-0.5 text-xs font-semibold rounded-md border ${getGameColor(torneo.juego)}`}>
                            {torneo.juego}
                          </span>
                          
                          {/* Premio destacado */}
                          <span className="text-emerald-400 font-extrabold text-sm sm:text-base">
                            ${torneo.premio.toLocaleString('es-ES')} USD
                          </span>
                        </div>

                        <div>
                          <h3 className="text-lg font-bold text-slate-100 group-hover:text-violet-400 transition-colors duration-200 leading-tight">
                            {torneo.nombre}
                          </h3>
                        </div>
                      </div>

                      {/* --- ACCIONES EN TARJETA --- */}
                      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end">
                        
                        {/* Estado Normal */}
                        {!isDeleting ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(torneo)}
                              className="text-slate-400 hover:text-amber-400 p-2 hover:bg-amber-400/5 rounded-lg border border-transparent hover:border-amber-500/20 transition-all duration-200"
                              title="Editar Torneo"
                            >
                              {/* [REPLACEABLE SVG: PencilIcon] */}
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmationId(torneo.id)}
                              className="text-slate-400 hover:text-rose-400 p-2 hover:bg-rose-400/5 rounded-lg border border-transparent hover:border-rose-500/20 transition-all duration-200"
                              title="Eliminar Torneo"
                            >
                              {/* [REPLACEABLE SVG: TrashIcon] */}
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
                          </div>
                        ) : hasTeams ? (
                          
                          <div className="flex items-center justify-between gap-3 bg-slate-950/80 p-2.5 rounded-xl border border-amber-500/30 animate-fadeIn text-xs max-w-full">
                            <div className="flex items-center gap-1.5 text-amber-400 font-medium">
                              <span>⚠️</span>
                              <span className="leading-tight">Tiene equipos inscritos. Elimínalos primero.</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmationId(null)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] px-2.5 py-1 rounded-md transition-all duration-200 uppercase tracking-wider shrink-0"
                            >
                              Cerrar
                            </button>
                          </div>

                        ) : (
                          
                          <div className="flex items-center gap-2 bg-slate-950/60 p-1.5 rounded-xl border border-rose-500/20 animate-fadeIn">
                            {/* Estado Confirmar Borrado */}
                            <span className="text-[11px] font-semibold text-rose-400 px-2 uppercase tracking-wide">
                              ¿Eliminar?
                            </span>
                            <button
                              type="button"
                              onClick={() => handleDelete(torneo.id)}
                              className="bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs px-2.5 py-1 rounded-md shadow-sm transition-all duration-200"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmationId(null)}
                              className="bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-1 rounded-md transition-all duration-200"
                            >
                              No
                            </button>
                          </div>

                        )}

                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>

        </div>
        
      </div>
    </div>
  );
}
