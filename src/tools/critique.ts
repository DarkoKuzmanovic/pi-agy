import * as fs from "node:fs";
import * as path from "node:path";
import { getCurrentAccount } from "../accounts";
import { spawnAgy } from "../execute";
import { critiqueSystemPrompt } from "../prompts";
import type { AgyToolDetails, SpawnAgyResult } from "../types";
import { logCall } from "../usage";

export async function executeCritique(
	params: any,
	signal: AbortSignal | undefined,
	onUpdate: any,
	ctx: any,
): Promise<{ content: Array<{ type: string; text: string }>; details: AgyToolDetails; isError: boolean }> {
	const workDir = params.cwd ?? ctx.cwd;
	const focus = params.focus ?? "general";
	const timeoutSec = params.timeoutSec ?? 120;

	const absPath = path.isAbsolute(params.targetFile) ? params.targetFile : path.join(workDir, params.targetFile);
	let fileContent: string;
	try {
		fileContent = await fs.promises.readFile(absPath, "utf-8");
	} catch (err) {
		return {
			content: [{ type: "text", text: `Cannot read file: ${(err as Error).message}` }],
			details: { durationMs: 0, account: null, exitCode: 1, model: "gemini-3.5-flash-high" },
			isError: true,
		};
	}

	const parts: string[] = [];

	parts.push(`<file path="${absPath}">\n${fileContent}\n</file>`);

	parts.push(critiqueSystemPrompt(focus));

	if (params.question) {
		parts.push(`Specific question: ${params.question}`);
	}

	const finalPrompt = parts.join("\n\n");

	const result: SpawnAgyResult = await spawnAgy(finalPrompt, {
		cwd: workDir,
		timeoutSec,
		signal,
		onProgress: onUpdate
			? (status: string) => onUpdate({ content: [{ type: "text" as const, text: status }] })
			: undefined,
	});

	const account = getCurrentAccount();
	await logCall({
		ts: new Date().toISOString(),
		tool: "agy_critique",
		account,
		latencyMs: result.durationMs,
		promptChars: finalPrompt.length,
		responseChars: result.text.length,
		exitCode: result.exitCode,
	});

	const isError = result.isError;
	const responseText = isError && !result.text ? result.stderr || "(agy exited with no output)" : result.text;

	return {
		content: [{ type: "text", text: responseText }],
		details: { durationMs: result.durationMs, account, exitCode: result.exitCode, model: "gemini-3.5-flash-high" },
		isError,
	};
}
