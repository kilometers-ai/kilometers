using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kilometers.Api.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCustomerIdAddApiKeyHash : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CustomerId",
                table: "events",
                newName: "CustomerApiKeyHash");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CustomerApiKeyHash",
                table: "events",
                newName: "CustomerId");
        }
    }
}
