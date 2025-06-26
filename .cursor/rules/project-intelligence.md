# Kilometers.ai - Project Intelligence & Patterns

## Core Project Understanding

### What is Kilometers.ai?
Kilometers.ai is an AI agent monitoring system that wraps MCP (Model Context Protocol) servers to provide visibility into AI tool usage, costs, and security risks. Think of it as a "digital odometer" for AI agents.

### Critical Architecture Pattern
```
AI Tool → km CLI Wrapper → Original MCP Server → Events → Azure API → Dashboard
```

The CLI must be completely transparent - zero impact on existing AI workflows.

## Development Priorities & Patterns

### Phase-Based Development
1. **Phase 1 (Current)**: CLI wrapper in Go - transparent MCP monitoring
2. **Phase 2**: .NET 9 API on Azure - event processing and storage  
3. **Phase 3**: React dashboard - real-time insights
4. **Phase 4**: Production deployment and CI/CD
5. **Phase 5**: Launch and scale

**Rule**: Always work in phases. Don't jump ahead until current phase is solid.

### Technology Decisions (Locked In)
- **CLI**: Go 1.24.4 (cross-platform, single binary, minimal dependencies)
- **API**: .NET 9 Minimal APIs (performance, Azure integration)
- **Database**: PostgreSQL on Azure (JSONB, time-series data)
- **Infrastructure**: Azure + Terraform (enterprise-ready)
- **Frontend**: React + Tailwind (modern, fast)

**Rule**: These decisions are final. Don't second-guess the stack.

## Code Quality Standards

### Performance Requirements (Non-Negotiable)
- CLI overhead: <5ms per MCP interaction
- API response: <100ms for event ingestion
- Dashboard load: <2s initial page load
- Throughput: 1000+ events/second per customer

**Rule**: Measure performance early and often. These are hard requirements.

### Security Patterns
- All data encrypted in transit (TLS 1.3)
- PII detection and automatic redaction
- API key authentication with rotation
- Audit trails for all administrative actions

**Rule**: Security by design, not as an afterthought.

## Development Workflow Patterns

### Memory Bank Maintenance
- Update after major milestones
- Keep activeContext.md current with immediate priorities
- Document architectural decisions in systemPatterns.md
- Track progress with specific metrics

**Rule**: Memory Bank is the source of truth. Always update after significant changes.

### Code Organization
```
cli/                    # Go CLI wrapper
├── main.go            # Entry point and process wrapper
├── events/            # Event structures and parsing
├── client/            # HTTP client for API communication
└── config/            # Configuration management

api/Kilometers.Api/     # .NET API
├── Program.cs         # Minimal API setup and DI
├── Domain/            # Core business logic
├── Infrastructure/    # Database, external services
└── Controllers/       # API endpoints (if needed)
```

**Rule**: Clear separation of concerns. Domain logic isolated from infrastructure.

### Testing Strategy
- CLI: Mock MCP servers for unit tests
- API: In-memory database for fast tests
- Integration: Docker Compose for full stack
- E2E: Real MCP servers in test environment

**Rule**: Test the critical path first (CLI wrapping, event ingestion).

## Business Context Awareness

### Target Users
- **Primary**: Developers using AI coding assistants (Cursor, Claude)
- **Secondary**: Teams managing AI infrastructure costs
- **Enterprise**: Organizations needing AI governance and compliance

**Rule**: Optimize for developer experience first. Enterprise features come later.

### Success Metrics That Matter
- Day 1: CLI wrapper functional
- Day 7: 3 paying customers
- Day 30: 100 customers ($4,900 MRR)

**Rule**: Focus on customer value over technical elegance.

## Common Pitfalls to Avoid

### CLI Development
- ❌ Don't modify MCP protocol messages
- ❌ Don't introduce noticeable latency
- ❌ Don't require configuration for basic usage
- ✅ Be completely transparent to existing workflows

### API Development  
- ❌ Don't over-engineer the domain model initially
- ❌ Don't ignore performance for event ingestion
- ❌ Don't forget about background processing
- ✅ Optimize for high-throughput writes, fast reads

### Infrastructure
- ❌ Don't start with complex multi-region setup
- ❌ Don't ignore monitoring and alerting
- ❌ Don't hardcode configuration values
- ✅ Start simple, scale based on real usage

## Key Design Decisions

### Why Go for CLI?
- Single binary distribution (no runtime dependencies)
- Excellent cross-platform support
- Perfect for process management and pipes
- Fast compilation and small binaries

### Why .NET 9 for API?
- Minimal APIs for high performance
- Excellent Azure integration
- Strong typing and async/await
- Great tooling and deployment story

### Why Event Sourcing?
- Perfect for audit trails and replay
- Enables rich analytics and insights
- Supports real-time and batch processing
- Immutable events provide data integrity

## Project Evolution Notes

### Current Status (Memory Bank Initialization)
- Project structure established
- Technology stack decided
- Functional specification complete
- Ready to begin CLI implementation

### Next Critical Decisions
1. CLI event batching strategy
2. API authentication mechanism  
3. Database schema optimization
4. Error handling approaches

**Rule**: Document these decisions as they're made. Update .cursor/rules with new patterns.

---

*This file grows with the project. Add new patterns, preferences, and insights as development progresses.* 