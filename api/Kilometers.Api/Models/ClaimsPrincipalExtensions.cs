using System.Security.Claims;

namespace Kilometers.Api.Models;

public static class ClaimsPrincipalExtensions
{
    public static string? GetApiKeyHash(this ClaimsPrincipal principal)
    {
        return principal.FindFirst("api_key_hash")?.Value;
    }

    public static string? GetApiKeyPrefix(this ClaimsPrincipal principal)
    {
        return principal.FindFirst("api_key_prefix")?.Value;
    }

    public static string? GetCustomerEmail(this ClaimsPrincipal principal)
    {
        return principal.FindFirst(ClaimTypes.Email)?.Value;
    }

    public static string? GetCustomerOrganization(this ClaimsPrincipal principal)
    {
        return principal.FindFirst("organization")?.Value;
    }
}