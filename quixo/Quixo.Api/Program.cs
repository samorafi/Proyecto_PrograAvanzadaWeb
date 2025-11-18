using Microsoft.EntityFrameworkCore;
using Quixo.Api.Data;
using Quixo.Api.Services;

var builder = WebApplication.CreateBuilder(args);

// DB
builder.Services.AddDbContext<QuixoDbContext>(opts =>
    opts.UseSqlServer(builder.Configuration.GetConnectionString("SqlServer")));

// Servicios
builder.Services.AddScoped<JugadoresService>();
builder.Services.AddScoped<ReglasQuixo2P>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// CORS para Vite en 5173
const string CORS = "_front";
builder.Services.AddCors(o =>
{
    o.AddPolicy(CORS, p => p.WithOrigins("http://localhost:5173")
        .AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors(CORS);

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapControllers();
app.Run();
