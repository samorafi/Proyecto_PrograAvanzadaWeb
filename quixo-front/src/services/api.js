// src/services/api.js
import axios from "axios";

const API = import.meta.env.VITE_API ?? "http://localhost:5207";

export const jugadores = {
  list: async (q = "", page = 1, pageSize = 500) => {
    const r = await axios.get(`${API}/api/Jugadores`, {
      params: { q, page, pageSize },
    });
    const raw = Array.isArray(r.data) ? r.data : (r.data?.items ?? []);
    const norm = raw.map(p => ({
      jugadorId: p.jugadorId ?? p.JugadorId,
      nombre:    p.nombre    ?? p.Nombre,
    }));
    return norm;
  },

  create: (nombre) => axios.post(`${API}/api/Jugadores`, { nombre }),

  exists: (nombre) =>
    axios.get(`${API}/api/Jugadores/exists`, { params: { q: nombre } }),

  findByName: async (nombre) => {
    try {
      const r = await axios.get(`${API}/api/Jugadores/by-name`, {
        params: { q: nombre },
      });
      const p = r.data || {};
      return {
        jugadorId: p.jugadorId ?? p.JugadorId,
        nombre:    p.nombre    ?? p.Nombre,
      };
    } catch (e) {
      if (e?.response?.status === 404) return null;
      throw e;
    }
  },
};

export const partidas2p = {
  create: (oId, xId) =>
    axios.post(`${API}/api/partidas-2p`, {
      jugadorOid: oId,
      jugadorXid: xId,
    }),

  jugada: (id, historialXml, tableroXml) =>
    axios.put(`${API}/api/partidas-2p/${id}/jugada`, { historialXml, tableroXml }),

  finalizar: (id, duracionSegundos, ganadorSimbolo, tableroFinalXml) =>
    axios.put(`${API}/api/partidas-2p/${id}/finalizar`, {
      duracionSegundos,
      ganadorSimbolo,
      tableroFinalXml,
    }),

  reiniciar: (id) => axios.put(`${API}/api/partidas-2p/${id}/reiniciar`, {}),

  get: (id) => axios.get(`${API}/api/partidas-2p/${id}`),

  finalizadas: () => axios.get(`${API}/api/partidas-2p/finalizadas`),
};

export const partidas4p = {
  create: (a1Id, a2Id, b1Id, b2Id) =>
    axios.post(`${API}/api/partidas/4p/crear`, {
      equipoA1Id: a1Id,
      equipoA2Id: a2Id,
      equipoB1Id: b1Id,
      equipoB2Id: b2Id,
    }),

  jugada: (id, historialXml, tableroXml) =>
    axios.post(`${API}/api/partidas/4p/${id}/jugada`, {
      historialXml,
      tableroXml,
    }),

  finalizar: (id, duracionSegundos, ganadorEquipo, tableroFinalXml) =>
    axios.post(`${API}/api/partidas/4p/${id}/finalizar`, {
      duracionSegundos,
      ganadorEquipo,
      tableroFinalXml,
    }),

  get: (id) => axios.get(`${API}/api/partidas/4p/${id}`),

  finalizadas: () => axios.get(`${API}/api/partidas/4p/finalizadas`),
};

export const partidasFinalizadas = {
  exportXmlUrl: (id) => `${API}/api/partidas/finalizadas/${id}/export-xml`,
};

export const stats = {
  jugadores2p: async () => {
    const r = await axios.get(`${API}/api/estadisticas/2p`);
    return r.data ?? [];
  },
  equipos4p: async () => {
    const r = await axios.get(`${API}/api/estadisticas/4p`);
    return r.data ?? [];
  },
};


