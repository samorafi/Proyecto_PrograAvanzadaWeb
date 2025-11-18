-- =========================
-- TABLA: Jugadores
-- =========================
CREATE TABLE dbo.Jugadores (
  JugadorId       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Nombre          NVARCHAR(100)     NOT NULL,
  FechaCreacion   DATETIME2(3)      NOT NULL DEFAULT SYSUTCDATETIME()
);

-- =========================
-- TABLA: Partidas
-- =========================
CREATE TABLE dbo.Partidas (
  PartidaId         INT IDENTITY(1,1) NOT NULL PRIMARY KEY,

  -- '2P' o '4P'
  Modo              CHAR(2)           NOT NULL
    CONSTRAINT CK_Partidas_Modo CHECK (Modo IN ('2P','4P')),

  -- Fechas
  FechaCreacion     DATETIME2(0)      NOT NULL DEFAULT SYSDATETIME(),
  FechaSobrescrita  DATETIME2(0)      NULL,
  FechaFinalizada   DATETIME2(0)      NULL,

  -- Duración total en segundos
  DuracionSegundos  INT               NULL,

  -- Participantes modo 2 jugadores (O y X)
  JugadorOid        INT               NULL,
  JugadorXid        INT               NULL,

  -- Participantes modo 4 jugadores (equipos A y B)
  EquipoA1Id        INT               NULL,
  EquipoA2Id        INT               NULL,
  EquipoB1Id        INT               NULL,
  EquipoB2Id        INT               NULL,

  -- Resultado
  GanadorSimbolo    CHAR(1)           NULL,  -- 'O' o 'X' (solo 2P)
  GanadorEquipo     CHAR(1)           NULL,  -- 'A' o 'B' (solo 4P)

  -- Estado final e historial
  TableroFinalXml   XML               NULL,
  HistorialXml      XML               NOT NULL
);

-- =========================
-- TABLA: Equipos4P (parejas reutilizables)
-- =========================
CREATE TABLE dbo.Equipos4P (
  EquipoId       INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  Jugador1Id     INT               NOT NULL,
  Jugador2Id     INT               NOT NULL,
  FechaCreacion  DATETIME2(3)      NOT NULL DEFAULT SYSUTCDATETIME()
  -- (Opcional) NombreEquipo NVARCHAR(100) NULL
);

-- =========================
-- TABLA: PartidasEquipos4P (qué equipos jugaron una partida 4P)
-- =========================
CREATE TABLE dbo.PartidasEquipos4P (
  PartidaEquipoId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  PartidaId       INT               NOT NULL,   -- Debe ser Modo = '4P'
  EquipoId        INT               NOT NULL,   -- Referencia a Equipos4P
  Letra           CHAR(1)           NOT NULL    -- 'A' o 'B'
    CONSTRAINT CK_PartidasEquipos4P_Letra CHECK (Letra IN ('A','B')),
  Simbolo         CHAR(1)           NOT NULL    -- 'O' o 'X'
    CONSTRAINT CK_PartidasEquipos4P_Simbolo CHECK (Simbolo IN ('O','X'))
);


-- =========================
-- TABLA: PartidaParticipantes
-- =========================
CREATE TABLE dbo.PartidaParticipantes (
  PartidaParticipanteId INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
  PartidaId             INT               NOT NULL,
  JugadorId             INT               NOT NULL,

  -- Rol unifica 2P y 4P:
  --  2P: 'O', 'X'
  --  4P: 'A1','A2','B1','B2'
  Rol                   NVARCHAR(3)       NOT NULL,

  -- Equipo: NULL en 2P, 'A' o 'B' en 4P
  Equipo                CHAR(1)           NULL
    CONSTRAINT CK_PartidaParticipantes_Equipo CHECK (Equipo IN ('A','B') OR Equipo IS NULL),

  OrdenTurno            SMALLINT          NULL   
);


-- =========================
-- TABLA: EstadisticasJugadores2P
-- =========================
CREATE TABLE dbo.EstadisticasJugadores2P (
  JugadorId       INT           NOT NULL PRIMARY KEY,  
  Jugadas         INT           NOT NULL DEFAULT 0,
  Ganadas         INT           NOT NULL DEFAULT 0,
  EfectividadPorc DECIMAL(5,2)  NULL     -- (Ganadas/Jugadas)*100
);

-- =========================
-- TABLA: EstadisticasEquipos4P
-- =========================
CREATE TABLE dbo.EstadisticasEquipos4P (
  EquipoId        INT           NOT NULL PRIMARY KEY,  
  Jugadas         INT           NOT NULL DEFAULT 0,
  Ganadas         INT           NOT NULL DEFAULT 0,
  EfectividadPorc DECIMAL(5,2)  NULL
);
