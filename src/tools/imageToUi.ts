import * as fs from "node:fs";
import * as path from "node:path";
import { getCurrentAccount } from "../accounts";
import { spawnAgy } from "../execute";
import { designSystemPrompt, imageToUiInstructions } from "../prompts";
import type { AgyToolDetails, SpawnAgyResult } from "../types";
import { logCall } from "../usage";

const SUPPORTED_EXTENSIONS = new Set([".png", ".jpg", ".jpeg", ".webp", ".gif"]);

export async function executeImageToUi(
	params: any,
	signal: AbortSignal | undefined,
	onUpdate: any,
	ctx: any,
): Promise<{ content: Array<{ type: string; text: string }>; details: AgyToolDetails; isError: boolean }> {
	const workDir = params.cwd ?? ctx.cwd;
	const framework = params.framework ?? "react-tailwind";
	const fidelity = params.fidelity ?? "structural";
	const timeoutSec = params.timeoutSec ?? 120;

	const absPath = path.isAbsolute(params.imagePath) ? params.imagePath : path.join(workDir, params.imagePath);

	try {
		await fs.promises.access(absPath, fs.constants.R_OK);
	} catch {
		return {
			content: [{ type: "text", text: `Image file not found or not readable: ${absPath}` }],
			details: { durationMs: 0, account: null, exitCode: 1, model: "gemini-3.5-flash-high" },
			isError: true,
		};
	}

	const ext = path.extname(absPath).toLowerCase();
	if (!SUPPORTED_EXTENSIONS.has(ext)) {
		return {
			content: [
				{
					type: "text",
					text: `Unsupported image format '${ext}'. Supported: ${Array.from(SUPPORTED_EXTENSIONS).join(", ")}`,
				},
			],
			details: { durationMs: 0, account: null, exitCode: 1, model: "gemini-3.5-flash-high" },
			isError: true,
		};
	}

	const parts: string[] = [];

	parts.push(designSystemPrompt(framework, "code-only"));

	parts.push(`An image file is available at: ${absPath}`);
	parts.push(imageToUiInstructions(fidelity));

	if (params.additionalNotes) {
		parts.push(`Additional notes: ${params.additionalNotes}`);
	}

	const finalPrompt = parts.join("\n\n");

	// The --add-dir points to the parent directory so agy can read the image
	const imageDir = path.dirname(absPath);

	const result: SpawnAgyResult = await spawnAgy(finalPrompt, {
		cwd: workDir,
		timeoutSec,
		addDirs: [imageDir],
		signal,
		onProgress: onUpdate
			? (status: string) => onUpdate({ content: [{ type: "text" as const, text: status }] })
			: undefined,
	});

	// Heuristic: check if output looks like code
	const text = result.text;
	const looksLikeCode = /[<{]|class=|function |export /i.test(text);

	let responseText = text;
	if (looksLikeCode) {
		responseText = text
			.replace(/^```[\w-]*\n/gm, "")
			.replace(/^```\n?/gm, "")
			.trim();
	} else if (!result.isError && text.length > 0) {
		responseText =
			text +
			"\n\n---\n\u26a0 Note: agy may not have read the image directly \u2014 consider opening agy TUI for image input.";
	}

	const account = getCurrentAccount();
	await logCall({
		ts: new Date().toISOString(),
		tool: "agy_image_to_ui",
		account,
		latencyMs: result.durationMs,
		promptChars: finalPrompt.length,
		responseChars: text.length,
		exitCode: result.exitCode,
	});

	const isError = result.isError && !text;

	return {
		content: [{ type: "text", text: responseText }],
		details: { durationMs: result.durationMs, account, exitCode: result.exitCode, model: "gemini-3.5-flash-high" },
		isError,
	};
}
