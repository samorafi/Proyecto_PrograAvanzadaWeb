using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quixo.Api.Data;
using Quixo.Api.Domain;
using Quixo.Api.Dtos;
using Quixo.Api.Services;

namespace Quixo.Api.Controllers;

[ApiController]
[Route("api/partidas-2p")]
public class Partidas2PController : ControllerBase
{
    private readonly QuixoDbContext _db;
    private readonly JugadoresService _jugSvc;
    private readonly ReglasQuixo2P _reglas;

    public Partidas2PController(QuixoDbContext db, JugadoresService jugSvc, ReglasQuixo2P reglas)
    {
        _db = db; _jugSvc = jugSvc; _reglas = reglas;
    }

    // POST: /api/partidas-2p
    [HttpPost]
    public async Task<IActionResult> Crear([FromBody] Partida2PCreateDto dto)
    {
        if (!await _jugSvc.ExisteAsync(dto.JugadorOid, dto.JugadorXid))
            return BadRequest("Jugador no existe.");

        var p = new Partida
        {
            Modo = "2P",
            FechaCreacion = DateTime.Now,
            JugadorOid = dto.JugadorOid,
            JugadorXid = dto.JugadorXid,
            HistorialXml = "<Historial/>"
        };
        _db.Partidas.Add(p);
        await _db.SaveChangesAsync();
        return Ok(new { p.PartidaId });
    }

    // PUT: /api/partidas-2p/{id}/jugada
    [HttpPut("{id:int}/jugada")]
    public async Task<IActionResult> RegistrarJugada(int id, [FromBody] RegistrarJugadaDto dto)
    {
        var p = await _db.Partidas.FirstOrDefaultAsync(x => x.PartidaId == id && x.Modo == "2P");
        if (p == null) return NotFound();

        _reglas.ValidarJugadaXml(dto.HistorialXml); // opcional

        p.HistorialXml = dto.HistorialXml;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // PUT: /api/partidas-2p/{id}/finalizar
    [HttpPut("{id:int}/finalizar")]
    public async Task<IActionResult> Finalizar(int id, [FromBody] FinalizarPartida2PDto dto)
    {
        var p = await _db.Partidas.FirstOrDefaultAsync(x => x.PartidaId == id && x.Modo == "2P");
        if (p == null) return NotFound();

        p.DuracionSegundos = dto.DuracionSegundos;
        p.GanadorSimbolo = dto.GanadorSimbolo;
        p.TableroFinalXml = dto.TableroFinalXml;
        p.FechaFinalizada = DateTime.Now;
        await _db.SaveChangesAsync();
        return Ok();
    }

    // PUT: /api/partidas-2p/{id}/reiniciar
    [HttpPut("{id:int}/reiniciar")]
    public async Task<IActionResult> Reiniciar(int id, [FromBody] SobrescribirPartidaDto dto)
    {
        if (dto is null || dto.Confirmar != true) return BadRequest("Confirmar=true requerido.");
        var p = await _db.Partidas.FirstOrDefaultAsync(x => x.PartidaId == id && x.Modo == "2P");
        if (p == null) return NotFound();

        p.FechaSobrescrita = DateTime.Now;
        p.FechaFinalizada = null;
        p.DuracionSegundos = null;
        p.GanadorSimbolo = null;
        p.TableroFinalXml = null;
        p.HistorialXml = "<Historial/>";

        await _db.SaveChangesAsync();
        return Ok();
    }

    // GET: /api/partidas-2p/{id}
    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var p = await _db.Partidas.AsNoTracking().FirstOrDefaultAsync(x => x.PartidaId == id && x.Modo == "2P");
        return p == null ? NotFound() : Ok(p);
    }

    // GET: /api/partidas-2p/finalizadas
    [HttpGet("finalizadas")]
    public async Task<IActionResult> Finalizadas()
    {
        var list = await _db.Partidas.AsNoTracking()
            .Where(p => p.Modo == "2P" && p.FechaFinalizada != null)
            .OrderByDescending(p => p.FechaFinalizada)
            .Select(p => new {
                p.PartidaId,
                fechaLista = p.FechaSobrescrita ?? p.FechaCreacion,
                p.FechaFinalizada,
                p.DuracionSegundos,
                p.GanadorSimbolo
            })
            .ToListAsync();

        return Ok(list);
    }
}
