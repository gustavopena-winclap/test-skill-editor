---
name: winclap-design-skill
description: >
  Use this skill to generate well-branded interfaces, decks, and assets for Winclap (the umbrella brand) and its 6 sub-brands — Studio, Media (Paid + Owned), Data, Consulting, Nonprofits. Contains official colors with Pantone values, Reckless + Inter type system, full logo set (light/dark/color variants for every sub-brand), photography library, deck reference patterns (Holistic / Studio / Data / Consulting), UI components, and a faithful recreation of the winclap.com Brand Hub.
---

# Winclap Design Skill

You are designing for **Winclap** — *Growth Transformation*. Founded in 2014 in Córdoba, Argentina; ~302 employees across 6 countries. Umbrella brand with 6 sub-brands, each with its own Pantone-verified accent color.

## Always read first
1. **`README.md`** — full brand context: company background, brand architecture, content fundamentals (tone, language, sub-brand naming convention), visual foundations (color proportions, layout principles).
2. **`colors_and_type.css`** — single source of truth for tokens. Always link or copy this; never invent colors or fonts.
3. **`references/`** — deck pattern guides per solution. Read the matching one before building any deck.

## Critical rules

### Sub-brand → accent color (always paired)
| Sub-brand | Hex | Pantone |
|---|---|---|
| Studio | `#CEABFF` | PMS 264 C |
| Paid Media | `#F54D25` / `#FE805B` | PMS 170 C |
| Owned Media | `#FFA88E` (Human Pink) | — |
| Data | `#87DBFF` | PMS 297 C |
| Consulting | `#FFD447` | PMS 122 C |
| Nonprofits | `#F2917E` | — |
Umbrella Winclap: black `#000000` + white `#FFFFFF`, never use a sub-brand accent for umbrella work.

### Typography
- **Reckless Regular / Italic only** → titles, display, statements. Italic is reserved for the *emphasized word* in a phrase.
- **Inter SemiBold** → subtitles.
- **Inter Regular** → body, captions.
- Never substitute Reckless with another serif unless exporting (then Lora is the approved Google Fonts fallback).

### Sub-brand wordmark rule
The sub-brand word always appears in the accent color when written as `Winclap [Sub-brand]` — e.g. *Winclap* (white) + *Studio* (purple).

### Deck chrome (universal)
Every slide carries the italic tagline *"The gateway to growth transformation"* in Reckless italic, bottom-right or bottom-center, plus the relevant logo bottom-left.

### Iconography
Yellow 4-point star (`clip-path` polygon) is the signature bullet marker — use it on Consulting and umbrella decks for "How we help" lists.

## When the user asks for a deck

1. **Ask which solution** (Holistic / Studio / Data / Consulting / Media / Owned / Nonprofits) — sets palette automatically.
2. **Ask language** (ES / EN / bilingual), **audience**, **length**, **format** (HTML / PPTX editable / PDF).
3. **Read the matching reference** in `references/`:
   - `holistic_pitch_deck_patterns.md` → corporate pitch, 4 acts, neutral palette
   - `studio_deck_patterns.md` → creator/AI narrative, purple accent
   - For Data: see `decks/winclap_data_value_prop.html` as a reference build
   - For Consulting: see `decks/consulting_cro_deck.html` as a reference build (yellow + black, editorial, star bullets)
4. **Use `<deck-stage>`** (`deck-stage.js` web component) for the slide shell — handles scaling, navigation, PPTX export.
5. **Slide size: 1920×1080.** Min text size 24px.
6. Apply the chrome (logo + tagline) on every slide.

## When the user asks for UI / web / app design

1. Inspect `ui_kits/brand_hub/index.html` — faithful recreation of winclap.com with real nav, hero, cards, layout vocabulary.
2. Use the same vocabulary: black headers, editorial white sections, yellow stars as bullets, Reckless for hero/serif statements, large generous padding, 5% accent color usage (white 40% / black 30% / accent 5% / supporting 25%).

## Asset locations
- **Logos:** `assets/logos/` — full set: black, white, black+color, white+color for each sub-brand. Plus `Winclap_symbol_black.svg` (3-triangle mark) and `Winclap_lockup_*.png`.
- **Fonts:** `fonts/` — Reckless (woff2/otf) + Inter (full weight set ttf).
- **Photos:** `assets/photos/` — 23 photos in 3 categories: Architecture & Aspiration, Devices & Workspace, People & Team. Hover the Imagery card in `preview/imagery.html` for the categorization.
- **Reference PDFs:** `assets/decks/` — original PDF references, do not modify.

## Output guidance
- For HTML artifacts: copy assets out (`assets/`, `fonts/`) into the working folder; reference relatively.
- For production code: read `colors_and_type.css` and lift CSS variables / font-faces into the codebase.
- For PPTX export: use `gen_pptx` with `fontSwaps: [{from:"Reckless", to:"Lora"}]` + `googleFontImports: ["Lora"]` for Google Slides compatibility.
- Never use emoji unless explicitly requested. Never invent stats or filler content. Use placeholders for missing data.

## If invoked without context
Ask what they want to build (deck / web page / app UI / asset / brand exploration), which sub-brand, audience, and language. Then read the matching references before producing anything.