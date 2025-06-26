using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Design;
using Kilometers.Api.Infrastructure.EventStore;

namespace Kilometers.Api.Infrastructure.Data;

/// <summary>
/// Design-time factory for creating DbContext instances for EF Core tools
/// This enables migrations to work without a running application
/// </summary>
public class DesignTimeDbContextFactory : IDesignTimeDbContextFactory<KilometersDbContext>
{
    public KilometersDbContext CreateDbContext(string[] args)
    {
        var optionsBuilder = new DbContextOptionsBuilder<KilometersDbContext>();

        // Use a default connection string for design-time operations
        // This will be overridden at runtime by the actual configuration
        optionsBuilder.UseNpgsql("Host=localhost;Database=kilometers_dev;Username=postgres;Password=postgres");

        return new KilometersDbContext(optionsBuilder.Options);
    }
}