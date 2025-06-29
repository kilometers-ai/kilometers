using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Kilometers.Api.Domain.Events;
using Kilometers.Api.Domain.Services;

namespace Kilometers.Api.Infrastructure.EventStore;

/// <summary>
/// PostgreSQL implementation of IEventStore for production use
/// </summary>
public class PostgresEventStore : IEventStore
{
    private readonly KilometersDbContext _context;
    private readonly ILogger<PostgresEventStore> _logger;

    public PostgresEventStore(KilometersDbContext context, ILogger<PostgresEventStore> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task AppendAsync(MpcEvent mpcEvent, CancellationToken cancellationToken = default)
    {
        var entity = new EventEntity
        {
            Id = mpcEvent.Id,
            Timestamp = mpcEvent.Timestamp,
            CustomerApiKeyHash = mpcEvent.CustomerApiKeyHash,
            Direction = mpcEvent.Direction,
            Method = mpcEvent.Method,
            Payload = mpcEvent.Payload,
            Size = mpcEvent.Size,
            ProcessedAt = mpcEvent.Metadata.ProcessedAt,
            Source = mpcEvent.Metadata.Source,
            Version = mpcEvent.Metadata.Version,
            RiskScore = mpcEvent.Metadata.RiskScore,
            CostEstimate = mpcEvent.Metadata.CostEstimate
        };

        _context.Events.Add(entity);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogDebug("Stored event {EventId} for customer {CustomerApiKeyHash}", mpcEvent.Id, mpcEvent.CustomerApiKeyHash);
    }

    public async Task AppendBatchAsync(IEnumerable<MpcEvent> events, CancellationToken cancellationToken = default)
    {
        var entities = events.Select(evt => new EventEntity
        {
            Id = evt.Id,
            Timestamp = evt.Timestamp,
            CustomerApiKeyHash = evt.CustomerApiKeyHash,
            Direction = evt.Direction,
            Method = evt.Method,
            Payload = evt.Payload,
            Size = evt.Size,
            ProcessedAt = evt.Metadata.ProcessedAt,
            Source = evt.Metadata.Source,
            Version = evt.Metadata.Version,
            RiskScore = evt.Metadata.RiskScore,
            CostEstimate = evt.Metadata.CostEstimate
        }).ToList();

        _context.Events.AddRange(entities);
        await _context.SaveChangesAsync(cancellationToken);

        _logger.LogDebug("Stored batch of {Count} events", entities.Count);
    }

    public async Task<List<MpcEvent>> GetRecentAsync(string customerApiKeyHash, int limit = 100, CancellationToken cancellationToken = default)
    {
        var entities = await _context.Events
            .Where(e => e.CustomerApiKeyHash == customerApiKeyHash)
            .OrderByDescending(e => e.Timestamp)
            .Take(limit)
            .ToListAsync(cancellationToken);

        var events = entities.Select(EntityToEvent).ToList();

        _logger.LogDebug("Retrieved {Count} recent events for customer {CustomerApiKeyHash}", events.Count, customerApiKeyHash);
        return events;
    }

    public async Task<List<MpcEvent>> GetByTimeRangeAsync(string customerApiKeyHash, DateTime startTime, DateTime endTime, CancellationToken cancellationToken = default)
    {
        var entities = await _context.Events
            .Where(e => e.CustomerApiKeyHash == customerApiKeyHash &&
                       e.Timestamp >= startTime &&
                       e.Timestamp <= endTime)
            .OrderByDescending(e => e.Timestamp)
            .ToListAsync(cancellationToken);

        var events = entities.Select(EntityToEvent).ToList();

        _logger.LogDebug("Retrieved {Count} events for customer {CustomerApiKeyHash} in time range {StartTime} to {EndTime}",
            events.Count, customerApiKeyHash, startTime, endTime);

        return events;
    }

    public async Task<ActivityStats> GetStatsAsync(string customerApiKeyHash, CancellationToken cancellationToken = default)
    {
        var customerEvents = await _context.Events
            .Where(e => e.CustomerApiKeyHash == customerApiKeyHash)
            .ToListAsync(cancellationToken);

        if (!customerEvents.Any())
        {
            return new ActivityStats();
        }

        var stats = new ActivityStats
        {
            TotalEvents = customerEvents.Count,
            UniqueMethods = customerEvents.Where(e => !string.IsNullOrEmpty(e.Method))
                                        .Select(e => e.Method!)
                                        .Distinct()
                                        .Count(),
            TotalCost = customerEvents.Sum(e => e.CostEstimate ?? 0),
            AverageResponseTime = 0, // TODO: Calculate from request/response pairs
            StartTime = customerEvents.Min(e => e.Timestamp),
            EndTime = customerEvents.Max(e => e.Timestamp)
        };

        _logger.LogDebug("Generated stats for customer {CustomerApiKeyHash}: {TotalEvents} events, {UniqueMethods} methods",
            customerApiKeyHash, stats.TotalEvents, stats.UniqueMethods);

        return stats;
    }

    private static MpcEvent EntityToEvent(EventEntity entity)
    {
        return new MpcEvent
        {
            Id = entity.Id,
            Timestamp = entity.Timestamp,
            CustomerApiKeyHash = entity.CustomerApiKeyHash,
            Direction = entity.Direction,
            Method = entity.Method,
            Payload = entity.Payload,
            Size = entity.Size,
            Metadata = new EventMetadata
            {
                ProcessedAt = entity.ProcessedAt,
                Source = entity.Source,
                Version = entity.Version,
                RiskScore = entity.RiskScore,
                CostEstimate = entity.CostEstimate
            }
        };
    }
}