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
        _logger.LogDebug("Stored event {EventId} for customer {CustomerId}", mpcEvent.Id, mpcEvent.CustomerId);
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

    public Task<List<MpcEvent>> GetRecentAsync(string customerId, int limit = 100, CancellationToken cancellationToken = default)
    {
        var recentEvents = _events
            .Where(e => e.CustomerId == customerId)
            .OrderByDescending(e => e.Timestamp)
            .Take(limit)
            .ToList();

        _logger.LogDebug("Retrieved {Count} recent events for customer {CustomerId}", recentEvents.Count, customerId);
        return Task.FromResult(recentEvents);
    }

    public Task<List<MpcEvent>> GetByTimeRangeAsync(string customerId, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default)
    {
        var events = _events
            .Where(e => e.CustomerId == customerId &&
                       e.Timestamp >= startTime &&
                       e.Timestamp <= endTime)
            .OrderByDescending(e => e.Timestamp)
            .ToList();

        _logger.LogDebug("Retrieved {Count} events for customer {CustomerId} in time range {StartTime} to {EndTime}",
            events.Count, customerId, startTime, endTime);

        return Task.FromResult(events);
    }

    public Task<ActivityStats> GetStatsAsync(string customerId, CancellationToken cancellationToken = default)
    {
        var customerEvents = _events.Where(e => e.CustomerId == customerId).ToList();

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

        _logger.LogDebug("Generated stats for customer {CustomerId}: {TotalEvents} events, {UniqueMethods} methods",
            customerId, stats.TotalEvents, stats.UniqueMethods);

        return Task.FromResult(stats);
    }
}