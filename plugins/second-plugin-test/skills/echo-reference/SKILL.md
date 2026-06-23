---
name: echo-reference
description: Echo text transformed by a chosen mode. Use to test a skill with SKILL.md plus REFERENCE.md in the second plugin. Trigger when the user says "echo reference".
---

# Echo Reference

Has one resource: [REFERENCE.md](REFERENCE.md).

## Input

- `text` (string) — anything.
- `mode` (string) — a transform listed in REFERENCE.md (default `plain`).

## Steps

1. Read `text` and `mode`.
2. Apply the transform from [REFERENCE.md](REFERENCE.md).
3. Print:

   ```
   echo-reference[<mode>]> <result>
   ```
