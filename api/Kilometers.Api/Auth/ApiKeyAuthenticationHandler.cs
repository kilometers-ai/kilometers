using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;
using System.Security.Claims;
using System.Text.Encodings.Web;
using Kilometers.Api.Services;

namespace Kilometers.Api.Auth;

public class ApiKeyAuthenticationHandler : AuthenticationHandler<ApiKeyAuthenticationSchemeOptions>
{
    private readonly ICustomerService _customerService;

    public ApiKeyAuthenticationHandler(
        IOptionsMonitor<ApiKeyAuthenticationSchemeOptions> options,
        ILoggerFactory logger,
        UrlEncoder encoder,
        ICustomerService customerService) : base(options, logger, encoder)
    {
        _customerService = customerService;
    }

    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
        {
            return AuthenticateResult.Fail("Missing Authorization header");
        }

        var authValue = authHeader.FirstOrDefault();
        if (!authValue?.StartsWith("Bearer ") == true)
        {
            return AuthenticateResult.Fail("Invalid Authorization scheme");
        }

        var apiKey = authValue.Substring("Bearer ".Length).Trim();
        if (string.IsNullOrEmpty(apiKey))
        {
            return AuthenticateResult.Fail("Empty API key");
        }

        var customer = await _customerService.ValidateApiKeyAsync(apiKey);
        if (customer == null)
        {
            return AuthenticateResult.Fail("Invalid API key");
        }

        var claims = new[]
        {
            new Claim("api_key_hash", customer.ApiKeyHash),
            new Claim("api_key_prefix", customer.ApiKeyPrefix),
            new Claim(ClaimTypes.Email, customer.Email ?? ""),
            new Claim("organization", customer.Organization ?? ""),
            new Claim("created_at", customer.CreatedAt.ToString("O"))
        };

        var identity = new ClaimsIdentity(claims, Scheme.Name);
        var principal = new ClaimsPrincipal(identity);

        return AuthenticateResult.Success(new AuthenticationTicket(principal, Scheme.Name));
    }
}