import { Type } from "typebox";

// ── agy_design ─────────────────────────────────────────────────────────────────

export const DesignParams = Type.Object({
	prompt: Type.String({
		description:
			"Description of the UI component/page to generate. Be specific about framework (React/Vue/Svelte/plain HTML), styling (Tailwind preferred \u2014 Flash excels at it), props/data shape, interactions. Example: 'A React+Tailwind pricing card with title, price/mo, 4-bullet feature list, and a primary CTA button. Use accessible color contrast.'",
	}),
	framework: Type.Optional(
		Type.Union(
			[
				Type.Literal("react-tailwind"),
				Type.Literal("svelte-tailwind"),
				Type.Literal("vue-tailwind"),
				Type.Literal("html-tailwind"),
				Type.Literal("html-css"),
				Type.Literal("none"),
			],
			{
				description:
					"Target stack. Defaults to react-tailwind (Flash's strongest combo). 'none' = no framework hints prepended.",
			},
		),
	),
	referenceFiles: Type.Optional(
		Type.Array(Type.String(), {
			description:
				"Paths to existing files (relative to cwd or absolute) whose contents are injected as reference context \u2014 e.g. existing components for visual consistency, design tokens, theme files.",
		}),
	),
	outputFormat: Type.Optional(
		Type.Union([Type.Literal("code-only"), Type.Literal("code-plus-notes")], {
			description:
				"code-only = strip any prose, return ONLY the code. code-plus-notes = include Flash's explanation. Default code-only.",
		}),
	),
	cwd: Type.Optional(
		Type.String({
			description: "Working directory for agy. Defaults to Pi's cwd.",
		}),
	),
	timeoutSec: Type.Optional(
		Type.Number({
			description:
				"Max seconds to wait. Default 120. Maps to agy --print-timeout.",
		}),
	),
});

// ── agy_critique ───────────────────────────────────────────────────────────────

export const CritiqueParams = Type.Object({
	targetFile: Type.String({
		description: "Path to the file to critique (relative to cwd or absolute).",
	}),
	focus: Type.Optional(
		Type.Union(
			[
				Type.Literal("accessibility"),
				Type.Literal("visual-hierarchy"),
				Type.Literal("responsive"),
				Type.Literal("performance"),
				Type.Literal("general"),
			],
			{
				description:
					"What aspect to emphasize. Default 'general' (covers everything).",
			},
		),
	),
	question: Type.Optional(
		Type.String({
			description:
				"Specific question to answer. E.g. 'Why does this card look unbalanced on mobile?'",
		}),
	),
	cwd: Type.Optional(
		Type.String({
			description: "Working directory for agy. Defaults to Pi's cwd.",
		}),
	),
	timeoutSec: Type.Optional(
		Type.Number({ description: "Max seconds to wait. Default 120." }),
	),
});

// ── agy_image_to_ui ────────────────────────────────────────────────────────────

const FidelityOption = Type.Union(
	[
		Type.Literal("pixel-perfect"),
		Type.Literal("structural"),
		Type.Literal("inspired-by"),
	],
	{
		description:
			"pixel-perfect = match exactly. structural = match layout/components. inspired-by = use as visual reference. Default 'structural'.",
	},
);

const FrameworkOption = Type.Union(
	[
		Type.Literal("react-tailwind"),
		Type.Literal("svelte-tailwind"),
		Type.Literal("vue-tailwind"),
		Type.Literal("html-tailwind"),
		Type.Literal("html-css"),
		Type.Literal("none"),
	],
	{
		description: "Target stack. Defaults to react-tailwind.",
	},
);

export const ImageToUiParams = Type.Object({
	imagePath: Type.String({
		description:
			"Path to the image (PNG/JPG/WebP). Relative to cwd or absolute.",
	}),
	framework: Type.Optional(FrameworkOption),
	fidelity: Type.Optional(FidelityOption),
	additionalNotes: Type.Optional(
		Type.String({
			description:
				"Extra instructions or constraints for the generated component.",
		}),
	),
	cwd: Type.Optional(
		Type.String({
			description: "Working directory for agy. Defaults to Pi's cwd.",
		}),
	),
	timeoutSec: Type.Optional(
		Type.Number({ description: "Max seconds to wait. Default 120." }),
	),
});

// ── agy_usage ──────────────────────────────────────────────────────────────────

export const UsageParams = Type.Object({
	window: Type.Optional(
		Type.Union(
			[
				Type.Literal("today"),
				Type.Literal("week"),
				Type.Literal("month"),
				Type.Literal("all"),
			],
			{
				description: "Time window to summarize. Default 'week'.",
			},
		),
	),
	account: Type.Optional(
		Type.String({
			description:
				"Filter to a specific account profile name. Default: current active.",
		}),
	),
});

// ── agy_account ────────────────────────────────────────────────────────────────

export const AccountParams = Type.Object({
	action: Type.Union(
		[
			Type.Literal("list"),
			Type.Literal("current"),
			Type.Literal("backup"),
			Type.Literal("switch"),
		],
		{
			description:
				"Profile management action. 'list' = list configured profiles. 'current' = show active account. 'backup' = backup current account as a named profile. 'switch' = switch to a previously-backed-up profile.",
		},
	),
	profile: Type.Optional(
		Type.String({
			description: "Profile name for backup/switch. e.g. 'work' or 'personal'.",
		}),
	),
});
