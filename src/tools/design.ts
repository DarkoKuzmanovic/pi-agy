import * as fs from "node:fs";
import * as path from "node:path";
import { getCurrentAccount } from "../accounts";
import { spawnAgy } from "../execute";
import { designSystemPrompt } from "../prompts";
import type { AgyToolDetails, SpawnAgyResult } from "../types";
import { logCall } from "../usage";

export async function executeDesign(
	params: any,
	signal: AbortSignal | undefined,
	onUpdate: any,
	ctx: any,
): Promise<{
	content: Array<{ type: string; text: string }>;
	details: AgyToolDetails;
	isError: boolean;
}> {
	const workDir = params.cwd ?? ctx.cwd;
	const framework = params.framework ?? "react-tailwind";
	const outputFormat = params.outputFormat ?? "code-only";
	const timeoutSec = params.timeoutSec ?? 120;

	const parts: string[] = [];

	parts.push(designSystemPrompt(framework, outputFormat));

	if (params.referenceFiles?.length > 0) {
		for (const filePath of params.referenceFiles) {
			const absPath = path.isAbsolute(filePath)
				? filePath
				: path.join(workDir, filePath);
			try {
				const content = await fs.promises.readFile(absPath, "utf-8");
				parts.push(`<file path="${absPath}">\n${content}\n</file>`);
			} catch (err) {
				parts.push(
					`<file path="${absPath}" error="${(err as Error).message}" />`,
				);
			}
		}
	}

	parts.push(params.prompt);

	const finalPrompt = parts.join("\n\n");

	const result: SpawnAgyResult = await spawnAgy(finalPrompt, {
		cwd: workDir,
		timeoutSec,
		signal,
		onProgress: onUpdate
			? (status: string) =>
					onUpdate({ content: [{ type: "text" as const, text: status }] })
			: undefined,
	});

	// Post-process: strip markdown fences for code-only
	let text = result.text;
	if (outputFormat === "code-only") {
		text = text
			.replace(/^```[\w-]*\n/gm, "")
			.replace(/^```\n?/gm, "")
			.trim();
	}

	const account = getCurrentAccount();
	await logCall({
		ts: new Date().toISOString(),
		tool: "agy_design",
		account,
		latencyMs: result.durationMs,
		promptChars: finalPrompt.length,
		responseChars: text.length,
		exitCode: result.exitCode,
	});

	const isError = result.isError;
	const responseText =
		isError && !text ? result.stderr || "(agy exited with no output)" : text;

	return {
		content: [{ type: "text", text: responseText }],
		details: {
			durationMs: result.durationMs,
			account,
			exitCode: result.exitCode,
			model: "gemini-3.5-flash-high",
		},
		isError,
	};
}
