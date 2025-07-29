import { MarkdownPostProcessorContext, Notice, Plugin } from "obsidian";
import initSqlJs from "sql.js";
import { getVocabDbPath } from "./PathHelper";
import KindleVocabPlugin from "../main";

export function registerCheckboxPostProcessor(plugin: KindleVocabPlugin) {
	plugin.registerMarkdownPostProcessor(async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
		const checkboxes = el.querySelectorAll('input[type="checkbox"][data-word]');

		checkboxes.forEach(checkbox => {
			checkbox.addEventListener("change", async () => {
				const input = checkbox as HTMLInputElement;
				const word = input.dataset.word;
				const isLearned = input.checked ? 1 : 0;

				try {
					const SQL = await initSqlJs({ locateFile: file => `../../sql/${file}` });
					// Load settings
					if (!this.plugin.settings) await this.plugin.loadSettings?.();
					const dbPath = getVocabDbPath(plugin);
					const data = await plugin.app.vault.adapter.readBinary(dbPath);
					const db = new SQL.Database(new Uint8Array(data));

					const stmt = db.prepare(`UPDATE MAIN SET learned = ? WHERE word = ?`);
					stmt.run([isLearned, word ?? ""]);
					stmt.free();

					const updated = db.export();
					await plugin.app.vault.adapter.writeBinary(dbPath, updated);
					db.close();

					new Notice(`✅ ${word} marked as ${isLearned ? "learned" : "unlearned"}`);
				} catch (err) {
					console.error(err);
					new Notice("❌ Failed to update word status.");
				}
			});
			checkbox.removeEventListener("change", () => {}); // Remove any previous listeners to avoid duplicates
		});
	});
}
