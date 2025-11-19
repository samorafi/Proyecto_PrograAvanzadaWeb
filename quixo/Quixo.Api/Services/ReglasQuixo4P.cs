using System.Xml.Linq;

namespace Quixo.Api.Services
{
    public class ReglasQuixo4P
    {
        // ============================
        // Detecta ganador para 4P
        // ============================
        public static string? ObtenerGanador(string tableroXml)
        {
            try
            {
                var doc = XDocument.Parse(tableroXml);

                var celdas = doc.Root!.Elements("Celda")
                    .Select(x => new {
                        i = int.Parse(x.Attribute("i")!.Value),
                        simbolo = x.Attribute("simbolo")!.Value
                    })
                    .ToArray();

                var b = new string[25];
                foreach (var c in celdas)
                    b[c.i] = c.simbolo;

                bool Linea(Func<int, int> at)
                {
                    string first = b[at(0)];
                    if (first is null || first == "") return false;

                    for (int k = 1; k < 5; k++)
                        if (b[at(k)] != first) return false;

                    return true;
                }

                // ==========================
                // Revisar todas las líneas
                // ==========================
                var lineas = new List<List<int>>();

                // Horizontales
                for (int r = 0; r < 5; r++)
                    lineas.Add(Enumerable.Range(0, 5).Select(k => r * 5 + k).ToList());

                // Verticales
                for (int c = 0; c < 5; c++)
                    lineas.Add(Enumerable.Range(0, 5).Select(k => k * 5 + c).ToList());

                // Diagonales
                lineas.Add(new List<int> { 0, 6, 12, 18, 24 });
                lineas.Add(new List<int> { 4, 8, 12, 16, 20 });

                bool ganaA = false;
                bool ganaB = false;

                foreach (var linea in lineas)
                {
                    var simbolos = linea.Select(i => b[i]).ToList();

                    if (simbolos.All(x => x == "O"))
                        ganaA = true;

                    if (simbolos.All(x => x == "X"))
                        ganaB = true;
                }

                // ==========================
                // Reglas de pérdida instantánea
                // ==========================
                // Equipo A formó línea de X → A pierde, gana B
                if (ganaB && !ganaA)
                    return "B";

                // Equipo B formó línea de O → B pierde, gana A
                if (ganaA && !ganaB)
                    return "A";

                // Ambos formaron línea a la vez → pérdida simultánea
                // Según reglas: si formas la línea del enemigo pierdes,
                // y si los dos la forman, no hay ganador.
                if (ganaA && ganaB)
                    return null;

                return null;
            }
            catch
            {
                return null;
            }
        }
    }
}