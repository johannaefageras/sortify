# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repository is

Sortify is at the **concept/design stage**. There is no application code yet — the repository is the four design documents under `docs/`, and those documents _are_ the current work product. No build, lint, or test toolchain exists; do not assume `package.json`, a dev server, or CI. When asked to "build" or "implement," confirm whether the task is to write code (none exists yet) or to extend the design docs.

The planned stack (not yet scaffolded) is **SvelteKit 5, TypeScript, Supabase, and the Anthropic API**.

## The product in one paragraph

A person hands over whatever is on their mind — trivial or genuinely heavy — and picks a _voice_ (a personality, not an assistant) that responds to it. The point is **delivery, not answers**: the same worry, handed to different voices, gets metabolized differently. The app's one defining move is _refraction_ — multiple voices breaking the same input in different ways ("fråga rummet" / "ask the room"). The person also picks one of three **modes** (see below) that says what they need right now. All user-facing content is in **Swedish**, addressing the user as _du_.

## Architecture: how a voice is assembled

The core technical concept is **prompt composition: `bas + läge + röst`** (base + mode + voice), in that order.

- `docs/basprompt.md` — the **base system prompt**, prepended to _every_ voice. It carries everything shared: context, mission, ground rules, the **mode mechanism**, the crisis-resource rule, and the **full safety lock (säkerhetsspärr)**. A per-voice prompt must never repeat the safety block.
- `docs/lagena.md` — the **mode layer**: the three mode directives (`Ventilera`, `Sortera`, `Formulera`) as the exact, injectable text. Exactly one is woven in between base and voice. Base holds the _mechanism_; this file holds the _directives_.
- `docs/systempromptmallen.md` — the **template for generating per-voice system prompts** (one per voice), written to be read by an AI that produces them. Defines the mandatory 9-section structure, requires Swedish + imperative _du_-form, 400–800 words, and a worked example. Each voice prompt states only _its own_ safety threshold (section 8), inheriting the lock from the base.
- `docs/rosterna.md` — the full ensemble (~37 voices), the source of truth for each voice's personality.
- `docs/konceptet.md` — the concept: the core loop, the three modes, the safety pivot, and what the app deliberately is _not_. **Start here.**

A voice "ask the room" interaction is multiple Anthropic API calls woven into the same thread.

**The three modes (läge).** The user picks one of `Ventilera` (be seen, not fixed), `Sortera` (untangle the mess), or `Formulera` (find the words). The active mode's directive (defined in `docs/lagena.md`) is injected as a shared layer between base and voice; it shifts _what_ a voice aims for, **never its tone, language, or gimmick**. Modes are defined once in that file — voice prompts must **not** write per-mode variants or describe how they sound per mode; a voice applies its single, unchanged personality to whatever the active mode directs. Only one mode is active at a time, and modes never override the ground rules or the safety lock.

## The two systems that constrain everything

**1. Voice taxonomy + weight tags.** Voices come in three kinds — **Stilar** (a tone, no character), **Karaktärer** (a _who_ with personality), **Format** (the gimmick _is_ the whole voice). Independently, every voice carries a **weight tag** for how heavy an input it can hold:

- _Uppriktigt ankare_ — steps forward when things get serious; this is where heavy input is routed.
- _Tål något på riktigt_ — can hold something genuinely hard but non-acute.
- _Bara lätt_ — everyday stuff only; wrong for real pain.
- _Bara lätt · stäng av vid minsta nedstämdhet_ — like "bara lätt" but actively suppressed at the first distress signal, not merely avoided.

**2. The safety lock (säkerhetsspärr) is the backbone, not a footnote.** When input shifts from venting to genuine distress (self-harm, hopelessness, not wanting to live), the chosen voice must drop character entirely and respond as a calm, warm human, then _not_ return to character. Weight tags drive a distress-level switch: playful/suppress-flagged voices are pulled back and a sincere anchor takes the front. A voice may set its own threshold **lower** than the base, **never higher**. The model never invents crisis resources (phone numbers, orgs, links) — it refers to help in general terms; the **app** supplies a fixed, vetted resource list.

When editing voice descriptions or generating voice prompts, the weight tag is binding: it dictates how section 5 and the section-8 threshold are written.

## Working conventions

- Author all product content (concept, voices, prompts) in **Swedish**, _du_-form, present tense / imperative.
- Default tone is brave, irreverent, playful — that bite is the point; sanding it down makes it just another gentle journaling app. The safety lock is the one thing that overrides tone.
- The app is deliberately **not** a better assistant, not therapy, not a facts/quiz tool. Resist the pull to make voices "useful" — the honest promise is _useless-but-warming_.

## Known open questions (per the docs)

The name is unset; the distress-detection mechanism (how the pivot actually triggers at app level vs. in-prompt) is unspecified and is the missing, safety-critical doc; and the "tål något på riktigt" tier is thin and needs more warm/perspective voices before the app can credibly handle real problems.
