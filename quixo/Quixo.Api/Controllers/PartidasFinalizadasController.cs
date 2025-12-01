using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Quixo.Api.Data;
using Quixo.Api.Dtos;
using System.Xml.Linq;

namespace Quixo.Api.Controllers;

[ApiController]
[Route("api/partidas/finalizadas")]
public class PartidasFinalizadasController : ControllerBase
{
    private readonly QuixoDbContext _db;

    public PartidasFinalizadasController(QuixoDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<PartidaFinalizadaListItemDto>>> GetFinalizadas()
    {
        var list = await _db.Partidas
            .AsNoTracking()
            .Where(p => p.FechaFinalizada != null)
            .OrderByDescending(p => p.FechaSobrescrita ?? p.FechaCreacion)
            .Select(p => new PartidaFinalizadaListItemDto
            {
                PartidaId = p.PartidaId,
                Modo = p.Modo,
                FechaCreacion = p.FechaCreacion,
                FechaSobrescrita = p.FechaSobrescrita,
                FechaFinalizada = p.FechaFinalizada,
                DuracionSegundos = p.DuracionSegundos,
                GanadorSimbolo = p.GanadorSimbolo,
                GanadorEquipo = p.GanadorEquipo,
                FechaLista = p.FechaSobrescrita ?? p.FechaCreacion
            })
            .ToListAsync();

        return Ok(list);
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<PartidaFinalizadaDetalleDto>> GetFinalizadaById(int id)
    {
        var p = await _db.Partidas
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.PartidaId == id && x.FechaFinalizada != null);

        if (p == null)
            return NotFound($"No existe una partida finalizada con ID {id}");

        var dto = new PartidaFinalizadaDetalleDto
        {
            PartidaId = p.PartidaId,
            Modo = p.Modo,
            FechaCreacion = p.FechaCreacion,
            FechaSobrescrita = p.FechaSobrescrita,
            FechaFinalizada = p.FechaFinalizada,
            DuracionSegundos = p.DuracionSegundos,
            GanadorSimbolo = p.GanadorSimbolo,
            GanadorEquipo = p.GanadorEquipo,
            FechaLista = p.FechaSobrescrita ?? p.FechaCreacion,

            JugadorOid = p.JugadorOid,
            JugadorXid = p.JugadorXid,
            EquipoA1Id = p.EquipoA1Id,
            EquipoA2Id = p.EquipoA2Id,
            EquipoB1Id = p.EquipoB1Id,
            EquipoB2Id = p.EquipoB2Id,

            TableroFinalXml = p.TableroFinalXml,
            HistorialXml = p.HistorialXml
        };

        return Ok(dto);
    }

    [HttpGet("{id:int}/export-xml")]
    public async Task<IActionResult> ExportFinalizadaXml(int id)
    {
        var p = await _db.Partidas
            .AsNoTracking()
            .FirstOrDefaultAsync(x => x.PartidaId == id && x.FechaFinalizada != null);

        if (p == null)
            return NotFound($"No existe una partida finalizada con ID {id}");

        var fechaLista = p.FechaSobrescrita ?? p.FechaCreacion;

        // Construcción del XML usando LINQ to XML
        var doc = new XDocument(
            new XElement("PartidaQuixo",
                new XAttribute("id", p.PartidaId),
                new XAttribute("modo", p.Modo),

                new XElement("Fechas",
                    new XElement("Creacion", p.FechaCreacion.ToString("o")),
                    new XElement("Sobrescrita", p.FechaSobrescrita?.ToString("o")),
                    new XElement("Finalizada", p.FechaFinalizada?.ToString("o"))
                ),

                new XElement("DuracionSegundos", p.DuracionSegundos),

                new XElement("Ganador",
                    new XElement("Simbolo", p.GanadorSimbolo),
                    new XElement("Equipo", p.GanadorEquipo)
                ),

                new XElement("Participantes",
                    new XElement("Modo2P",
                        new XElement("JugadorOId", p.JugadorOid),
                        new XElement("JugadorXId", p.JugadorXid)
                    ),
                    new XElement("Modo4P",
                        new XElement("EquipoA1Id", p.EquipoA1Id),
                        new XElement("EquipoA2Id", p.EquipoA2Id),
                        new XElement("EquipoB1Id", p.EquipoB1Id),
                        new XElement("EquipoB2Id", p.EquipoB2Id)
                    )
                ),

                new XElement("TableroFinalXml", p.TableroFinalXml ?? ""),
                new XElement("HistorialXml", p.HistorialXml)
            )
        );

        using var ms = new MemoryStream();
        doc.Save(ms);
        var bytes = ms.ToArray();

        var fileName = $"quixo-partida-{p.PartidaId}-{fechaLista:yyyyMMdd-HHmmss}.xml";
        return File(bytes, "application/xml", fileName);
    }
}
