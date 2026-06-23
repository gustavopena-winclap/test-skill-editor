---
name: greet-basic
description: Print a hello greeting for a given name. Use to test a skill that has only SKILL.md (no extra files). Trigger when the user says "greet basic" or asks to test the md-only skill.
---

# Greet Basic

Simplest possible skill. Only this file, no resources.

## Input

- `name` (string) — who to greet.

## Steps

1. Read the `name` the user provided.
2. Print exactly:

   ```
   Hello, <name>! (from greet-basic — md only)
   ```

3. If no name given, use `World`.

That is all. No references, no scripts.
