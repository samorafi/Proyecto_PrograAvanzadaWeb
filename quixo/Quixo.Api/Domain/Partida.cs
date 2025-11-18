namespace Quixo.Api.Domain;

public class Partida
{
    public int PartidaId { get; set; }

    public string Modo { get; set; } = "2P"; // '2P' | '4P'

    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaSobrescrita { get; set; }
    public DateTime? FechaFinalizada { get; set; }
    public int? DuracionSegundos { get; set; }

    // 2P
    public int? JugadorOid { get; set; }
    public int? JugadorXid { get; set; }

    public int? EquipoA1Id { get; set; }
    public int? EquipoA2Id { get; set; }
    public int? EquipoB1Id { get; set; }
    public int? EquipoB2Id { get; set; }

    public string? GanadorSimbolo { get; set; } // 'O' | 'X'
    public string? GanadorEquipo  { get; set; } // 'A' | 'B'

    public string? TableroFinalXml { get; set; }
    public string HistorialXml { get; set; } = "<Historial/>";
}
