namespace Quixo.Api.Domain;

public class Jugador
{
    public int JugadorId { get; set; }
    public string Nombre { get; set; } = default!;
    public DateTime FechaCreacion { get; set; }
}
