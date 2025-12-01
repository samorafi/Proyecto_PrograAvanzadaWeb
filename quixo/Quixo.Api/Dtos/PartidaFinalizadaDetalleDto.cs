namespace Quixo.Api.Dtos;

public class PartidaFinalizadaDetalleDto
{
    public int PartidaId { get; set; }
    public string Modo { get; set; } = null!;

    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaSobrescrita { get; set; }
    public DateTime? FechaFinalizada { get; set; }
    public int? DuracionSegundos { get; set; }

    public string? GanadorSimbolo { get; set; }
    public string? GanadorEquipo { get; set; }

    public DateTime FechaLista { get; set; }

    public int? JugadorOid { get; set; }
    public int? JugadorXid { get; set; }

    public int? EquipoA1Id { get; set; }
    public int? EquipoA2Id { get; set; }
    public int? EquipoB1Id { get; set; }
    public int? EquipoB2Id { get; set; }

    public string? TableroFinalXml { get; set; }
    public string HistorialXml { get; set; } = "<Historial/>";
}
