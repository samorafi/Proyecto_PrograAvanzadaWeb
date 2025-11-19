namespace Quixo.Api.Domain;
//Clase dominio (modelo de la DB)
public class Jugador
{
    public int JugadorId { get; set; }
    public string Nombre { get; set; } = default!;
    public DateTime FechaCreacion { get; set; }
}
