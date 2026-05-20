import { execSync } from "node:child_process";
import * as fs from "node:fs";
import * as os from "node:os";
import * as path from "node:path";

// ── CLI discovery ──────────────────────────────────────────────────────────────

export function findAgyCli(): string {
	if (process.env.AGY_PATH) {
		try {
			fs.accessSync(process.env.AGY_PATH, fs.constants.X_OK);
			return process.env.AGY_PATH;
		} catch {
			/* fall through */
		}
	}

	try {
		const resolved = execSync("which agy", {
			encoding: "utf-8",
			stdio: ["ignore", "pipe", "ignore"],
		}).trim();
		if (resolved) return resolved;
	} catch {
		/* fall through */
	}

	const homeFallback = path.join(os.homedir(), ".local/bin/agy");
	try {
		fs.accessSync(homeFallback, fs.constants.X_OK);
		return homeFallback;
	} catch {
		/* fall through */
	}

	return "agy";
}
