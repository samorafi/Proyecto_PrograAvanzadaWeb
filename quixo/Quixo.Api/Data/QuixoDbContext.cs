using Microsoft.EntityFrameworkCore;
using Quixo.Api.Domain;

namespace Quixo.Api.Data;

public class QuixoDbContext : DbContext
{
    public QuixoDbContext(DbContextOptions<QuixoDbContext> options) : base(options) { }

    public DbSet<Jugador> Jugadores => Set<Jugador>();
    public DbSet<Partida> Partidas => Set<Partida>();

    protected override void OnModelCreating(ModelBuilder m)
    {
        m.Entity<Jugador>(e =>
        {
            e.ToTable("Jugadores");
            e.HasKey(x => x.JugadorId);
            e.Property(x => x.Nombre).HasMaxLength(100).IsRequired();
            e.Property(x => x.FechaCreacion).HasPrecision(3);
        });

        m.Entity<Partida>(e =>
        {
            e.ToTable("Partidas");
            e.HasKey(x => x.PartidaId);
            e.Property(x => x.Modo).HasMaxLength(2).IsRequired(); // '2P' o '4P'
            e.Property(x => x.FechaCreacion).HasPrecision(0);
            e.Property(x => x.FechaSobrescrita).HasPrecision(0);
            e.Property(x => x.FechaFinalizada).HasPrecision(0);
            e.Property(x => x.DuracionSegundos);
            e.Property(x => x.GanadorSimbolo).HasMaxLength(1);
            e.Property(x => x.GanadorEquipo).HasMaxLength(1);
            e.Property(x => x.TableroFinalXml);
            e.Property(x => x.HistorialXml).IsRequired();
        });
    }
}
