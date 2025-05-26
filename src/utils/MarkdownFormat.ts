import initSqlJs, { Database } from 'sql.js';
import { getVocabDbPath } from './PathHelper';
import { Vault, normalizePath, Notice } from 'obsidian';

/**
 * Generate interactive markdown from the MAIN table.
 */
export async function generateMarkdown(db: Database, sortOrder: string): Promise<string> {
	let query = `
		SELECT word, context, book_title, information, learned
		FROM MAIN
	`;

	if (sortOrder === 'timestamp') {
		query += ` ORDER BY rowid DESC`;
	} else if (sortOrder === 'unlearned') {
		query += ` ORDER BY learned ASC, rowid DESC`;
	}

	const result = db.exec(query);
	if (!result.length || !result[0].values.length) {
		return '# Recent Lookups\n\n_(No entries found)_';
	}

	const { columns, values } = result[0];
	const learnedCount = values.filter(row => row[columns.indexOf('learned')] === 1).length;
	const totalCount = values.length;
	const percent = Math.round((learnedCount / totalCount) * 100);

	let md = `# Recent Lookups\n\n📘 You’ve learned **${learnedCount}** out of **${totalCount}** words (${percent}%)\n\n`;

	for (const row of values) {
		const word = row[columns.indexOf('word')]?.toString().trim() || '(unknown)';
		const context = row[columns.indexOf('context')]?.toString().trim() || '(none)';
		const title = row[columns.indexOf('book_title')]?.toString().trim() || '(none)';
		const info = row[columns.indexOf('information')]?.toString().trim() || '(none)';
		const learned = row[columns.indexOf('learned')] === 1;

		md += `## ${word}\n\n`;
		md += `- **Context**: ${context}\n`;
		md += `- **Book Title**: ${title}\n`;
		md += `- **Learned**: <input type="checkbox" data-word="${word}" ${learned ? 'checked' : ''} />\n`;
		md += `- **Definition**:\n\n${info}\n\n---\n`;
	}

	return md;
}

/**
 * Bind listeners to checkboxes in preview mode and update DB.
 */
export function setupCheckboxListeners(app: { vault: Vault }) {
	const previews = document.querySelectorAll('.markdown-preview-view');

	if (!previews.length) {
		console.warn('[VocabPlugin] No markdown-preview-view found, retrying...');
		setTimeout(() => setupCheckboxListeners(app), 500);
		return;
	}

	// Avoid duplicate listener attachment
	if ((previews as any)._vocab_listener_attached) return;
	(previews as any)._vocab_listener_attached = true;

	previews.forEach((el) => {
		el.addEventListener('click', async (e) => {
			const target = e.target as HTMLElement;
			if (target?.tagName !== 'INPUT') return;

			const input = target as HTMLInputElement;
			if (input.type !== 'checkbox' || !input.dataset.word) return;

			const word = input.dataset.word;
			const isLearned = input.checked ? 1 : 0;

			try {
				const SQL = await initSqlJs({
					locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`,
				});
				const dbPath = getVocabDbPath();
				const data = await app.vault.adapter.readBinary(dbPath);
				const db = new SQL.Database(new Uint8Array(data));

				const stmt = db.prepare(`UPDATE MAIN SET learned = ? WHERE word = ?`);
				stmt.run([isLearned, word]);
				stmt.free();

				const updated = db.export();
				await app.vault.adapter.writeBinary(dbPath, updated);
				db.close();

				new Notice(`✅ ${word} marked as ${isLearned ? 'learned' : 'unlearned'}`);
			} catch (err) {
				console.error(err);
				new Notice('❌ Failed to update word status.');
			}
		});
	});
}
