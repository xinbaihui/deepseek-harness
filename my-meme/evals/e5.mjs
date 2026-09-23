#!/usr/bin/env node

import { readFile } from 'node:fs/promises'

const MEME_TOOLS = new Set([
  'search_memes',
  'search_giphy',
  'generate_meme',
])

function usage() {
  console.error('Usage: node my-meme/evals/e5.mjs <session.jsonl>')
}

function parseToolCalls(jsonl, filePath) {
  const calls = []
  const lines = jsonl.split(/\r?\n/)

  for (let index = 0; index < lines.length; index += 1) {
    const line = lines[index].trim()
    if (line.length === 0) continue

    let event
    try {
      event = JSON.parse(line)
    } catch (error) {
      throw new Error(
        `${filePath}:${index + 1}: invalid JSON: ${error.message}`,
      )
    }

    if (event?.type !== 'tool/call') continue
    if (typeof event.data?.name !== 'string') {
      throw new Error(
        `${filePath}:${index + 1}: tool/call is missing string data.name`,
      )
    }
    if (!Number.isSafeInteger(event.seq)) {
      throw new Error(
        `${filePath}:${index + 1}: tool/call is missing integer seq`,
      )
    }

    calls.push({ name: event.data.name, seq: event.seq })
  }

  return calls
}

function evaluate(toolCalls) {
  const callsBySequence = [...toolCalls].sort(
    (left, right) => left.seq - right.seq,
  )
  const firstAsk = callsBySequence.find(
    (call) => call.name === 'ask_user_question',
  )
  const firstMemeTool = callsBySequence.find((call) =>
    MEME_TOOLS.has(call.name),
  )

  if (!firstMemeTool) {
    return {
      passed: false,
      reason:
        'No search_memes, search_giphy, or generate_meme tool call was found.',
      firstAsk: firstAsk ?? null,
      firstMemeTool: null,
    }
  }

  if (!firstAsk) {
    return {
      passed: false,
      reason: `ask_user_question did not occur before ${firstMemeTool.name}.`,
      firstAsk: null,
      firstMemeTool,
    }
  }

  const passed = firstAsk.seq < firstMemeTool.seq
  return {
    passed,
    reason: passed
      ? `ask_user_question occurred before ${firstMemeTool.name}.`
      : `ask_user_question occurred after ${firstMemeTool.name}.`,
    firstAsk,
    firstMemeTool,
  }
}

const filePath = process.argv[2]
if (!filePath || process.argv.length !== 3) {
  usage()
  process.exitCode = 2
} else {
  try {
    const jsonl = await readFile(filePath, 'utf8')
    const toolCalls = parseToolCalls(jsonl, filePath)
    const result = evaluate(toolCalls)

    console.log(
      JSON.stringify(
        {
          evaluator: 'E5',
          file: filePath,
          ...result,
          toolNames: [...toolCalls]
            .sort((left, right) => left.seq - right.seq)
            .map((call) => call.name),
        },
        null,
        2,
      ),
    )

    process.exitCode = result.passed ? 0 : 1
  } catch (error) {
    console.error(`E5 evaluator error: ${error.message}`)
    process.exitCode = 2
  }
}
