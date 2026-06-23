---
name: greet-full
description: Build a full greeting card from collected fields, with a reference, a form, and a script. Use to test a skill that bundles everything (SKILL.md + REFERENCE.md + FORMS.md + scripts/). Trigger when the user says "greet full" or asks to test the full skill.
---

# Greet Full

The "everything" skill: instructions + reference + form + executable script.

Resources:
- [REFERENCE.md](REFERENCE.md) — card styles.
- [FORMS.md](FORMS.md) — fields to collect from the user.
- [scripts/greet.py](scripts/greet.py) — renders the card deterministically.

## Steps

1. Collect the fields defined in [FORMS.md](FORMS.md).
2. Pick a card style from [REFERENCE.md](REFERENCE.md).
3. Run the script to render the card:

   ```bash
   python scripts/greet.py --name "Ada" --style box --message "Welcome!"
   ```

4. Print the script output to the user.
