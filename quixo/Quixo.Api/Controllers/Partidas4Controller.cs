using Microsoft.AspNetCore.Mvc;
using Quixo.Api.Dtos;
using Quixo.Api.Data;
using Quixo.Api.Domain;

namespace Quixo.Api.Controllers
{
    [ApiController]
    [Route("api/partidas/4p")]
    public class Partidas4PController : ControllerBase
    {
        private readonly QuixoDbContext _db;

        public Partidas4PController(QuixoDbContext db)
        {
            _db = db;
        }

        // ===============================
        // 1) CREAR PARTIDA 4P
        // ===============================
        [HttpPost("crear")]
        public IActionResult CrearPartida4P([FromBody] Partida4PCreateDto dto)
        {
            var partida = new Partida
            {
                Modo = "4P",
                FechaCreacion = DateTime.UtcNow,

                EquipoA1Id = dto.EquipoA1Id,
                EquipoA2Id = dto.EquipoA2Id,
                EquipoB1Id = dto.EquipoB1Id,
                EquipoB2Id = dto.EquipoB2Id,

                HistorialXml = "<Historial/>",
                TableroFinalXml = null   // se asigna al registrar jugada
            };

            _db.Partidas.Add(partida);
            _db.SaveChanges();

            return Ok(new
            {
                partida.PartidaId,
                partida.Modo,
                mensaje = "Partida 4P creada correctamente"
            });
        }


        // ===============================
        // 2) REGISTRAR JUGADA 4P
        // ===============================
        [HttpPost("{partidaId}/jugada")]
        public IActionResult RegistrarJugada4P(int partidaId, [FromBody] RegistrarJugada4PDto dto)
        {
            var partida = _db.Partidas.FirstOrDefault(x => x.PartidaId == partidaId);

            if (partida == null)
                return NotFound($"No existe la partida con ID {partidaId}");

            partida.TableroFinalXml = dto.TableroXml;
            partida.HistorialXml = dto.HistorialXml;

            _db.SaveChanges();

            return Ok(new
            {
                mensaje = "Jugada 4P registrada correctamente"
            });
        }


        // ===============================
        // 3) FINALIZAR PARTIDA 4P
        // ===============================
        [HttpPost("{partidaId}/finalizar")]
        public IActionResult FinalizarPartida4P(int partidaId, [FromBody] FinalizarPartida4PDto dto)
        {
            var partida = _db.Partidas.FirstOrDefault(x => x.PartidaId == partidaId);

            if (partida == null)
                return NotFound($"No existe la partida con ID {partidaId}");

            partida.DuracionSegundos = dto.DuracionSegundos;
            partida.GanadorEquipo = dto.GanadorEquipo; 
            partida.TableroFinalXml = dto.TableroFinalXml;
            partida.FechaFinalizada = DateTime.UtcNow;

            _db.SaveChanges();

            return Ok(new
            {
                mensaje = "Partida 4P finalizada correctamente",
                partida.PartidaId,
                ganador = partida.GanadorEquipo
            });
        }


        // ===============================
        // 4) LISTAR PARTIDAS 4P FINALIZADAS
        // ===============================
        [HttpGet("finalizadas")]
        public IActionResult ListarFinalizadas4P()
        {
            var partidas = _db.Partidas
                .Where(p => p.Modo == "4P" && p.FechaFinalizada != null)
                .OrderByDescending(p => p.FechaFinalizada)
                .Select(p => new
                {
                    p.PartidaId,
                    p.FechaCreacion,
                    p.FechaFinalizada,
                    p.DuracionSegundos,
                    p.GanadorEquipo
                })
                .ToList();

            return Ok(partidas);
        }


        // ===============================
        // 5) OBTENER DETALLE DE UNA PARTIDA 4P
        // ===============================
        [HttpGet("{partidaId}")]
        public IActionResult ObtenerPartida4P(int partidaId)
        {
            var partida = _db.Partidas.FirstOrDefault(p => p.PartidaId == partidaId);

            if (partida == null)
                return NotFound($"No existe la partida con ID {partidaId}");

            return Ok(new
            {
                partida.PartidaId,
                partida.Modo,
                partida.FechaCreacion,
                partida.FechaFinalizada,
                partida.DuracionSegundos,

                // Jugadores
                partida.EquipoA1Id,
                partida.EquipoA2Id,
                partida.EquipoB1Id,
                partida.EquipoB2Id,

                // Ganador del equipo
                partida.GanadorEquipo,

                // XMLs del tablero e historial
                partida.TableroFinalXml,
                partida.HistorialXml
            });
        }
    }
}