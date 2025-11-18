namespace Quixo.Api.Dtos;
public class JugadorListQuery
{
    public string? Q { get; set; }
    public int Page { get; set; } = 1;
    public int PageSize { get; set; } = 20;
}
