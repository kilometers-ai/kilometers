using Microsoft.EntityFrameworkCore;

namespace Kilometers.Api.Infrastructure.EventStore;

/// <summary>
/// Entity Framework DbContext for Kilometers database
/// </summary>
public class KilometersDbContext : DbContext
{
    public KilometersDbContext(DbContextOptions<KilometersDbContext> options) : base(options)
    {
    }

    public DbSet<EventEntity> Events { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        modelBuilder.Entity<EventEntity>(entity =>
        {
            entity.ToTable("events");

            entity.HasKey(e => e.Id);

            entity.Property(e => e.Id)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Timestamp)
                .IsRequired();

            entity.Property(e => e.CustomerId)
                .HasMaxLength(255)
                .IsRequired();

            entity.Property(e => e.Direction)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.Method)
                .HasMaxLength(255);

            entity.Property(e => e.Payload)
                .IsRequired();

            entity.Property(e => e.Size)
                .IsRequired();

            entity.Property(e => e.ProcessedAt)
                .IsRequired();

            entity.Property(e => e.Source)
                .HasMaxLength(100)
                .IsRequired();

            entity.Property(e => e.Version)
                .HasMaxLength(50)
                .IsRequired();

            entity.Property(e => e.CostEstimate)
                .HasPrecision(10, 4);

            // Indexes for performance
            entity.HasIndex(e => new { e.CustomerId, e.Timestamp })
                .HasDatabaseName("idx_customer_timestamp")
                .IsDescending(false, true); // CustomerId ASC, Timestamp DESC

            entity.HasIndex(e => new { e.CustomerId, e.Method })
                .HasDatabaseName("idx_customer_method");

            entity.HasIndex(e => new { e.CustomerId, e.Direction })
                .HasDatabaseName("idx_customer_direction");
        });
    }
}

/// <summary>
/// Entity representing an MCP event in the database
/// </summary>
public class EventEntity
{
    public string Id { get; set; } = string.Empty;
    public DateTime Timestamp { get; set; }
    public string CustomerId { get; set; } = string.Empty;
    public string Direction { get; set; } = string.Empty;
    public string? Method { get; set; }
    public byte[] Payload { get; set; } = Array.Empty<byte>();
    public int Size { get; set; }
    public DateTime ProcessedAt { get; set; }
    public string Source { get; set; } = string.Empty;
    public string Version { get; set; } = string.Empty;
    public int? RiskScore { get; set; }
    public decimal? CostEstimate { get; set; }
}