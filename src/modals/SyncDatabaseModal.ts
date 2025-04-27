import { App, Modal, Notice, ButtonComponent, normalizePath, TFile } from 'obsidian';
import * as Papa from 'papaparse';
import initSqlJs, { Database } from 'sql.js';
import { getVocabDbPath, getDictionaryCsvPath } from '../utils/PathHelper';
import { get } from 'http';

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
	
		const buttonContainer = contentEl.createDiv({
			cls: 'sync-button-container'
		});
	
		new ButtonComponent(buttonContainer)
			.setButtonText('🔄 Start Sync')
			.setCta()
			.onClick(() => this.syncDatabase());
	}
	

	private async syncDatabase() {
		try {
			new Notice('Starting sync...');
	
			// 1. Initialize SQL.js
			const SQL = await initSqlJs({ locateFile: (file) => `https://sql.js.org/dist/${file}` });
	
			// 2. Load vocab.db
			const dbPath = getVocabDbPath();
			if (!(await this.app.vault.adapter.exists(dbPath))) {
				new Notice('❌ vocab.db not found. Please upload your vocab database first.');
				throw new Error('vocab.db file not found.');
			}
			const arrayBuffer = await this.app.vault.adapter.readBinary(dbPath);
			const db = new SQL.Database(new Uint8Array(arrayBuffer));
	
			// 3. Drop old table if exists
			db.run(`DROP TABLE IF EXISTS "websters-dictionary"`);
	
			// 4. Create new table
			db.run(`
				CREATE TABLE "websters-dictionary" (
					word TEXT,
					information TEXT
				)
			`);
	
			// 5. Read CSV from Vault
			const csvPath = getDictionaryCsvPath();
			if (!(await this.app.vault.adapter.exists(csvPath))) {
				new Notice('❌ Dictionary CSV not found. Please upload your dictionary first.');
				throw new Error('Dictionary CSV file not found.');
			}
			const csvContent = await this.app.vault.adapter.read(csvPath);
			const rows = await this.parseCsv(csvContent);
	
			// 6. Insert each CSV row into the table
			const insertStmt = db.prepare(`
				INSERT INTO "websters-dictionary" (word, information) VALUES (?, ?)
			`);
			for (const [word, information] of rows) {
				insertStmt.run([word, information]);
			}
			insertStmt.free();
	
			// 7. Execute query for recent lookups
			const query = `
				SELECT 
					w.word AS looked_up_word,
					l.usage AS context,
					bi.title AS book_title,
					cd.information AS information
				FROM LOOKUPS l
				JOIN WORDS w ON l.word_key = w.id
				LEFT JOIN "websters-dictionary" cd ON w.word = cd.word
				JOIN BOOK_INFO bi ON l.book_key = bi.id
				ORDER BY l.timestamp DESC
			`;
	
			const result = db.exec(query);
	
			if (result.length === 0) {
				new Notice('⚠️ No recent lookups found in your vocab.db.');
				throw new Error('No lookup results found.');
			}
	
			const markdownContent = this.formatMarkdown(result[0]);
	
			// 8. Save Markdown file
			const mdPath = normalizePath('My Vocabulary Builder.md');
			await this.app.vault.adapter.write(mdPath, markdownContent);
	
			// 9. Save updated DB back
			const updatedDbArray = db.export();
			await this.app.vault.adapter.writeBinary(dbPath, updatedDbArray);
	
			db.close();
			new Notice('Sync complete! Markdown created.');
	
			// 10. Auto-open the Markdown file
			const recentLookupsFile = this.app.vault.getAbstractFileByPath(mdPath);
			if (recentLookupsFile instanceof TFile) {
				await this.app.workspace.getLeaf(true).openFile(recentLookupsFile);
			}
	
		} catch (error) {
			console.error(error);
			new Notice('Sync failed. Check console for more details.');
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
    
        // Skip header (first row)
        for (let i = 1; i < parsed.data.length; i++) {
            const row = parsed.data[i];
            if (row.length >= 2) {
                const word = row[0].trim();
                const information = row[1].trim();
                rows.push([word, information]);
            }
        }
    
        return rows;
    }

    private formatMarkdown(result: any): string {
        const { columns, values } = result;
        let md = '# Recent Lookups\n\n';
    
        for (let i = 0; i < values.length; i++) {
            const row = values[i];
            const lookedUpWord = (row[columns.indexOf('looked_up_word')] || '').toString().trim();
            const context = (row[columns.indexOf('context')] || '').toString().trim();
            const bookTitle = (row[columns.indexOf('book_title')] || '').toString().trim();
            const information = (row[columns.indexOf('information')] || '').toString().trim();
    
            md += `## ${lookedUpWord || '(unknown)'}\n\n`;
            md += `- **Context**: ${context || '(none)'}\n`;
            md += `- **Book Title**: ${bookTitle || '(none)'}\n`;
            md += `- **Definition**:\n\n${information}\n\n`;  // <--- Leave information exactly as-is!
        }
    
        return md;
    }
    

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
