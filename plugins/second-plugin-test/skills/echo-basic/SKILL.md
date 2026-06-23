---
name: echo-basic
description: Echo back the text the user gives. Use to test a md-only skill in the second plugin. Trigger when the user says "echo basic" or asks to test the second plugin's basic skill.
---

# Echo Basic

Only SKILL.md, nothing else.

## Input

- `text` (string) — anything.

## Steps

1. Read `text`.
2. Print exactly:

   ```
   echo-basic> <text>
   ```

3. Empty input → print `echo-basic> (nothing to echo)`.
