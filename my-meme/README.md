# My Meme

My Meme is a small agent application built on DeepSeek Harness. It selects between reaction GIF search and custom meme generation, then uses explicit routing, fallback, and clarification rules to complete the request.

This repository is also a learning project for agent application engineering. The project documentation is the source of truth for current behavior and planned work; coding agents should read it before making changes.

## Read first

- [Architecture](docs/architecture.md): runtime components, boundaries, and agent behavior.
- [Evaluations](docs/evals.md): E1–E5 behavior specifications and the current manual eval workflow.
- [Learning roadmap](docs/learning-roadmap.md): completed topics, current focus, and deferred topics.

## Current status

### Implemented and verified

- DeepSeek Harness runs the agent and records session trajectories.
- The `meme-selection` Skill defines content-type selection, tool routing, clarification, fallback, and stop conditions.
- The `meme-tools` plugin provides:
  - `search_memes`: searches Memegen templates.
  - `generate_meme`: generates a captioned image from a valid Memegen template ID.
  - `search_giphy`: searches GIPHY for reaction GIFs.
- Agent behavior has been inspected through Harness trajectories.
- A deterministic evaluator checks required tools, forbidden tools, and tool ordering.
- The E1–E5 behavior suite has been run successfully against manually exported session JSONL files.
- `sdk-smoke.py` verifies that an SDK-launched Harness instance can load the Skill and all three tools.

### Current limitations

- Eval prompts are still run manually in isolated Harness sessions.
- Session JSONL is still exported and associated with cases manually.
- The evaluator checks tool-call behavior, not meme relevance, tone, visual quality, or tool-result quality.
- The application relies on conversation history for short multi-turn edits; it has no explicit task-state store or long-term memory system.
- RAG, MCP integration, and multi-agent orchestration are not implemented.

### Next step

Build the Automated Eval Runner:

```text
cases.json prompt
  -> isolated Harness session
  -> My Meme agent execution
  -> session events
  -> deterministic evaluator
  -> suite report
```

The runner must use the same Skill, tools, and agent configuration as the interactive My Meme environment.

## Project layout

```text
my-meme/
├── README.md
├── docs/
│   ├── architecture.md
│   ├── evals.md
│   └── learning-roadmap.md
├── evals/
│   ├── cases.json
│   ├── behavior-evaluator.mjs
│   └── E*-session*.jsonl
├── plugins/
│   ├── cordis.yml
│   └── src/meme-plugin.ts
└── sdk-smoke.py
```

The `meme-selection` Skill currently lives at the repository-level path `.agents/skills/meme-selection/SKILL.md`, where DeepSeek Harness discovers it.

## Local requirements

- A working DeepSeek Harness checkout and runtime.
- Node.js for the deterministic evaluator.
- Python and the local Harness Python SDK for `sdk-smoke.py`.
- `GIPHY_API_KEY` for live GIPHY search.
- Network access for the Memegen and GIPHY APIs.

## Run the current eval suite

After manually running each prompt in a separate session and exporting its JSONL log:

```bash
node evals/behavior-evaluator.mjs \
  E1=evals/E1-session.jsonl \
  E2=evals/E2-session.jsonl \
  E3=evals/E3-session.jsonl \
  E4=evals/E4-session.jsonl \
  E5=evals/E5-session.jsonl
```

Exit codes:

- `0`: every assigned case passed.
- `1`: one or more behavior checks failed.
- `2`: evaluator input or execution error.

See [docs/evals.md](docs/evals.md) for case definitions and interpretation.
