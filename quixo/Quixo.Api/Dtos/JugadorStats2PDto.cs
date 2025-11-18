namespace Quixo.Api.Dtos;
public class JugadorStats2PDto
{
    public int Jugadas { get; set; }
    public int Ganadas { get; set; }
    public decimal EfectividadPorc => Jugadas == 0 ? 0 : Math.Round((decimal)Ganadas * 100m / Jugadas, 2);
}
