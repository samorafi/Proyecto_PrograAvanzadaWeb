namespace Quixo.Api.Dtos;

public class PartidaFinalizadaListItemDto
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
}
