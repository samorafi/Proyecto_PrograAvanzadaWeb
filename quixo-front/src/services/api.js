import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5207";
export const api = axios.create({ baseURL: API_BASE });

export const jugadores = {
  list: (q = "", page = 1, pageSize = 20) =>
    api.get(`/api/jugadores`, { params: { q, page, pageSize } }),
  get: (id) => api.get(`/api/jugadores/${id}`),
  create: (nombre) => api.post(`/api/jugadores`, { nombre }),
  update: (id, nombre) => api.put(`/api/jugadores/${id}`, { nombre }),
  delete: (id) => api.delete(`/api/jugadores/${id}`),
  exists: (name) => api.get(`/api/jugadores/exists`, { params: { q: name } }),
  stats2p: (id) => api.get(`/api/jugadores/${id}/stats-2p`),
};

export const partidas2p = {
  create: (jugadorOid, jugadorXid) =>
    api.post(`/api/partidas-2p`, { jugadorOid, jugadorXid }),
  jugada: (id, historialXml, tableroXml) =>
    api.put(`/api/partidas-2p/${id}/jugada`, { historialXml, tableroXml }),
  finalizar: (id, duracionSegundos, ganadorSimbolo, tableroFinalXml) =>
    api.put(`/api/partidas-2p/${id}/finalizar`, {
      duracionSegundos,
      ganadorSimbolo,
      tableroFinalXml,
    }),
  reiniciar: (id) =>
    api.put(`/api/partidas-2p/${id}/reiniciar`, { confirmar: true }),
  get: (id) => api.get(`/api/partidas-2p/${id}`),
  finalizadas: () => api.get(`/api/partidas-2p/finalizadas`),
};
