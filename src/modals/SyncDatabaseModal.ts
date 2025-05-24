import { App, Modal, Notice, ButtonComponent, normalizePath, TFile } from 'obsidian';
import * as Papa from 'papaparse';
import initSqlJs from 'sql.js/dist/sql-wasm.js';
import { getVocabDbPath, getDictionaryCsvPath } from '../utils/PathHelper';

export class SyncDatabaseModal extends Modal {
	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Sync Your Vocabulary Builder' });

		contentEl.createEl('p', {
			text: 'This will synchronize your Kindle lookups and create a markdown summary. Make sure your vocab database and dictionary file are ready.'
		});

		const buttonContainer = contentEl.createDiv({ cls: 'sync-button-container' });

		new ButtonComponent(buttonContainer)
			.setButtonText('🔄 Start Sync')
			.setCta()
			.onClick(() => this.syncDatabase());
	}

	private async syncDatabase() {
		try {
			new Notice('Starting sync...');

			const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}` });
			const dbPath = getVocabDbPath();

			if (!(await this.app.vault.adapter.exists(dbPath))) {
				new Notice('❌ vocab.db not found.');
				throw new Error('vocab.db file not found.');
			}

			const arrayBuffer = await this.app.vault.adapter.readBinary(dbPath);
			const db = new SQL.Database(new Uint8Array(arrayBuffer));

			// Create MAIN if not exists
			db.run(`
				CREATE TABLE IF NOT EXISTS MAIN (
					word TEXT PRIMARY KEY,
					information TEXT,
					context TEXT,
					book_title TEXT,
					learned INTEGER DEFAULT 0
				)
			`);

			// Pull Kindle lookups
			const lookupData = db.exec(`
				SELECT w.word, l.usage, bi.title
				FROM LOOKUPS l
				JOIN WORDS w ON l.word_key = w.id
				JOIN BOOK_INFO bi ON l.book_key = bi.id
			`);
			const lookupRows = lookupData.length ? lookupData[0].values : [];

			let newWordCount = 0;

			const checkExistsStmt = db.prepare(`SELECT 1 FROM MAIN WHERE word = ?`);
			const insertStmt = db.prepare(`
				INSERT INTO MAIN (word, information, context, book_title, learned)
				VALUES (?, '', ?, ?, 0)
			`);

			for (const [word, context, bookTitle] of lookupRows) {
				if (!word) continue;

				checkExistsStmt.bind([word]);
				if (!checkExistsStmt.step()) {
					insertStmt.run([word, context || '', bookTitle || '']);
					newWordCount++;
				}
				checkExistsStmt.reset();
			}

			checkExistsStmt.free();
			insertStmt.free();

			// Optional: Sync dictionary CSV
			const csvPath = getDictionaryCsvPath();
			if (await this.app.vault.adapter.exists(csvPath)) {
				const csvContent = await this.app.vault.adapter.read(csvPath);
				const rows = await this.parseCsv(csvContent);

				const updateInfoStmt = db.prepare(`
					UPDATE MAIN SET information = ? WHERE word = ?
				`);
				for (const [word, info] of rows) {
					updateInfoStmt.run([info, word]);
				}
				updateInfoStmt.free();
			}

			// Generate Markdown
			const result = db.exec(`
				SELECT word, context, book_title, information, learned
				FROM MAIN
				ORDER BY rowid DESC
			`);

			if (result.length === 0 || result[0].values.length === 0) {
				new Notice('⚠️ No data to sync.');
				throw new Error('MAIN table is empty.');
			}

			const markdown = this.formatMarkdown(result[0]);
			const mdPath = normalizePath('My Vocabulary Builder.md');
			await this.app.vault.adapter.write(mdPath, markdown);

			const updatedDb = db.export();
			await this.app.vault.adapter.writeBinary(dbPath, updatedDb);
			db.close();

			new Notice(`✅ Sync complete! ${newWordCount} new word(s) added.`);

			const mdFile = this.app.vault.getAbstractFileByPath(mdPath);
			if (mdFile instanceof TFile) {
				await this.app.workspace.getLeaf(true).openFile(mdFile);
			}
		} catch (err) {
			console.error(err);
			new Notice('❌ Sync failed. Check console for details.');
		} finally {
			this.close();
		}
	}

	private async parseCsv(content: string): Promise<[string, string][]> {
		const parsed = Papa.parse<string[]>(content, {
			header: false,
			skipEmptyLines: true,
		});

		const rows: [string, string][] = [];
		for (let i = 1; i < parsed.data.length; i++) {
			const row = parsed.data[i];
			if (row.length >= 2) {
				const word = row[0].trim();
				const info = row[1].trim();
				rows.push([word, info]);
			}
		}
		return rows;
	}

	private formatMarkdown(result: any): string {
		const { columns, values } = result;
		let md = '# Recent Lookups\n\n';

		if (!values.length) return md + '_(No entries found)_';

		for (const row of values) {
			const word = row[columns.indexOf('word')]?.toString().trim() || '(unknown)';
			const context = row[columns.indexOf('context')]?.toString().trim() || '(none)';
			const title = row[columns.indexOf('book_title')]?.toString().trim() || '(none)';
			const info = row[columns.indexOf('information')]?.toString().trim() || '(none)';
			const learned = row[columns.indexOf('learned')] === 1 ? '[ x ]' : '[ ]';

			md += `## ${word}\n\n`;
			md += `- **Context**: ${context}\n`;
			md += `- **Book Title**: ${title}\n`;
			md += `- **Learned**: ${learned}\n`;
			md += `- **Definition**:\n\n${info}\n\n---\n`;
		}
		return md;
	}

	onClose() {
		this.contentEl.empty();
	}
}
