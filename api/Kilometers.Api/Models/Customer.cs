namespace Kilometers.Api.Models;

public record Customer
{
    public string ApiKeyHash { get; init; } = string.Empty;
    public string ApiKeyPrefix { get; init; } = string.Empty; // First 8 chars for display
    public string? Email { get; init; }
    public string? Organization { get; init; }
    public DateTime CreatedAt { get; init; } = DateTime.UtcNow;
    public DateTime? LastUsedAt { get; set; }
    public bool IsActive { get; init; } = true;
}