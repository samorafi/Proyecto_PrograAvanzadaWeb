using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quixo.Api.Data;
using Quixo.Api.Domain;
using Quixo.Api.Dtos;
using Quixo.Api.Services;

namespace Quixo.Api.Controllers;

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
    public async Task<IActionResult> Get([FromQuery] JugadorListQuery q)
    {
        var qry = _db.Jugadores.AsQueryable();
        if (!string.IsNullOrWhiteSpace(q.Q))
            qry = qry.Where(j => j.Nombre.Contains(q.Q));

        var total = await qry.CountAsync();
        var data = await qry
            .OrderByDescending(j => j.JugadorId)
            .Skip((q.Page - 1) * q.PageSize)
            .Take(q.PageSize)
            .ToListAsync();

        return Ok(new { total, page = q.Page, pageSize = q.PageSize, data });
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
        var ok = await _db.Jugadores.AnyAsync(j => j.Nombre == q);
        return Ok(new { exists = ok });
    }
}
