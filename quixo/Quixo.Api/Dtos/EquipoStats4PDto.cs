namespace Quixo.Api.Dtos;
public class EquipoStats4PDto
{
    public string Equipo { get; set; } = "";
    public int Jugadas { get; set; }
    public int Ganadas { get; set; }

    public decimal EfectividadPorc => Jugadas == 0 ? 0 : Math.Round((decimal)Ganadas * 100m / Jugadas, 2);
}
