using System.Xml.Linq;

namespace Quixo.Api.Services;

public class ReglasQuixo2P
{
    public void ValidarJugadaXml(string historialXml)
    {
        // Pendiente validar el historial 
        _ = historialXml;
    }

    public static bool TieneCincoEnLinea(string tableroXml, char simbolo)
    {

        try
        {
            var doc = XDocument.Parse(tableroXml);
            var celdas = doc.Root!.Elements("Celda")
                .Select(x => new {
                    i = int.Parse(x.Attribute("i")!.Value),
                    s = x.Attribute("simbolo")!.Value
                }).ToArray();

            var b = new string[25];
            foreach (var c in celdas) b[c.i] = c.s;

            bool Linea(Func<int,int> at)
            {
                for (int k=0;k<5;k++) if (b[at(k)] != simbolo.ToString()) return false;
                return true;
            }

            for (int r=0;r<5;r++) if (Linea(k => r*5 + k)) return true;
            for (int c=0;c<5;c++) if (Linea(k => k*5 + c)) return true;
            if (Linea(k => k*5 + k)) return true;
            if (Linea(k => k*5 + (4-k))) return true;
            return false;
        }
        catch { return false; }
    }
}
