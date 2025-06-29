namespace Kilometers.Api.Domain.Events;

/// <summary>
/// Represents a captured MCP (Model Context Protocol) interaction event
/// </summary>
public record MpcEvent
{
    /// <summary>
    /// Unique identifier for this event
    /// </summary>
    public string Id { get; init; } = string.Empty;

    /// <summary>
    /// When this event was captured
    /// </summary>
    public DateTime Timestamp { get; init; }

    /// <summary>
    /// API key hash that identifies the customer who owns this event
    /// </summary>
    public string CustomerApiKeyHash { get; init; } = string.Empty;

    /// <summary>
    /// Direction of the message: "request" or "response"
    /// </summary>
    public string Direction { get; init; } = string.Empty;

    /// <summary>
    /// MCP method name (e.g., "tools/list", "tools/call")
    /// </summary>
    public string? Method { get; init; }

    /// <summary>
    /// Raw JSON payload of the MCP message
    /// </summary>
    public byte[] Payload { get; init; } = Array.Empty<byte>();

    /// <summary>
    /// Size of the payload in bytes
    /// </summary>
    public int Size { get; init; }

    /// <summary>
    /// Additional metadata about the event
    /// </summary>
    public EventMetadata Metadata { get; init; } = new();

    /// <summary>
    /// Creates an MpcEvent from a DTO received from the CLI
    /// </summary>
    public static MpcEvent FromDto(MpcEventDto dto, string customerApiKeyHash)
    {
        return new MpcEvent
        {
            Id = dto.Id,
            Timestamp = dto.Timestamp,
            CustomerApiKeyHash = customerApiKeyHash,
            Direction = dto.Direction,
            Method = dto.Method,
            Payload = dto.Payload,
            Size = dto.Size,
            Metadata = new EventMetadata
            {
                ProcessedAt = DateTime.UtcNow,
                Source = "cli",
                Version = "1.0"
            }
        };
    }
}

/// <summary>
/// Additional metadata associated with an event
/// </summary>
public record EventMetadata
{
    /// <summary>
    /// When this event was processed by the API
    /// </summary>
    public DateTime ProcessedAt { get; init; } = DateTime.UtcNow;

    /// <summary>
    /// Source of the event (e.g., "cli", "webhook")
    /// </summary>
    public string Source { get; init; } = string.Empty;

    /// <summary>
    /// Schema version for this event format
    /// </summary>
    public string Version { get; init; } = "1.0";

    /// <summary>
    /// Optional risk score for this event (0-10)
    /// </summary>
    public int? RiskScore { get; init; }

    /// <summary>
    /// Estimated cost for this interaction in USD
    /// </summary>
    public decimal? CostEstimate { get; init; }
}