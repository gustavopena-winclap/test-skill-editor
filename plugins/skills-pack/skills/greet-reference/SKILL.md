---
name: greet-reference
description: Print a hello greeting in a chosen style. Use to test a skill that has SKILL.md plus a REFERENCE.md. Trigger when the user says "greet reference" or asks to test the skill-with-reference.
---

# Greet Reference

Skill with one extra resource file: [REFERENCE.md](REFERENCE.md).

## Input

- `name` (string) — who to greet.
- `style` (string) — one of the styles listed in REFERENCE.md (default `casual`).

## Steps

1. Read `name` and `style`.
2. Look up the template for `style` in [REFERENCE.md](REFERENCE.md).
3. Fill the template with `name` and print the result.
4. Unknown style → fall back to `casual`.
