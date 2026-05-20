// ── System prompts prepended to user prompts per tool ─────────────────────────

// ── agy_design: framework-specific system prompts ──────────────────────────────

export function designSystemPrompt(framework: string, outputFormat: string): string {
	const parts: string[] = [];

	switch (framework) {
		case "react-tailwind":
			parts.push(
				"You are a senior UI engineer. Output requirements:",
				"- React function component, TypeScript, Tailwind utility classes only",
				"- No CSS-in-JS, no external CSS files",
				"- Accessible: proper ARIA, semantic HTML, color contrast >= AA",
				"- Self-contained: no external component imports unless lucide-react for icons",
				"- Default export, named matching the component's purpose",
			);
			break;
		case "svelte-tailwind":
			parts.push(
				"You are a senior UI engineer. Output requirements:",
				"- Svelte component, Tailwind utility classes only",
				"- Accessible: proper ARIA, semantic HTML, color contrast >= AA",
				"- Self-contained, no external component imports",
			);
			break;
		case "vue-tailwind":
			parts.push(
				"You are a senior UI engineer. Output requirements:",
				"- Vue 3 single-file component (SFC), Tailwind utility classes only",
				"- Composition API with <script setup>",
				"- Accessible: proper ARIA, semantic HTML, color contrast >= AA",
				"- Self-contained, no external component imports",
			);
			break;
		case "html-tailwind":
			parts.push(
				"You are a senior UI engineer. Output requirements:",
				"- Plain HTML with Tailwind CDN/utility classes",
				"- Accessible: proper ARIA, semantic HTML, color contrast >= AA",
				"- Self-contained inline HTML",
			);
			break;
		case "html-css":
			parts.push(
				"You are a senior UI engineer. Output requirements:",
				"- Plain HTML + CSS (no frameworks)",
				"- Accessible: proper ARIA, semantic HTML, color contrast >= AA",
				"- Responsive design with modern CSS (flexbox/grid)",
			);
			break;
		case "none":
			// No framework hints
			break;
		default:
			// Default to react-tailwind
			parts.push(
				"You are a senior UI engineer. Output requirements:",
				"- React function component, TypeScript, Tailwind utility classes only",
				"- No CSS-in-JS, no external CSS files",
				"- Accessible: proper ARIA, semantic HTML, color contrast >= AA",
				"- Self-contained: no external component imports unless lucide-react for icons",
				"- Default export, named matching the component's purpose",
			);
			break;
	}

	if (outputFormat === "code-only") {
		parts.push("", "Output ONLY raw code. No markdown fences. No prose. No explanation. Code only.");
	}

	return parts.join("\n");
}

// ── agy_critique: focus-specific system prompts ────────────────────────────────

export function critiqueSystemPrompt(focus: string): string {
	switch (focus) {
		case "accessibility":
			return [
				"You are an accessibility expert reviewing code. Focus on WCAG 2.2 AA.",
				"List issues with WCAG SC references where possible.",
				"Categorize as: blocker / major / minor.",
			].join("\n");
		case "visual-hierarchy":
			return [
				"You are a UI design reviewer. Focus strictly on visual hierarchy: spacing,",
				"typography scale, color emphasis, information density, and scan patterns.",
				"Cite specific selectors/lines. Categorize as: critical / major / minor.",
			].join("\n");
		case "responsive":
			return [
				"You are a responsive design specialist. Evaluate the code for breakpoint coverage,",
				"layout shifts, touch targets, and mobile-first patterns.",
				"Suggest specific CSS/class changes. Categorize as: critical / major / minor.",
			].join("\n");
		case "performance":
			return [
				"You are a frontend performance engineer. Analyze rendering, layout computation,",
				"image loading, bundle implications, and animation efficiency.",
				"Categorize each issue as: critical / major / minor.",
			].join("\n");
		default:
			return [
				"You are a senior UI/UX engineer reviewing code. Identify concrete design and",
				"implementation issues. Be specific \u2014 cite line numbers/selectors.",
				"Categorize each issue as severity: critical / major / minor. Don't be vague.",
			].join("\n");
	}
}

// ── agy_image_to_ui: fidelity-specific instructions ────────────────────────────

export function imageToUiInstructions(fidelity: string): string {
	switch (fidelity) {
		case "pixel-perfect":
			return "Replicate the design pixel-for-pixel. Match colors, spacing, typography, and layout exactly.";
		case "structural":
			return "Match the overall layout and component structure. Colors and spacing can be approximate.";
		default:
			return "Use the image as a visual reference for style and layout inspiration. Adapt freely to fit best practices.";
	}
}
