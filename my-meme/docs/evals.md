# Evaluations

## Purpose

My Meme evaluations test agent behavior, not only the final answer. The current suite verifies tool selection, prohibited actions, and clarification order from DeepSeek Harness session trajectories.

## Current evaluation pipeline

```text
cases.json prompt
  -> human runs prompt in a new Harness session
  -> agent produces a trajectory
  -> human exports session JSONL
  -> behavior-evaluator.mjs reads tool/call events
  -> case result and suite summary
```

This is a manual runner with an automated deterministic evaluator.

## E1–E5 behavior suite

`evals/cases.json` is the behavior specification. Its prompts are currently human-executed test inputs.

| Case | Behavior under test | Deterministic expectation |
|---|---|---|
| E1 | Find an existing “This is Fine” template. | Require `search_memes`; forbid `search_giphy` and `generate_meme`. |
| E2 | Find a crying reaction GIF. | Require `search_giphy`; forbid `search_memes` and `generate_meme`. |
| E3 | Generate from the explicit template ID `fine`. | Require `generate_meme`; forbid both search tools. |
| E4 | User delegates the content-type choice. | Forbid `ask_user_question`; do not constrain the valid route chosen. |
| E5 | User asks for something visual without choosing GIF or meme. | Require `ask_user_question` before the first content tool. |

E4 intentionally preserves agent autonomy. The evaluator enforces the product requirement—do not ask after delegation—without overfitting to one previously successful route.

## Deterministic evaluator

`evals/behavior-evaluator.mjs` reads newline-delimited session events and extracts ordered `tool/call` records:

```text
[{ name, seq }, ...]
```

It supports three constraints:

- `requiredTools`: every named tool must appear.
- `forbiddenTools`: none of the named tools may appear.
- `requiredBefore`: a required tool must occur before the first matching target tool.

The evaluator produces a reason for every PASS or FAIL and prints suite totals and pass rate. It uses event `seq`, not physical JSONL line numbers, to determine order.

### Run

```bash
node evals/behavior-evaluator.mjs \
  E1=evals/E1-session.jsonl \
  E2=evals/E2-session.jsonl \
  E3=evals/E3-session.jsonl \
  E4=evals/E4-session.jsonl \
  E5=evals/E5-session.jsonl
```

Exit codes:

- `0`: all assigned cases pass.
- `1`: at least one behavior case fails.
- `2`: invalid input or evaluator execution error.

## Verified results

- The evaluator has been checked with known-good and known-bad E5 trajectories.
- E5 initially passed 2 of 5 isolated manual runs.
- After the Skill rule was strengthened with a condition, required action, forbidden pre-clarification actions, and a delegation exception, E5 passed 5 of 5 isolated runs.
- The current E1–E5 manually exported suite has produced a 5/5 pass result.

These are small-sample development results, not a production reliability guarantee.

## SDK smoke test

`sdk-smoke.py` verifies agent composition through the Harness Python SDK. It checks that the SDK-launched request context contains the `meme-selection` Skill and all three meme tools.

This smoke test is not the Automated Eval Runner. It verifies configuration availability, not E1–E5 behavior end to end.

## Current limitations

- A person must create an isolated session, enter each prompt, export JSONL, and map the file to its case ID.
- The evaluator cannot verify that the exported session was created from the prompt recorded in `cases.json`.
- Required tool presence does not prove tool success or a valid final artifact.
- The suite does not score relevance, humor, tone, image quality, latency, cost, or repeated-run reliability automatically.
- Five distinct passing cases produce a suite pass rate; repeated executions of one case produce a reliability rate. These metrics must not be conflated.

## Next step: Automated Eval Runner

The next implementation should:

1. Read each prompt from `evals/cases.json`.
2. Create an isolated Harness session for each case.
3. Launch the same Skill, tools, and execution configuration used by My Meme.
4. Wait for the run to complete and collect the session events.
5. Apply the existing deterministic constraints.
6. Print per-case results and the suite summary.

Do not redesign the case set or replace deterministic checks with an LLM judge during this step. Semantic quality evaluation can be added later when a concrete requirement cannot be judged from event facts.
