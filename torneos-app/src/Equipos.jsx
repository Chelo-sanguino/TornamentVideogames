import { useState, useMemo } from 'react';

// Datos semilla de equipos para poblar el listado inicialmente
const INITIAL_EQUIPOS = [
  { id: 1, nombreEquipo: "Sentinels", capitan: "TenZ", torneoId: 2 },
  { id: 2, nombreEquipo: "T1", capitan: "Faker", torneoId: 1 },
  { id: 3, nombreEquipo: "Natus Vincere", capitan: "s1mple", torneoId: 3 },
  { id: 4, nombreEquipo: "Team Liquid", capitan: "Hungrybox", torneoId: 4 }
];

export default function Equipos({ torneos = [], equipos: externalEquipos, setEquipos: externalSetEquipos }) {
  // --- Estados Principales ---
  const [internalEquipos, setInternalEquipos] = useState(INITIAL_EQUIPOS);
  
  const equipos = externalEquipos || internalEquipos;
  const setEquipos = externalSetEquipos || setInternalEquipos;

  const [nombreEquipo, setNombreEquipo] = useState('');
  const [capitan, setCapitan] = useState('');
  const [torneoId, setTorneoId] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteConfirmationId, setDeleteConfirmationId] = useState(null);

  // --- Estado de Validación ---
  const [errors, setErrors] = useState({});

  // --- Funciones del Formulario (CRUD) ---
  const handleSubmit = (e) => {
    e.preventDefault();

    // Validaciones
    const newErrors = {};
    if (!nombreEquipo.trim()) newErrors.nombreEquipo = "El nombre del equipo es obligatorio";
    if (!capitan.trim()) newErrors.capitan = "El nombre del capitán es obligatorio";
    if (!torneoId) newErrors.torneoId = "Debes seleccionar un torneo";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    const selectedTorneoId = Number(torneoId);

    if (editingId !== null) {
      // Modificación (U de CRUD)
      setEquipos(prev => prev.map(equipo => 
        equipo.id === editingId 
          ? { ...equipo, nombreEquipo: nombreEquipo.trim(), capitan: capitan.trim(), torneoId: selectedTorneoId } 
          : equipo
      ));
      setEditingId(null);
    } else {
      // Alta (C de CRUD)
      const nuevoEquipo = {
        id: Date.now(),
        nombreEquipo: nombreEquipo.trim(),
        capitan: capitan.trim(),
        torneoId: selectedTorneoId
      };
      setEquipos(prev => [nuevoEquipo, ...prev]);
    }

    resetForm();
  };

  const handleEdit = (equipo) => {
    setEditingId(equipo.id);
    setNombreEquipo(equipo.nombreEquipo);
    setCapitan(equipo.capitan);
    setTorneoId(equipo.torneoId.toString());
    setErrors({});
    setDeleteConfirmationId(null);
  };

  const handleDelete = (id) => {
    // Baja (D de CRUD)
    setEquipos(prev => prev.filter(equipo => equipo.id !== id));
    setDeleteConfirmationId(null);
    if (editingId === id) {
      resetForm();
    }
  };

  const resetForm = () => {
    setNombreEquipo('');
    setCapitan('');
    setTorneoId('');
    setEditingId(null);
    setErrors({});
  };

  // --- Búsqueda y Filtrado ---
  const filteredEquipos = useMemo(() => {
    return equipos.filter(equipo => {
      // Buscamos información del torneo asociado para permitir buscar por nombre de torneo también
      const torneo = torneos.find(t => t.id === equipo.torneoId);
      const nombreTorneo = torneo ? torneo.nombre : '';
      const juegoTorneo = torneo ? torneo.juego : '';

      return equipo.nombreEquipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
             equipo.capitan.toLowerCase().includes(searchTerm.toLowerCase()) ||
             nombreTorneo.toLowerCase().includes(searchTerm.toLowerCase()) ||
             juegoTorneo.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [equipos, torneos, searchTerm]);

  // --- Estadísticas ---
  const stats = useMemo(() => {
    const total = equipos.length;
    const conCapitan = equipos.filter(e => e.capitan.trim().length > 0).length;

    // Obtener torneo con más equipos registrados
    const torneoCounts = {};
    let popularTorneo = "Ninguno";
    let maxCount = 0;

    equipos.forEach(e => {
      torneoCounts[e.torneoId] = (torneoCounts[e.torneoId] || 0) + 1;
      if (torneoCounts[e.torneoId] > maxCount) {
        maxCount = torneoCounts[e.torneoId];
        const torneoObj = torneos.find(t => t.id === e.torneoId);
        popularTorneo = torneoObj ? torneoObj.nombre : `Torneo ID: ${e.torneoId}`;
      }
    });

    return { total, conCapitan, popularTorneo };
  }, [equipos, torneos]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-8 selection:bg-violet-500 selection:text-white">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* --- CABECERA --- */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800/80 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-wider text-fuchsia-400 bg-fuchsia-500/10 rounded-full border border-fuchsia-500/20">
                Panel de Equipos
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-fuchsia-400 via-pink-400 to-violet-400 bg-clip-text text-transparent">
              Equipos Hub
            </h1>
            <p className="text-slate-400 text-sm sm:text-base mt-1">
              Registro de escuadras y designación de capitanes en memoria.
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
              placeholder="Buscar equipo, capitán o torneo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-fuchsia-500/40 focus:border-fuchsia-500 transition-all duration-200"
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
          
          {/* Total Equipos */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Equipos</p>
              <h3 className="text-2xl font-bold mt-1 text-slate-100">{stats.total}</h3>
            </div>
            <div className="p-3 rounded-xl bg-fuchsia-500/10 text-fuchsia-400 border border-fuchsia-500/20">
              {/* [REPLACEABLE SVG: UserGroupIcon] */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>

          {/* Capitanes Designados */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Líderes Registrados</p>
              <h3 className="text-2xl font-bold mt-1 text-pink-400">
                {stats.conCapitan} / {stats.total}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              {/* [REPLACEABLE SVG: ShieldCheckIcon] */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
          </div>

          {/* Torneo con más Escuadras */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all duration-300">
            <div>
              <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">Torneo más Concurrido</p>
              <h3 className="text-2xl font-bold mt-1 text-violet-400 truncate max-w-[160px] sm:max-w-[200px]" title={stats.popularTorneo}>
                {stats.popularTorneo}
              </h3>
            </div>
            <div className="p-3 rounded-xl bg-violet-500/10 text-violet-400 border border-violet-500/20">
              {/* [REPLACEABLE SVG: FlagIcon] */}
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
              </svg>
            </div>
          </div>

        </section>

        {/* --- GRID DE CONTENIDO PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* COLUMNA 1: FORMULARIO */}
          <section className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
            {/* Gradiente decorativo superior */}
            <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-fuchsia-500 via-pink-500 to-violet-500"></div>

            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                {editingId !== null ? (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
                    Editar Equipo
                  </>
                ) : (
                  <>
                    <span className="inline-block w-2 h-2 rounded-full bg-fuchsia-400"></span>
                    Nuevo Equipo
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

            {/* Advertencia si no hay torneos */}
            {torneos.length === 0 && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl text-xs space-y-1.5 mb-5">
                <p className="font-bold flex items-center gap-1">
                  <span>⚠️</span> Sin Torneos Creados
                </p>
                <p>Para poder registrar un equipo, debes crear al menos un torneo primero en la pestaña de Torneos.</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Campo Nombre del Equipo */}
              <div>
                <label htmlFor="nombreEquipo" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nombre del Equipo
                </label>
                <input
                  id="nombreEquipo"
                  type="text"
                  placeholder="Ej: Fnatic Esports"
                  value={nombreEquipo}
                  onChange={(e) => setNombreEquipo(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.nombreEquipo 
                      ? 'border-rose-500/60 focus:ring-rose-500/20' 
                      : 'border-slate-800 focus:ring-fuchsia-500/20 focus:border-fuchsia-500'
                  }`}
                />
                {errors.nombreEquipo && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-400"></span>
                    {errors.nombreEquipo}
                  </p>
                )}
              </div>

              {/* Campo Capitán */}
              <div>
                <label htmlFor="capitan" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Nombre del Capitán
                </label>
                <input
                  id="capitan"
                  type="text"
                  placeholder="Ej: TenZ"
                  value={capitan}
                  onChange={(e) => setCapitan(e.target.value)}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.capitan 
                      ? 'border-rose-500/60 focus:ring-rose-500/20' 
                      : 'border-slate-800 focus:ring-fuchsia-500/20 focus:border-fuchsia-500'
                  }`}
                />
                {errors.capitan && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-400"></span>
                    {errors.capitan}
                  </p>
                )}
              </div>

              {/* Selección de Torneo */}
              <div>
                <label htmlFor="torneoId" className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Asociar a Torneo
                </label>
                <select
                  id="torneoId"
                  value={torneoId}
                  onChange={(e) => setTorneoId(e.target.value)}
                  disabled={torneos.length === 0}
                  className={`w-full bg-slate-950 border rounded-xl px-4 py-2.5 text-sm text-slate-200 focus:outline-none focus:ring-2 transition-all duration-200 appearance-none disabled:opacity-50 disabled:cursor-not-allowed ${
                    errors.torneoId 
                      ? 'border-rose-500/60 focus:ring-rose-500/20' 
                      : 'border-slate-800 focus:ring-fuchsia-500/20 focus:border-fuchsia-500'
                  }`}
                >
                  <option value="" className="text-slate-600">-- Selecciona un torneo --</option>
                  {torneos.map((torneo) => (
                    <option key={torneo.id} value={torneo.id} className="text-slate-200">
                      {torneo.nombre} ({torneo.juego})
                    </option>
                  ))}
                </select>
                {errors.torneoId && (
                  <p className="text-rose-400 text-xs mt-1.5 flex items-center gap-1">
                    <span className="inline-block w-1 h-1 rounded-full bg-rose-400"></span>
                    {errors.torneoId}
                  </p>
                )}
              </div>

              {/* Botón de Envío */}
              <button
                type="submit"
                disabled={torneos.length === 0}
                className={`w-full py-3 px-4 rounded-xl font-semibold text-sm text-white shadow-lg transition-all duration-200 transform active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${
                  editingId !== null
                    ? 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-900/25'
                    : 'bg-gradient-to-r from-fuchsia-600 to-pink-600 hover:from-fuchsia-500 hover:to-pink-500 shadow-fuchsia-950/20'
                }`}
              >
                {editingId !== null ? 'Guardar Cambios' : 'Registrar Equipo'}
              </button>

            </form>
          </section>

          {/* COLUMNA 2-3: LISTADO DE EQUIPOS */}
          <section className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2">
                <span>Lista de Equipos</span>
                <span className="text-xs bg-slate-800 text-slate-400 px-2.5 py-0.5 rounded-full font-medium border border-slate-700/40">
                  {filteredEquipos.length}
                </span>
              </h2>
              {searchTerm && (
                <span className="text-xs text-slate-400 italic">
                  Filtrado por: "{searchTerm}"
                </span>
              )}
            </div>

            {/* Listado en Grid de Tarjetas */}
            {filteredEquipos.length === 0 ? (
              <div className="bg-slate-900/30 border border-slate-800 border-dashed rounded-2xl p-12 text-center flex flex-col items-center justify-center">
                <div className="p-4 bg-slate-900/60 rounded-full border border-slate-800 text-slate-600 mb-4">
                  {/* [REPLACEABLE SVG: InboxEmptyIcon] */}
                  <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0l-3.586 3.586a2 2 0 01-2.828 0L12 14m0 0l-3.586 3.586a2 2 0 01-2.828 0L2 14" />
                  </svg>
                </div>
                <h4 className="text-base font-semibold text-slate-300">No se encontraron equipos</h4>
                <p className="text-slate-500 text-sm mt-1 max-w-sm">
                  {searchTerm 
                    ? "Intenta modificar los términos de tu búsqueda." 
                    : "Comienza registrando una nueva escuadra usando el formulario."
                  }
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredEquipos.map((equipo) => {
                  const isDeleting = deleteConfirmationId === equipo.id;
                  const isEditingThis = editingId === equipo.id;

                  // Lookup del Torneo asociado
                  const torneoAsociado = torneos.find(t => t.id === equipo.torneoId);
                  const nombreTorneo = torneoAsociado ? torneoAsociado.nombre : "Torneo no asignado";
                  const juegoTorneo = torneoAsociado ? torneoAsociado.juego : "Desconocido";

                  return (
                    <article 
                      key={equipo.id}
                      className={`relative bg-slate-900 border rounded-2xl p-5 flex flex-col justify-between shadow-md transition-all duration-300 ${
                        isEditingThis 
                          ? 'border-amber-500/50 bg-slate-900/80 shadow-amber-900/5 scale-[1.01]' 
                          : 'border-slate-800 hover:border-slate-700/80 hover:shadow-slate-950/20'
                      }`}
                    >
                      {isEditingThis && (
                        <span className="absolute top-3 right-3 text-[10px] bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded-full font-semibold border border-amber-500/20 uppercase tracking-wider animate-pulse">
                          Editando
                        </span>
                      )}

                      <div className="space-y-4">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <h3 className="text-lg font-bold text-slate-100 leading-tight">
                              {equipo.nombreEquipo}
                            </h3>
                            <p className="text-slate-400 text-xs mt-1 flex items-center gap-1">
                              <span className="text-pink-400 font-medium">Capitán:</span> 
                              <span className="text-slate-300 font-semibold">{equipo.capitan}</span>
                            </p>
                          </div>
                        </div>

                        {/* Detalles del Torneo Asociado */}
                        <div className="bg-slate-950/50 border border-slate-800/60 rounded-xl p-3 flex flex-col gap-1">
                          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                            Torneo Inscrito
                          </span>
                          <span className="text-xs font-bold text-slate-200 truncate">
                            {nombreTorneo}
                          </span>
                          {torneoAsociado && (
                            <span className="text-[10px] text-fuchsia-400 font-medium">
                              Juego: {juegoTorneo}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* --- ACCIONES EN TARJETA --- */}
                      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-end">
                        
                        {!isDeleting ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleEdit(equipo)}
                              className="text-slate-400 hover:text-amber-400 p-2 hover:bg-amber-400/5 rounded-lg border border-transparent hover:border-amber-500/20 transition-all duration-200"
                              title="Editar Equipo"
                            >
                              {/* [REPLACEABLE SVG: PencilIcon] */}
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={() => setDeleteConfirmationId(equipo.id)}
                              className="text-slate-400 hover:text-rose-400 p-2 hover:bg-rose-400/5 rounded-lg border border-transparent hover:border-rose-500/20 transition-all duration-200"
                              title="Eliminar Equipo"
                            >
                              {/* [REPLACEABLE SVG: TrashIcon] */}
                              <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
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
                              onClick={() => handleDelete(equipo.id)}
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
