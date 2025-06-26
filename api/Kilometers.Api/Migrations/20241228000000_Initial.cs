using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Kilometers.Api.Migrations
{
    /// <inheritdoc />
    public partial class Initial : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "events",
                columns: table => new
                {
                    Id = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Timestamp = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    CustomerId = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Direction = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    Method = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Payload = table.Column<byte[]>(type: "bytea", nullable: false),
                    Size = table.Column<int>(type: "integer", nullable: false),
                    ProcessedAt = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    Source = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    Version = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    RiskScore = table.Column<int>(type: "integer", nullable: true),
                    CostEstimate = table.Column<decimal>(type: "numeric(10,4)", precision: 10, scale: 4, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_events", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "idx_customer_direction",
                table: "events",
                columns: new[] { "CustomerId", "Direction" });

            migrationBuilder.CreateIndex(
                name: "idx_customer_method",
                table: "events",
                columns: new[] { "CustomerId", "Method" });

            migrationBuilder.CreateIndex(
                name: "idx_customer_timestamp",
                table: "events",
                columns: new[] { "CustomerId", "Timestamp" },
                descending: new[] { false, true });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "events");
        }
    }
}