namespace Quixo.Api.Dtos
{
    public class Partida4PCreateDto
    {
        // Jugador del equipo A que va ARRIBA del tablero
        public int EquipoA1Id { get; set; }

        // Jugador del equipo A que va ABAJO del tablero
        public int EquipoA2Id { get; set; }

        // Jugador del equipo B que va a la DERECHA del tablero
        public int EquipoB1Id { get; set; }

        // Jugador del equipo B que va a la IZQUIERDA del tablero
        public int EquipoB2Id { get; set; }
    }
}
