using System.Collections.Concurrent;
using Kilometers.Api.Domain.Events;
using Kilometers.Api.Domain.Services;

namespace Kilometers.Api.Infrastructure.EventStore;

/// <summary>
/// In-memory implementation of IEventStore for development and testing
/// Will be replaced with PostgreSQL implementation in production
/// </summary>
public class InMemoryEventStore : IEventStore
{
    private readonly ConcurrentBag<MpcEvent> _events = new();
    private readonly ILogger<InMemoryEventStore> _logger;

    public InMemoryEventStore(ILogger<InMemoryEventStore> logger)
    {
        _logger = logger;
    }

    public Task AppendAsync(MpcEvent mpcEvent, CancellationToken cancellationToken = default)
    {
        _events.Add(mpcEvent);
        _logger.LogDebug("Stored event {EventId} for customer {CustomerApiKeyHash}", mpcEvent.Id, mpcEvent.CustomerApiKeyHash);
        return Task.CompletedTask;
    }

    public Task AppendBatchAsync(IEnumerable<MpcEvent> events, CancellationToken cancellationToken = default)
    {
        var eventList = events.ToList();
        foreach (var evt in eventList)
        {
            _events.Add(evt);
        }

        _logger.LogDebug("Stored batch of {Count} events", eventList.Count);
        return Task.CompletedTask;
    }

    public Task<List<MpcEvent>> GetRecentAsync(string customerApiKeyHash, int limit = 100, CancellationToken cancellationToken = default)
    {
        var recentEvents = _events
            .Where(e => e.CustomerApiKeyHash == customerApiKeyHash)
            .OrderByDescending(e => e.Timestamp)
            .Take(limit)
            .ToList();

        _logger.LogDebug("Retrieved {Count} recent events for customer {CustomerApiKeyHash}", recentEvents.Count, customerApiKeyHash);
        return Task.FromResult(recentEvents);
    }

    public Task<List<MpcEvent>> GetByTimeRangeAsync(string customerApiKeyHash, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default)
    {
        var events = _events
            .Where(e => e.CustomerApiKeyHash == customerApiKeyHash &&
                       e.Timestamp >= startTime &&
                       e.Timestamp <= endTime)
            .OrderByDescending(e => e.Timestamp)
            .ToList();

        _logger.LogDebug("Retrieved {Count} events for customer {CustomerApiKeyHash} in time range {StartTime} to {EndTime}",
            events.Count, customerApiKeyHash, startTime, endTime);

        return Task.FromResult(events);
    }

    public Task<ActivityStats> GetStatsAsync(string customerApiKeyHash, CancellationToken cancellationToken = default)
    {
        var customerEvents = _events.Where(e => e.CustomerApiKeyHash == customerApiKeyHash).ToList();

        if (!customerEvents.Any())
        {
            return Task.FromResult(new ActivityStats());
        }

        var stats = new ActivityStats
        {
            TotalEvents = customerEvents.Count,
            UniqueMethods = customerEvents.Where(e => !string.IsNullOrEmpty(e.Method))
                                        .Select(e => e.Method!)
                                        .Distinct()
                                        .Count(),
            TotalCost = customerEvents.Sum(e => e.Metadata.CostEstimate ?? 0),
            AverageResponseTime = 0, // TODO: Calculate from request/response pairs
            StartTime = customerEvents.Min(e => e.Timestamp),
            EndTime = customerEvents.Max(e => e.Timestamp)
        };

        _logger.LogDebug("Generated stats for customer {CustomerApiKeyHash}: {TotalEvents} events, {UniqueMethods} methods",
            customerApiKeyHash, stats.TotalEvents, stats.UniqueMethods);

        return Task.FromResult(stats);
    }
}