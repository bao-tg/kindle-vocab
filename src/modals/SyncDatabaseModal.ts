import { App, Modal, Notice, ButtonComponent, normalizePath, TFile } from 'obsidian';
import * as Papa from 'papaparse';
import initSqlJs from 'sql.js/dist/sql-wasm.js';
import { getVocabDbPath, getDictionaryCsvPath } from '../utils/PathHelper';
import { generateMarkdown } from '../utils/MarkdownFormat';
import KindleVocabPlugin from '../main';

export class SyncDatabaseModal extends Modal {
	constructor(app: App, private plugin: KindleVocabPlugin) {
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

			// Load vocab DB
			const SQL = await initSqlJs({ locateFile: file => `../../sql/${file}` });
			const dbPath = getVocabDbPath(this.plugin);

			if (!(await this.app.vault.adapter.exists(dbPath))) {
				throw new Error('❌ Vocab file not found.');
			}

			const arrayBuffer = await this.app.vault.adapter.readBinary(dbPath);
			const db = new SQL.Database(new Uint8Array(arrayBuffer));

			// Ensure MAIN table exists
			db.run(`
				CREATE TABLE IF NOT EXISTS MAIN (
					word TEXT PRIMARY KEY,
					information TEXT,
					context TEXT,
					book_title TEXT,
					learned INTEGER DEFAULT 0
				)
			`);

			// Extract Kindle lookup data
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

			// Optional: sync dictionary info from CSV
			const csvPath = getDictionaryCsvPath(this.plugin);
			if (await this.app.vault.adapter.exists(csvPath)) {
				const csvContent = await this.app.vault.adapter.read(csvPath);
				const rows = await this.parseCsv(csvContent);

				const updateInfoStmt = db.prepare(`UPDATE MAIN SET information = ? WHERE word = ?`);
				for (const [word, info] of rows) {
					updateInfoStmt.run([info, word]);
				}
				updateInfoStmt.free();
			}

			// Load settings and generate markdown
			if (!this.plugin.settings) await this.plugin.loadSettings?.();
			const sortOrder = this.plugin.settings?.sortOrder || 'timestamp';
			const markdown = await generateMarkdown(db, sortOrder);

			// Write markdown to file
			const folder = this.plugin.settings?.markdownFolderPath?.trim() || '';
			const fileName = 'My Vocabulary Builder.md';
			const mdPath = normalizePath(folder ? `${folder}/${fileName}` : fileName);

			// ✅ Create folder if it doesn't exist
			if (folder && !this.app.vault.getAbstractFileByPath(folder)) {
				await this.app.vault.createFolder(folder);
			}

			const existingFile = this.app.vault.getAbstractFileByPath(mdPath);
			if (existingFile instanceof TFile) {
				await this.app.vault.modify(existingFile, markdown);
			} else {
				await this.app.vault.create(mdPath, markdown);
			}


			// Save updated DB
			const updatedDb = db.export();
			await this.app.vault.adapter.writeBinary(dbPath, updatedDb);
			db.close();

			new Notice(`✅ Sync complete! ${newWordCount} new word(s) added.`);

			// Open markdown file
			const mdFile = this.app.vault.getAbstractFileByPath(mdPath);
			if (mdFile instanceof TFile) {
				await this.app.workspace.getLeaf(true).openFile(mdFile);
			}
		} catch (err) {
			console.error(err);
			new Notice((err as Error).message || '❌ Sync failed. Check console for details.');
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
				rows.push([row[0].trim(), row[1].trim()]);
			}
		}
		return rows;
	}

	onClose() {
		this.contentEl.empty();
	}
}
