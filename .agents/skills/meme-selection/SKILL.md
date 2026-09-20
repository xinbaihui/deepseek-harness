---
name: meme-selection
description: "Use when helping a user choose a meme for a conversation scenario."
---

# Meme Selection

## Purpose

Help the agent understand what the user wants to communicate
before searching for or generating a meme.

## Step 1: Infer Intent

Before searching for or generating a meme, first infer what
the user wants to communicate.

Possible intents include:

- sarcasm
- humor
- easing awkwardness
- frustration
- agreement
- disagreement
- rejection
- ending the conversation

If the user's intent is ambiguous and materially affects the
meme choice, ask the user for clarification.

## Step 2: Decide the Request Type

After understanding the user's intent, determine what kind of
meme request the user is making.

### Find an Existing Meme

If the user wants to find, browse, or get an existing meme or
meme template:

- Use `search_memes`.
- Return suitable existing meme candidates.
- Do not call `generate_meme` unless the user explicitly asks
  to create or customize a meme.

Example:

> "Find me a crying meme."

Expected tool path:

`search_memes`

### Create a Meme Without a Specified Template

If the user wants to create a meme for a scenario but has not
specified which meme template to use:

- Use `search_memes` to find suitable templates.
- Select a suitable template based on the user's intent and scenario.
- Then use `generate_meme` to create the meme.

Example:

> "My colleague said this is a simple change, but I know it will
> take three days. Make me a meme."

Expected tool path:

`search_memes` → `generate_meme`

### Create a Meme With a Specified Template

If the user explicitly specifies a meme template:

- Do not search for another template.
- Use the specified template directly with `generate_meme`.
- Use `search_memes` only if the specified template cannot be
  resolved or is unavailable.

Example:

> "Use the One Does Not Simply template and caption it:
> One does not simply / finish this change today."

Expected tool path:

`generate_meme`