import initSqlJs, { Database } from 'sql.js';
import { getVocabDbPath } from './PathHelper';
import { Vault, normalizePath, Notice } from 'obsidian';

/**
 * Generates interactive markdown with checkboxes for `learned` status.
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
 * Sets up a mutation observer to handle checkbox toggle and update the DB.
 */
export function setupCheckboxListeners(app: { vault: Vault }) {
	console.log('[VocabPlugin] setupCheckboxListeners() CALLED');

	const preview = document.querySelectorAll('.markdown-preview-view');
	if (!preview) {
		console.warn('[VocabPlugin] No markdown-preview-view found, retrying...');
		setTimeout(() => setupCheckboxListeners(app), 500);
		return;
	}

	if ((preview as any)._vocab_listener_attached) {
		console.log('[VocabPlugin] Listeners already attached, skipping...');
		return;
	}
	(preview as any)._vocab_listener_attached = true;

	preview.forEach((el) => {
		el.addEventListener('click', async (e) => {
			const target = e.target as HTMLElement;
			if (!target || target.tagName !== 'INPUT') return;

			const input = target as HTMLInputElement;
			if (input.type !== 'checkbox' || !input.dataset.word) return;

			const word = input.dataset.word;
			const isLearned = input.checked ? 1 : 0;

			console.log(`[DEBUG] Clicked: ${word} → ${isLearned}`);

			try {
				const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });
				const dbPath = getVocabDbPath();
				const arrayBuffer = await app.vault.adapter.readBinary(dbPath);
				const db = new SQL.Database(new Uint8Array(arrayBuffer));

				const updateStmt = db.prepare(`UPDATE MAIN SET learned = ? WHERE word = ?`);
				updateStmt.run([isLearned, word]);
				updateStmt.free();

				const updated = db.export();
				await app.vault.adapter.writeBinary(dbPath, updated);
				db.close();

				new Notice(`✅ ${word} marked as ${isLearned ? 'learned' : 'unlearned'}`);
			} catch (err) {
				console.error(err);
				new Notice('❌ Failed to update word status');
			}
		});
	});
}
