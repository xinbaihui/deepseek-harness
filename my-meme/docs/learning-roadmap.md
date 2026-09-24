# Learning Roadmap

## Goal

Use My Meme to learn agent application engineering through small, observable experiments: understand a concept, inspect the current behavior, change one variable, run the agent, evaluate the trajectory, and only then choose the next step.

## Progress

| Stage | Status | Evidence in My Meme |
|---|---|---|
| Agent fundamentals | Completed | A model chooses actions and iterates on tool observations toward a user goal. |
| Skill | Completed | `meme-selection` contains reusable routing and behavior policy. |
| Tool | Completed | Three structured external actions are exposed through `meme-tools`. |
| Routing | Completed | Requests route among GIF search, template search, generation, and clarification. |
| Agent Loop / Trajectory | Completed | Decisions, tool calls, observations, and stop behavior were inspected in Harness sessions. |
| State / Session | Completed at concept level | Harness sessions are used; explicit task state was evaluated and intentionally deferred. |
| Memory | Completed at boundary-design level | Conversation history, explicit state, and long-term memory have been distinguished; no memory system was added. |
| Error Handling / Fallback | Completed | Empty results, tool errors, retries, alternative paths, and intent preservation were tested. |
| HITL | Completed | Clarification is required only for material, non-delegated ambiguity. |
| Evaluation | Completed | Expected agent behavior is expressed as testable cases. |
| Deterministic Evaluator | Completed | Tool presence, absence, and ordering are checked from session events. |
| Eval Suite | Completed | E1–E5 run through one evaluator and produce a suite summary. |
| Automated Eval Runner | **Current next step** | SDK composition smoke test exists; end-to-end case execution is not yet automated. |

## Current next step

Build the smallest end-to-end Automated Eval Runner:

```text
prompt -> isolated agent session -> trajectory -> evaluator -> report
```

Success criteria:

- prompts come from `evals/cases.json`;
- every case receives an isolated session;
- the SDK-launched agent matches the interactive My Meme composition;
- the runner captures session events without manual export;
- the existing deterministic evaluator remains the source of PASS/FAIL behavior rules;
- the result preserves exit codes suitable for future CI use.

## Learning principles

- Keep project reasoning, decisions, implementation, and verification in the same long-running Work context when possible.
- Treat these documents and the repository as the durable source of truth; conversation history alone is not project documentation.
- Prefer one-variable experiments and compare against a baseline.
- Use deterministic checks whenever facts in the trajectory are sufficient.
- Add LLM-as-a-judge only for genuinely semantic or subjective quality requirements.
- Do not add explicit state, memory, tools, or frameworks before a demonstrated product need.
- Preserve established eval cases; add a new case for a new behavior instead of silently changing the old specification.

## Deferred topics

### RAG

RAG is intentionally paused. Meme selection does not currently provide a strong retrieval-grounding problem, so RAG should be learned in a future project with a real private or domain-specific knowledge corpus, citations, and measurable retrieval quality.

### MCP

MCP integration is not implemented. Revisit it when My Meme needs to consume tools or resources supplied by an MCP server and the integration teaches something beyond the existing plugin tools.

### Multi-agent systems

Multi-agent orchestration is not implemented. The current workflow is small enough for one agent with explicit Skills, Tools, and evaluations. Revisit multi-agent design only when independent roles or parallel work provide a measurable benefit.

## Later, after the Automated Eval Runner

Possible follow-up work, in priority order and only when justified:

1. Add automatic repeated-run reliability measurements for selected cases.
2. Evaluate tool results and final artifact validity, not only tool calls.
3. Add semantic relevance and tone evaluation where deterministic rules are insufficient.
4. Track latency and external API cost.
5. Introduce explicit task state if longer editing workflows make history reconstruction unreliable.
