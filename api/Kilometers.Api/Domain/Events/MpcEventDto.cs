using System.Text.Json.Serialization;
using System.Text.Json;

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
    /// Raw JSON payload as base64 string from CLI, converted to byte array
    /// </summary>
    [JsonConverter(typeof(Base64PayloadConverter))]
    public byte[] Payload { get; init; } = Array.Empty<byte>();

    /// <summary>
    /// Size of the payload in bytes
    /// </summary>
    public int Size { get; init; }
}

/// <summary>
/// Custom JSON converter to handle base64 payload from CLI
/// </summary>
public class Base64PayloadConverter : JsonConverter<byte[]>
{
    public override byte[] Read(ref Utf8JsonReader reader, Type typeToConvert, JsonSerializerOptions options)
    {
        if (reader.TokenType == JsonTokenType.String)
        {
            var base64String = reader.GetString();
            if (string.IsNullOrEmpty(base64String))
                return Array.Empty<byte>();

            try
            {
                return Convert.FromBase64String(base64String);
            }
            catch (FormatException)
            {
                // If it's not valid base64, treat as UTF8 string
                return System.Text.Encoding.UTF8.GetBytes(base64String);
            }
        }

        throw new JsonException($"Expected string token for base64 payload, got {reader.TokenType}");
    }

    public override void Write(Utf8JsonWriter writer, byte[] value, JsonSerializerOptions options)
    {
        writer.WriteStringValue(Convert.ToBase64String(value));
    }
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