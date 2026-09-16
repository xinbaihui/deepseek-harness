import type { Context } from '@deepseek-ai/cordis'
import { defineTool } from '@deepseek-ai/dsh-tools'

export const name = 'meme-tools'
export const inject = ['tools']

const memes = [
  {
    title: 'One Does Not Simply',
    tags: ['difficulty', 'sarcasm', 'work', 'programming'],
  },
  {
    title: 'This Is Fine',
    tags: ['chaos', 'frustration', 'work'],
  },
  {
    title: 'Are You Sure About That?',
    tags: ['doubt', 'sarcasm', 'skeptical'],
  },
  {
    title: 'Expectation vs Reality',
    tags: ['expectation', 'humor', 'reality', 'work'],
  },
  {
    title: 'Futurama Fry',
    tags: ['confused', 'sarcasm', 'skeptical'],
  },
]

export function apply(ctx: Context) {
  ctx.tools.register(defineTool({
    name: 'greet',
    description: 'Greet someone by name.',
    parameters: {
      name: { type: 'string', required: true, description: 'The name to greet' },
    },
    output: {
      schema: { type: 'string' },
      render: (_args, value) => [{ type: 'text', text: value }],
    },
    async execute(args) {
      return `Hello, ${args.name}!`
    },
  }))

  ctx.tools.register(defineTool({
    name: 'search_memes',
    description:
      'Search local meme candidates that match a conversation scenario and the user intent. Use this tool before recommending a meme.',
    parameters: {
      query: {
        type: 'string',
        required: true,
        description: 'Keywords describing the conversation scenario or meme concept.',
      },
      intent: {
        type: 'string',
        required: true,
        description:
          'What the user wants to communicate, such as sarcasm, humor, frustration, agreement, or easing awkwardness.',
      },
    },
    output: {
      schema: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          properties: {
            title: { type: 'string' },
            tags: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
      },
      render: (_args, value) => [
        { type: 'text', text: JSON.stringify(value, null, 2) },
      ],
    },
    async execute(args) {
      const keywords = `${args.query} ${args.intent}`
        .toLowerCase()
        .split(/\s+/)
        .filter(Boolean)

      const matches = memes.filter((meme) => {
        const searchableText = `${meme.title} ${meme.tags.join(' ')}`.toLowerCase()
        return keywords.some((keyword) => searchableText.includes(keyword))
      })

      return matches.length > 0 ? matches : []
    },
  }))
}
