using BCrypt.Net;
using Kilometers.Api.Models;

namespace Kilometers.Api.Services;

public class CustomerService : ICustomerService
{
    private readonly ILogger<CustomerService> _logger;
    private readonly IConfiguration _configuration;

    public CustomerService(ILogger<CustomerService> logger, IConfiguration configuration)
    {
        _logger = logger;
        _configuration = configuration;
    }

    public async Task<Customer?> ValidateApiKeyAsync(string apiKey)
    {
        // For now, validate against the terraform-generated API key
        // Later this will query a database
        var terraformApiKey = _configuration["TerraformApiKey"] ??
                             Environment.GetEnvironmentVariable("KILOMETERS_API_KEY");

        if (string.IsNullOrEmpty(terraformApiKey))
        {
            _logger.LogWarning("No terraform API key configured");
            return null;
        }

        // Simple comparison for now (in production, use BCrypt)
        if (apiKey != terraformApiKey)
        {
            _logger.LogWarning("Invalid API key provided");
            return null;
        }

        // Create customer from terraform key
        // Use a deterministic hash based on API key to ensure consistency
        var deterministicHash = Convert.ToBase64String(
            System.Security.Cryptography.SHA256.HashData(
                System.Text.Encoding.UTF8.GetBytes($"km_salt_{apiKey}")
            )
        );

        var customer = new Customer
        {
            ApiKeyHash = deterministicHash, // Consistent hash for storage/retrieval
            ApiKeyPrefix = $"km_{apiKey.Substring(0, Math.Min(8, apiKey.Length))}",
            Email = "terraform@kilometers.ai",
            Organization = "Terraform Bootstrap",
            LastUsedAt = DateTime.UtcNow
        };

        _logger.LogInformation("API key validated successfully for {Prefix}", customer.ApiKeyPrefix);
        return customer;
    }

    public async Task<Customer> CreateCustomerAsync(string apiKey, string? email = null, string? organization = null)
    {
        var customer = new Customer
        {
            ApiKeyHash = BCrypt.Net.BCrypt.HashPassword(apiKey),
            ApiKeyPrefix = $"km_{apiKey.Substring(0, Math.Min(8, apiKey.Length))}",
            Email = email,
            Organization = organization,
            CreatedAt = DateTime.UtcNow,
            IsActive = true
        };

        // TODO: Store in database when we add persistence
        _logger.LogInformation("Created new customer {Prefix}", customer.ApiKeyPrefix);
        return customer;
    }
}