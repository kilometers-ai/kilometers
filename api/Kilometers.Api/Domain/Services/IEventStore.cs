using Kilometers.Api.Domain.Events;

namespace Kilometers.Api.Domain.Services;

/// <summary>
/// Repository interface for storing and retrieving MCP events
/// Part of the domain layer - implementation will be in infrastructure
/// </summary>
public interface IEventStore
{
    /// <summary>
    /// Store a single MCP event
    /// </summary>
    /// <param name="mpcEvent">The event to store</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task AppendAsync(MpcEvent mpcEvent, CancellationToken cancellationToken = default);

    /// <summary>
    /// Store multiple MCP events in a batch for efficiency
    /// </summary>
    /// <param name="events">Collection of events to store</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Task representing the async operation</returns>
    Task AppendBatchAsync(IEnumerable<MpcEvent> events, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get recent events for a customer
    /// </summary>
    /// <param name="customerId">Customer identifier</param>
    /// <param name="limit">Maximum number of events to return</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of recent events</returns>
    Task<List<MpcEvent>> GetRecentAsync(string customerId, int limit = 100, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get events for a customer within a time range
    /// </summary>
    /// <param name="customerId">Customer identifier</param>
    /// <param name="startTime">Start of time range</param>
    /// <param name="endTime">End of time range</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>List of events in the time range</returns>
    Task<List<MpcEvent>> GetByTimeRangeAsync(string customerId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default);

    /// <summary>
    /// Get aggregated statistics for a customer
    /// </summary>
    /// <param name="customerId">Customer identifier</param>
    /// <param name="cancellationToken">Cancellation token</param>
    /// <returns>Activity statistics</returns>
    Task<ActivityStats> GetStatsAsync(string customerId, CancellationToken cancellationToken = default);
}

/// <summary>
/// Aggregated activity statistics for a customer
/// </summary>
public record ActivityStats
{
    /// <summary>
    /// Total number of events
    /// </summary>
    public int TotalEvents { get; init; }

    /// <summary>
    /// Number of unique methods used
    /// </summary>
    public int UniqueMethods { get; init; }

    /// <summary>
    /// Total estimated cost
    /// </summary>
    public decimal TotalCost { get; init; }

    /// <summary>
    /// Average response time in milliseconds
    /// </summary>
    public double AverageResponseTime { get; init; }

    /// <summary>
    /// Time range of the statistics
    /// </summary>
    public DateTime StartTime { get; init; }

    /// <summary>
    /// End time of the statistics
    /// </summary>
    public DateTime EndTime { get; init; }
}