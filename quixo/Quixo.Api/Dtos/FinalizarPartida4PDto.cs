namespace Quixo.Api.Dtos
{
    public class FinalizarPartida4PDto
    {
        public int DuracionSegundos { get; set; }

        // 'A' o 'B'
        public string GanadorEquipo { get; set; } = "A";

        public string TableroFinalXml { get; set; } = "<Tablero/>";
    }
}
