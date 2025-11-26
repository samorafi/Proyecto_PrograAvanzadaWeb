using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Quixo.Api.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Jugadores",
                columns: table => new
                {
                    JugadorId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Nombre = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2(3)", precision: 3, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Jugadores", x => x.JugadorId);
                });

            migrationBuilder.CreateTable(
                name: "Partidas",
                columns: table => new
                {
                    PartidaId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Modo = table.Column<string>(type: "nvarchar(2)", maxLength: 2, nullable: false),
                    FechaCreacion = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: false),
                    FechaSobrescrita = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: true),
                    FechaFinalizada = table.Column<DateTime>(type: "datetime2(0)", precision: 0, nullable: true),
                    DuracionSegundos = table.Column<int>(type: "int", nullable: true),
                    JugadorOid = table.Column<int>(type: "int", nullable: true),
                    JugadorXid = table.Column<int>(type: "int", nullable: true),
                    EquipoA1Id = table.Column<int>(type: "int", nullable: true),
                    EquipoA2Id = table.Column<int>(type: "int", nullable: true),
                    EquipoB1Id = table.Column<int>(type: "int", nullable: true),
                    EquipoB2Id = table.Column<int>(type: "int", nullable: true),
                    GanadorSimbolo = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    GanadorEquipo = table.Column<string>(type: "nvarchar(1)", maxLength: 1, nullable: true),
                    TableroFinalXml = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HistorialXml = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Partidas", x => x.PartidaId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Jugadores");

            migrationBuilder.DropTable(
                name: "Partidas");
        }
    }
}
