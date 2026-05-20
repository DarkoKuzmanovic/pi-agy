/**
 * pi-agy
 *
 * Registers 5 tools that delegate tasks to Google's Antigravity CLI (agy)
 * running Gemini 3.5 Flash in non-interactive (print) mode.
 *
 * - agy_design:     generate UI components (Tailwind/React, Svelte, Vue, etc.)
 * - agy_critique:   design/UX review of existing UI code
 * - agy_image_to_ui: convert a mockup/screenshot to component code (best-effort)
 * - agy_usage:      show local request counter with soft-warn thresholds
 * - agy_account:    switch Google accounts by swapping ~/.gemini/ state
 *
 * Requires: agy 1.0.0+ on PATH, OAuth login, at least one model selection via TUI /model
 *
 * Limitations:
 * - Model selection is TUI-controlled (no -m flag). Currently expects Gemini 3.5 Flash High.
 * - No streaming — agy -p produces plain text only
 * - Account switching is sequential, not parallel
 * - Image input uses --add-dir workaround
 */

import type { ExtensionAPI } from "@earendil-works/pi-coding-agent";
import { renderCall, renderResult } from "./render";
import { AccountParams, CritiqueParams, DesignParams, ImageToUiParams, UsageParams } from "./schemas";
import { executeAccount } from "./tools/account";
import { executeCritique } from "./tools/critique";
import { executeDesign } from "./tools/design";
import { executeImageToUi } from "./tools/imageToUi";
import { executeUsage } from "./tools/usage";

export default function piAgyExtension(pi: ExtensionAPI): void {
	// ── Tool: agy_design ────────────────────────────────────────────────
	pi.registerTool({
		name: "agy_design",
		label: "Agy Design",
		description:
			"Generate UI component code via Google Antigravity CLI (Gemini Flash 3.5). " +
			"Best for: Tailwind+React, component scaffolding, design prototyping. " +
			"Flash excels at one-shot Tailwind/React output with accessible, polished defaults.",
		promptSnippet:
			"Generate UI code — triggers on 'design', 'make a component', 'build a UI', 'create a page', or requests for Tailwind/React component generation",
		promptGuidelines: [
			"Use agy_design when the user asks to create a new UI component, page, or design prototype.",
			"Set framework to the user's stack (default react-tailwind is Flash's strongest mode).",
			"Pass referenceFiles paths for visual consistency with existing components.",
			"Use code-only outputFormat to get clean code without Gemini's prose narration.",
			"Set timeoutSec higher (120+) for complex designs with many components.",
		],
		parameters: DesignParams,
		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			return executeDesign(params, signal, onUpdate as any, ctx) as any;
		},
		renderCall,
		renderResult,
	});

	// ── Tool: agy_critique ──────────────────────────────────────────────
	pi.registerTool({
		name: "agy_critique",
		label: "Agy Critique",
		description:
			"Ask Gemini Flash 3.5 to review existing UI code for design and UX issues. " +
			"Supports focused reviews: accessibility (WCAG), visual hierarchy, responsive, performance, or general.",
		promptSnippet:
			"Review design — triggers on 'critique', 'review this ui', 'check design', 'ux review', or requests for design feedback",
		promptGuidelines: [
			"Use agy_critique when the user asks for design/UX feedback on existing code.",
			"Set focus to narrow the review: 'accessibility' for WCAG, 'performance' for rendering analysis.",
			"Use the question parameter to ask a specific question about the design.",
			"Pass exactly one targetFile — agy doesn't do multi-file reviews natively.",
		],
		parameters: CritiqueParams,
		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			return executeCritique(params, signal, onUpdate as any, ctx) as any;
		},
		renderCall,
		renderResult,
	});

	// ── Tool: agy_image_to_ui ───────────────────────────────────────────
	pi.registerTool({
		name: "agy_image_to_ui",
		label: "Agy Image to UI",
		description:
			"Convert a mockup/screenshot image to a UI component. " +
			"Uses Gemini's multimodal strength via agy's --add-dir workaround. " +
			"Best-effort: agy CLI may not reliably read image files in print mode. " +
			"If output doesn't look like code, consider the agy TUI for image input.",
		promptSnippet:
			"Convert image to UI — triggers on 'turn this into a component', 'convert this mockup', 'make this screenshot into code', or image-to-code requests",
		promptGuidelines: [
			"Use agy_image_to_ui when the user provides a screenshot/mockup image and asks for code.",
			"Set fidelity: 'pixel-perfect' for exact match, 'structural' for layout-only, 'inspired-by' for stylistic reference.",
			"If the output is prose instead of code, advise opening agy TUI for direct image input (CLI limitation).",
			"Supported formats: PNG, JPG, WebP, GIF.",
		],
		parameters: ImageToUiParams,
		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			return executeImageToUi(params, signal, onUpdate as any, ctx) as any;
		},
		renderCall,
		renderResult,
	});

	// ── Tool: agy_usage ─────────────────────────────────────────────────
	pi.registerTool({
		name: "agy_usage",
		label: "Agy Usage",
		description:
			"Show pi-agy's local request counter. Tracks calls made by this extension only, " +
			"not cross-source usage. Soft-warns at 50 calls/day or 200/week " +
			"but never refuses calls. For Google-side quota, run /usage in the agy TUI.",
		promptSnippet:
			"Show usage — triggers on 'how many agy calls', 'agy usage', 'check agy quota', 'how much have I used'",
		promptGuidelines: [
			"Use agy_usage to check how many design/ critique calls have been made this week.",
			"The counter is local only and does not reflect Google's server-side quota.",
			"Soft-warnings are informational only — agy_usage never blocks calls.",
		],
		parameters: UsageParams,
		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			return executeUsage(params, signal, onUpdate as any, ctx) as any;
		},
		renderCall,
		renderResult,
	});

	// ── Tool: agy_account ───────────────────────────────────────────────
	pi.registerTool({
		name: "agy_account",
		label: "Agy Account",
		description:
			"Switch active Google account for agy by swapping ~/.gemini/google_accounts.json " +
			"and ~/.gemini/oauth_creds.json from backed-up profiles. " +
			"Supports: list profiles, show current, backup current, switch to profile. " +
			"Note: running agy interactive sessions retain their loaded credentials until restarted.",
		promptSnippet:
			"Manage accounts — triggers on 'switch account', 'change account', 'backup account', 'list accounts', or account management requests",
		promptGuidelines: [
			"Use agy_account to switch between personal and work Google accounts for agy.",
			"Back up each account with action:backup profile:<name> before the first switch.",
			"Switch with action:switch profile:<name>. An auto-snapshot is saved to .last-active/.",
			"New agy -p calls pick up the swapped credentials automatically.",
		],
		parameters: AccountParams,
		async execute(_toolCallId, params, signal, onUpdate, ctx) {
			return executeAccount(params, signal, onUpdate as any, ctx) as any;
		},
		renderCall,
		renderResult,
	});
}
