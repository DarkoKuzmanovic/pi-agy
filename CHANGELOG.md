# Changelog

All notable changes to pi-agy will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.0] - 2026-05-20

### Added
- `agy_design` tool — generate UI components via Gemini Flash 3.5
- `agy_critique` tool — design/UX review of existing UI code
- `agy_image_to_ui` tool — mockup-to-component (best-effort via --add-dir)
- `agy_usage` tool — local request counter with soft-warn thresholds
- `agy_account` tool — switch Google accounts by swapping ~/.gemini/ state
- Local quota counter at `~/.pi/agy-usage.jsonl`
- Profile-based account management at `~/.pi/agy-accounts/`
