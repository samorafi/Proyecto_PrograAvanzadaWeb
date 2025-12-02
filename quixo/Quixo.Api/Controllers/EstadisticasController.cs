using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quixo.Api.Data;
using Quixo.Api.Dtos;

namespace Quixo.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EstadisticasController : ControllerBase
{
    private readonly QuixoDbContext _db;
    public EstadisticasController(QuixoDbContext db) => _db = db;

    //  Devuelve: lista de jugadores con jugadas, ganadas y %
    [HttpGet("2p")]
    public async Task<IActionResult> Stats2P()
    {
        // Partidas 2P finalizadas con ganador
        var partidas = await _db.Partidas
            .AsNoTracking()
            .Where(p => p.Modo == "2P"
                        && p.FechaFinalizada != null
                        && (p.JugadorOid != null || p.JugadorXid != null)
                        && p.GanadorSimbolo != null)
            .ToListAsync();

        var jugadores = await _db.Jugadores
            .AsNoTracking()
            .ToListAsync();

        // map[jugadorId] => stats
        var map = new Dictionary<int, JugadorStats2PDto>();

        foreach (var p in partidas)
        {
            // jugador O
            if (p.JugadorOid is int oId)
            {
                if (!map.TryGetValue(oId, out var sO))
                {
                    sO = new JugadorStats2PDto();
                    map[oId] = sO;
                }

                sO.Jugadas++;

                if (p.GanadorSimbolo == "O")
                    sO.Ganadas++;
            }

            // jugador X
            if (p.JugadorXid is int xId)
            {
                if (!map.TryGetValue(xId, out var sX))
                {
                    sX = new JugadorStats2PDto();
                    map[xId] = sX;
                }

                sX.Jugadas++;

                if (p.GanadorSimbolo == "X")
                    sX.Ganadas++;
            }
        }

        // unimos con la tabla Jugadores para sacar el nombre
        var result = (from j in jugadores
                      join kv in map on j.JugadorId equals kv.Key
                      select new
                      {
                          jugadorId = j.JugadorId,
                          nombre = j.Nombre,
                          jugadas = kv.Value.Jugadas,
                          ganadas = kv.Value.Ganadas,
                          efectividadPorc = kv.Value.EfectividadPorc
                      })
            .OrderByDescending(x => x.efectividadPorc)
            .ThenByDescending(x => x.ganadas)
            .ThenBy(x => x.nombre)
            .ToList();

        return Ok(result);
    }

    // ------------------------------------------------------------
    //  Devuelve: equipo A y B con jugadas, ganadas y %
    // ------------------------------------------------------------
    [HttpGet("4p")]
    public async Task<IActionResult> Stats4P()
    {
        var partidas = await _db.Partidas
            .AsNoTracking()
            .Where(p => p.Modo == "4P"
                        && p.FechaFinalizada != null
                        && p.GanadorEquipo != null)
            .ToListAsync();

        var statsA = new EquipoStats4PDto { Equipo = "A" };
        var statsB = new EquipoStats4PDto { Equipo = "B" };

        foreach (var p in partidas)
        {
            // Cada partida cuenta como jugada para A y B
            statsA.Jugadas++;
            statsB.Jugadas++;

            if (p.GanadorEquipo == "A")
                statsA.Ganadas++;
            else if (p.GanadorEquipo == "B")
                statsB.Ganadas++;
        }

        var result = new[] { statsA, statsB }
            .OrderBy(e => e.Equipo)
            .ToList();

        return Ok(result);
    }
}
