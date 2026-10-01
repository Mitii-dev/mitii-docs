---
title: "Benchmark Results: Mitii AI Agent with Qwen 3.8 27B (45k Context Window)"
description: Mitii AI Agent with Qwen 3.8 27B scored an 89.41% overall pass rate across 170 full-stack engineering tasks with a 45,000-token context window.
sidebar: false
prev: false
next: false
---

# Benchmark Results: Mitii AI Agent with Qwen 3.8 27B (45k Context Window)


![Benchmark overview](/benchmark-score.png)

Mitii AI Agent, powered by the Qwen 3.8 27B model, represents a serious attempt to close that gap. In this benchmark run, we pushed the agent through 170 non-trivial, full-stack engineering tasks with an extended 45,000-token context window to see whether it could deliver on the promise of local-first, autonomous software development.

The results are encouraging: an overall pass rate of **89.41%** and a **GO** signal on the overall gate. But the details matter far more than the headline number. Let's break down exactly where Mitii excels, where it stumbles, and what this means for teams considering autonomous coding agents.

## Executive Summary

| Metric | Score / Result |
|---|---|
| **Run Status / Signal** | **GO** (Overall Gate Passed) |
| **Total Test Cases** | 170 |
| **Passed Cases** | 152 |
| **Failed Cases** | 18 |
| **Overall Pass Rate** | **89.41%** |
| **Total Input Tokens** | 6,477,217 tokens |
| **Total Output Tokens** | 220,426 tokens |
| **Avg. Execution Duration** | ~74.69 seconds / test case |

The headline: Mitii passed 152 of 170 test cases. That's a strong showing for an autonomous agent operating on real-world engineering tasks. But the 18 failures tell an equally important story about where the boundaries of current local-first AI agents still lie.

## Performance Breakdown

### 1. Difficulty Breakdown

| Level | Pass Rate | Passed / Total | Avg. Duration |
|---|---|---|---|
| **Easy** | 93.62% | 44 / 47 | 66.98s |
| **Medium** | 85.71% | 48 / 56 | 78.96s |
| **Hard** | 89.55% | 60 / 67 | 76.53s |

One of the more surprising findings: Mitii performed *better* on hard tasks (89.55%) than on medium ones (85.71%). This counterintuitive result likely stems from the nature of the tasks themselves—hard problems in this suite tended to be well-defined architectural challenges where the 45K context window provided decisive advantages, while medium tasks often involved ambiguous requirements or edge-case handling that tripped up the agent.

The easy tier, as expected, was the strongest at 93.62%. These tasks—simple component creation, straightforward bug fixes, and basic documentation—are where the agent operates with near-human reliability.

### 2. Test Suite Breakdown

| Suite Type | Pass Rate | Passed / Total | Avg. Duration |
|---|---|---|---|
| **Frontend** (next-app, react-vite) | **96.47%** | 82 / 85 | 43.80s |
| **Backend Services** | 77.27% | 34 / 44 | 110.77s |
| **Testing Infrastructure** | 91.30% | 21 / 23 | 101.17s |
| **CI/CD & DevOps** | 83.33% | 15 / 18 | 98.54s |

This is where the story gets interesting.

**Frontend development is Mitii's undisputed stronghold.** A 96.47% pass rate across 85 test cases—covering Next.js routing, React component creation, accessibility compliance, and metadata configuration—is genuinely impressive. What's more, the average execution time was just 43.80 seconds, nearly *three times faster* than backend tasks.

**Backend services remain the weak point.** At 77.27%, the agent struggled with API endpoints, interceptors, and database persistence. The average execution time ballooned to 110.77 seconds—more than double the frontend duration. This isn't just a Mitii problem; it reflects the broader difficulty of asynchronous, stateful backend workflows for autonomous agents.

**Testing infrastructure and CI/CD** landed in the middle, at 91.30% and 83.33% respectively, with execution times around the 100-second mark.

### 3. Capability Performance

| Capability | Success Rate | Passed / Total |
|---|---|---|
| **Documentation** (docs) | **100.0%** | 10 / 10 |
| **Retrieval** (retrieval) | **100.0%** | 10 / 10 |
| **Refactoring** (refactor) | **100.0%** | 7 / 7 |
| **Testing** (testing) | 94.12% | 32 / 34 |
| **Bug Fixes** (bugfix) | 89.19% | 33 / 37 |
| **Feature Implementation** (feature) | 86.05% | 37 / 43 |
| **DevOps** (devops) | 83.33% | 15 / 18 |
| **Capstone Apps** (capstone) | 75.00% | 3 / 4 |
| **System Robustness** (robustness) | 71.43% | 5 / 7 |

Three capabilities achieved a perfect 100%: **documentation**, **retrieval**, and **refactoring**. These are tasks where the agent can leverage its 45K context window to understand existing code and produce well-structured output without needing to reason about runtime behavior.

**Testing** followed closely at 94.12%, demonstrating that Mitii can write unit tests, integration tests, and test suites that actually work.

**Bug fixes** (89.19%) and **feature implementation** (86.05%) represent the core of everyday software engineering, and Mitii handled them with solid reliability.

The lower scores—**DevOps** (83.33%), **capstone apps** (75.00%), and **system robustness** (71.43%)—point to the frontier of what current autonomous agents can handle. Capstone apps require orchestrating multiple systems end-to-end. Robustness tasks demand handling failure modes and edge cases that are inherently difficult to anticipate.

## Key Takeaways & Analysis

### Strong Alignment in Frontend & Component Creation

Mitii scored **96.47%** on frontend routing, component creation, accessibility (a11y), and metadata configuration. The 45K context window allowed Qwen 3.8 27B to parse complex AST structures, layout hierarchies, and React hooks without losing instruction fidelity.

In practice, this means Mitii can look at a Next.js application, understand how pages are structured, identify where a new dynamic route should live, write the route file, add the necessary metadata export, ensure the component is accessible, and wire it into the existing navigation—all in a single autonomous pass.

**Example:** Given a task to "add a `/blog/[slug]` dynamic route with SEO metadata and accessible heading structure," Mitii would:

1. Parse the existing `pages/` or `app/` directory structure
2. Identify the routing convention in use (Pages Router vs. App Router)
3. Create the dynamic route file with `getStaticPaths` and `getStaticProps` (or the App Router equivalent)
4. Add `<Head>` metadata with title, description, and Open Graph tags
5. Ensure the heading hierarchy follows a11y best practices (single H1, sequential H2s)
6. Write a basic test to verify the route renders

That's a multi-file, multi-step task executed without human intervention—and it passed.

### Deep Multi-File Reasoning

With 45,000 tokens of context, the agent successfully performed structural workspace modifications. This included:

- **Adding dynamic routes** across Next.js applications
- **Creating standalone hooks** like `useDebounce` with proper TypeScript generics and cleanup logic
- **Configuring error boundaries** with fallback UI and logging integration
- **Writing unit test suites** that cover edge cases and mock external dependencies

The 45K context window is the unsung hero here. Without it, the agent would lose track of file relationships, import paths, and type definitions across a large codebase. With it, Mitii can maintain a coherent mental model of the project as it works.

### Areas for Improvement

Backend asynchronous workflows—API endpoints, interceptors, and database persistence—exhibited higher execution times (averaging over **110 seconds**) and a slightly lower success rate (**77.27%**). Complex state isolation and long-running observational tasks accounted for the majority of the 18 failed cases.

This isn't surprising. Backend tasks often involve:

- **Stateful interactions** that are hard to verify without running the full stack
- **Database transactions** that require understanding schema, migrations, and ORM behavior
- **Asynchronous race conditions** that only manifest under specific timing conditions
- **External service mocking** that adds complexity to the reasoning process

The 110-second average execution time reflects the agent's need to reason more deeply, retry failed approaches, and verify its work against multiple constraints.

## What This Means for Teams Building with Mitii

If you're considering Mitii AI Agent for your engineering workflow, the benchmark suggests a clear division of labor:

**Where Mitii shines:**

- Frontend development (React, Next.js, component libraries)
- Documentation and code retrieval
- Refactoring existing code
- Writing tests
- Bug fixes in well-scoped areas

**Where human oversight still matters:**

- Backend API design and database schema changes
- CI/CD pipeline modifications
- End-to-end capstone applications
- Robustness and failure-mode handling

The **GO** signal on the overall gate means Mitii is production-ready for the categories where it performs well. For backend-heavy tasks, it's best used as a force multiplier—generating initial implementations that a human engineer reviews and hardens.

## Conclusion

Mitii AI Agent with Qwen 3.8 27B and a 45K context window represents a meaningful step forward for local-first autonomous coding agents. An **89.41% overall pass rate** across 170 real-world engineering tasks—with **96.47% on frontend** and **100% on documentation, retrieval, and refactoring**—demonstrates that the combination of a capable model and a deep context window can handle genuinely useful work.

The 18 failures are instructive, not disqualifying. They highlight the remaining challenges: backend state isolation, long-running observational tasks, and system robustness. These are hard problems for any agent, and Mitii's performance suggests they're within reach as models and context windows continue to improve.

For teams looking to augment their engineering capacity with an autonomous agent that runs locally, Mitii delivers where it counts—and gives you a clear map of where to keep your human engineers in the loop.

---

*Benchmark conducted on Mitii AI Agent with Qwen 3.8 27B, 45K context window. Full results available upon request.*

[← Back to all posts](/blog/)
