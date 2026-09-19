# Memory Leases

Memory leases are a concurrency-control mechanism for Mitii's memory pipeline. They prevent two processes (e.g. an interactive session and a cron job) from mutating the same memory store simultaneously.

## Semantics (agentmemory-inspired)

- **Acquire with TTL** — default 10 minutes, max 60 minutes
- **Same holder re-acquires** — the lease is extended, not re-contended
- **Different holder** — must wait for TTL expiry or explicit release

## Operations

| Operation | Used by |
|---|---|
| `memory:consolidate` | `runMemoryConsolidateWithLease` / cron hosts |
| `memory:approve_pending` | `approvePendingMemory` |

## Why leases exist

Without leases, a nightly `memory-consolidate` cron job could race with an interactive session that is writing new memories. The lease ensures only one holder mutates at a time, and the TTL prevents a crashed holder from blocking forever.

## Related

- [Memory Checkpoints](/understanding/agent-intelligence/memory-checkpoints) — how memory is stored and retrieved
- [Memory](/understanding/agent-intelligence/memory) — memory pipeline overview
- [Automation](/automation/) — cron jobs that use leases
