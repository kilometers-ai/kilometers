namespace Kilometers.Api.Domain.Events;

/// <summary>
/// Data Transfer Object for MCP events received from the CLI
/// This matches the Event struct from the Go CLI
/// </summary>
public record MpcEventDto
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
}

/// <summary>
/// Batch of events sent from CLI to reduce HTTP request overhead
/// </summary>
public record MpcEventBatchDto
{
    /// <summary>
    /// Collection of events in this batch
    /// </summary>
    public List<MpcEventDto> Events { get; init; } = new();

    /// <summary>
    /// CLI version that sent this batch
    /// </summary>
    public string CliVersion { get; init; } = string.Empty;

    /// <summary>
    /// Timestamp when the batch was created
    /// </summary>
    public DateTime BatchTimestamp { get; init; } = DateTime.UtcNow;
}