# Greet Full — Input Form

Collect these fields before rendering the card.

| field   | type   | required | default     | notes                          |
|---------|--------|----------|-------------|--------------------------------|
| name    | string | yes      | —           | recipient name                 |
| message | string | no       | `Hello!`    | the greeting text              |
| style   | string | no       | `box`       | see REFERENCE.md for options   |

Pass them straight to the script flags: `--name`, `--message`, `--style`.
