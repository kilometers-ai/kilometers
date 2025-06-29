using Kilometers.Api.Models;

namespace Kilometers.Api.Services;

public interface ICustomerService
{
    Task<Customer?> ValidateApiKeyAsync(string apiKey);
    Task<Customer> CreateCustomerAsync(string apiKey, string? email = null, string? organization = null);
}