using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quixo.Api.Data;
using Quixo.Api.Domain;
using Quixo.Api.Dtos;
using Quixo.Api.Services;

namespace Quixo.Api.Controllers;
//GET /api/jugadores, POST, PUT, DELETE, GET /exists, GET /by-name, GET /{id}/stats-2p. 
//Valida entradas y devuelve códigos

[ApiController]
[Route("api/[controller]")]
public class JugadoresController : ControllerBase
{
    private readonly QuixoDbContext _db;
    private readonly JugadoresService _svc;

    public JugadoresController(QuixoDbContext db, JugadoresService svc)
    {
        _db = db; _svc = svc;
    }

    [HttpGet]
    public async Task<IActionResult> List([FromQuery] string? q, [FromQuery] int page = 1, [FromQuery] int pageSize = 500)
    {
        var qry = _db.Jugadores.AsNoTracking();
        if (!string.IsNullOrWhiteSpace(q))
            qry = qry.Where(j => j.Nombre.Contains(q));

        var items = await qry
            .OrderBy(j => j.Nombre)
            .Take(pageSize)
            .Select(j => new { jugadorId = j.JugadorId, nombre = j.Nombre })
            .ToListAsync();

        return Ok(items); 
    }


    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetById(int id)
    {
        var j = await _db.Jugadores.FindAsync(id);
        return j == null ? NotFound() : Ok(j);
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] JugadorCreateDto dto)
    {
        var j = new Jugador { Nombre = dto.Nombre, FechaCreacion = DateTime.UtcNow };
        _db.Jugadores.Add(j);
        await _db.SaveChangesAsync();
        return Ok(j);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, [FromBody] JugadorUpdateDto dto)
    {
        var j = await _db.Jugadores.FindAsync(id);
        if (j == null) return NotFound();
        j.Nombre = dto.Nombre;
        await _db.SaveChangesAsync();
        return Ok(j);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var j = await _db.Jugadores.FindAsync(id);
        if (j == null) return NotFound();
        _db.Remove(j);
        await _db.SaveChangesAsync();
        return NoContent();
    }

    // Estadísticas simples 2P
    [HttpGet("{id:int}/stats-2p")]
    public async Task<IActionResult> Stats2P(int id)
    {
        var jugadas = await _db.Partidas
            .Where(p => p.Modo == "2P" && p.FechaFinalizada != null &&
                       (p.JugadorOid == id || p.JugadorXid == id))
            .CountAsync();

        var ganadas = await _db.Partidas
            .Where(p => p.Modo == "2P" && p.FechaFinalizada != null &&
                   ((p.JugadorOid == id && p.GanadorSimbolo == "O") ||
                    (p.JugadorXid == id && p.GanadorSimbolo == "X")))
            .CountAsync();

        var dto = new JugadorStats2PDto { Jugadas = jugadas, Ganadas = ganadas };
        return Ok(dto);
    }

    // helper para front: Jugador existe? 

    [HttpGet("exists")]
    public async Task<IActionResult> Exists([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest("El parámetro 'q' es requerido.");

        q = q.Trim();

        bool exists;
        if (int.TryParse(q, out var id))
        {
            exists = await _db.Jugadores
                .AsNoTracking()
                .AnyAsync(j => j.JugadorId == id);
        }
        else
        {
            var n = q.ToLower();
            exists = await _db.Jugadores
                .AsNoTracking()
                .AnyAsync(j => j.Nombre.Trim().ToLower() == n);
        }

        return Ok(new { exists });
    }
    [HttpGet("by-name")]
    public async Task<IActionResult> ByName([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
            return BadRequest("El parámetro 'q' es requerido.");

        var jugador = await _db.Jugadores
            .AsNoTracking()
            .FirstOrDefaultAsync(j => EF.Functions.Collate(j.Nombre.Trim(), "SQL_Latin1_General_CP1_CI_AI")
                                       == q.Trim());
        if (jugador == null) return NotFound();
        return Ok(jugador);
    }

}
