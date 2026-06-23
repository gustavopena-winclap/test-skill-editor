---
name: echo-full
description: Echo a payload built from collected fields, using a reference, a form, and a script. Use to test a fully-loaded skill (SKILL.md + REFERENCE.md + FORMS.md + scripts/) in the second plugin. Trigger when the user says "echo full".
---

# Echo Full

The "everything" skill of the second plugin.

Resources:
- [REFERENCE.md](REFERENCE.md) — transform modes.
- [FORMS.md](FORMS.md) — fields to collect.
- [scripts/echo.py](scripts/echo.py) — does the transform deterministically.

## Steps

1. Collect the fields in [FORMS.md](FORMS.md).
2. Pick a mode from [REFERENCE.md](REFERENCE.md).
3. Run the script:

   ```bash
   python scripts/echo.py --text "hello" --mode shout --repeat 2
   ```

4. Print the script output.
