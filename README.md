# pi-agy

**Pi extension: delegate design tasks to Google Antigravity CLI (agy / Gemini 3.5 Flash).**

Registers 5 tools that let the Pi agent offload UI/UX work to Gemini Flash 3.5 —
which excels at Tailwind/React component generation, design critique, and image-to-code.

## Why

Gemini Flash 3.5 produces excellent one-shot Tailwind/React output with accessible,
polished defaults — measured during real use at 30-90s per design prompt.

## Requirements

- `agy` 1.0.0+ on PATH (install: see [antigravity.google](https://antigravity.google/))
- Logged in to a Google account (`agy` interactive session with OAuth)
- At least one model selection done in the agy TUI: `/model` → "Gemini 3.5 Flash (High)"

## Installation

```bash
pi install path:/home/quzma/.pi/agent/extensions/pi-agy
```

Or symlink the directory if already present.

## Tools

### `agy_design`
Generate UI components. Best for Tailwind+React scaffolding.

```
Input: { prompt, framework?, referenceFiles?, outputFormat?, cwd?, timeoutSec? }
```

### `agy_critique`
Review existing UI code for design/UX issues.

```
Input: { targetFile, focus?, question?, cwd?, timeoutSec? }
```

### `agy_image_to_ui`
Convert a mockup/screenshot to component code (best-effort via `--add-dir`).

```
Input: { imagePath, framework?, fidelity?, additionalNotes?, cwd?, timeoutSec? }
```

### `agy_usage`
Show local request counter with soft-warn thresholds.

```
Input: { window?, account? }
```

### `agy_account`
Switch Google accounts by swapping `~/.gemini/` state from backed-up profiles.

```
Input: { action, profile? }
```

## Limitations

- **Model selection is TUI-controlled.** There is no `-m` flag. Change model via `/model` in agy TUI.
- **No streaming.** `agy -p` produces plain text only (no JSON/stream output format).
- **Account switching is sequential**, not parallel. Running agy sessions keep their loaded creds.
- **Image input** uses `--add-dir` workaround. agy may not reliably read images in print mode.
- **Local counter only.** `agy_usage` tracks pi-agy calls. Cross-source Google quota requires `/usage` in agy TUI.

## Quota guidance

pi-agy soft-warns at 50 calls/day or 200/week but **never refuses calls**.
Warnings are informational — check actual quota with `/usage` in the agy TUI.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| "agy not found" | Set `AGY_PATH` env var to the binary path |
| Wrong model | Run `agy` TUI, `/model`, select "Gemini 3.5 Flash (High)", exit |
| Image input not working | Open agy TUI directly (`agy -i`) and drag the image in |
| Account switch not taking effect | Close any running agy sessions first |

## License

MIT
