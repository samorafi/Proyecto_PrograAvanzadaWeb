using Microsoft.EntityFrameworkCore;
using Quixo.Api.Data;

namespace Quixo.Api.Services;

public class JugadoresService
{
    private readonly QuixoDbContext _db;
    public JugadoresService(QuixoDbContext db) => _db = db;

    public async Task<bool> ExisteAsync(params int?[] ids)
    {
        var idList = ids.Where(i => i.HasValue).Select(i => i!.Value).Distinct().ToList();
        if (idList.Count == 0) return true;
        var encontrados = await _db.Jugadores.Where(j => idList.Contains(j.JugadorId)).Select(j => j.JugadorId).ToListAsync();
        return encontrados.Count == idList.Count;
    }

    public async Task<Dictionary<int,int>> Victorias2PAsync()
    {
        // Cuenta victorias sumando según GanadorSimbolo y JugadorOid/JugadorXid
        var q = await _db.Partidas
            .Where(p => p.Modo == "2P" && p.FechaFinalizada != null && p.GanadorSimbolo != null)
            .Select(p => new { p.GanadorSimbolo, p.JugadorOid, p.JugadorXid })
            .ToListAsync();

        var map = new Dictionary<int,int>();
        foreach (var p in q)
        {
            int? ganadorId = p.GanadorSimbolo == "O" ? p.JugadorOid : p.JugadorXid;
            if (ganadorId is int id)
            {
                map[id] = map.TryGetValue(id, out var c) ? c + 1 : 1;
            }
        }
        return map;
    }
}
