namespace Quixo.Api.Dtos;
public class FinalizarPartida2PDto
{
    public int DuracionSegundos { get; set; }
    public string GanadorSimbolo { get; set; } = "O"; // 'O'/'X'
    public string TableroFinalXml { get; set; } = "<Tablero/>";
}
