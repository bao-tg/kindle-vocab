import { App, Modal, Notice, ButtonComponent, normalizePath } from 'obsidian';
import initSqlJs from 'sql.js/dist/sql-wasm.js';

export class DatabaseUploadModal extends Modal {
	private fileInputEl: HTMLInputElement;
	private readonly allowedExtensions = new Set(['db', 'sqlite', 'db3']);
	private readonly targetFolder = `${this.app.vault.configDir}/plugins/obsidian-kindle-vocab-plugin/src/data`;
	private readonly targetFileName = 'vocab.db';

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Upload a Vocabulary File (DB)' });

		this.fileInputEl = contentEl.createEl('input', {
			type: 'file',
			attr: { accept: '.db,.sqlite,.db3' },
		});

		new ButtonComponent(contentEl)
			.setButtonText('Upload')
			.setCta()
			.onClick(() => this.handleUpload());

		new ButtonComponent(contentEl)
			.setButtonText('Cancel')
			.onClick(() => this.close());
	}

	private async handleUpload() {
		const files = this.fileInputEl.files;
		if (!files || files.length === 0) {
			new Notice('No file selected.');
			return;
		}

		const file = files[0];
		const extension = file.name.split('.').pop()?.toLowerCase() || '';
		if (!this.allowedExtensions.has(extension)) {
			new Notice('Invalid file type. Please upload a valid database file.');
			return;
		}

		try {
			const buffer = new Uint8Array(await file.arrayBuffer());
			const SQL = await initSqlJs({
				locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/${file}`,
			});

			const vault = this.app.vault;
			const filePath = normalizePath(`${this.targetFolder}/${this.targetFileName}`);

			const fileExists = await vault.adapter.exists(filePath);
			if (!fileExists) {
				await this.saveFile(buffer);
				new Notice('✅ vocab.db uploaded successfully.');
			} else {
				await this.mergeDatabases(SQL, filePath, buffer);
				new Notice('✅ Database updated (excluding MAIN table).');
			}
		} catch (err) {
			console.error(err);
			new Notice('❌ Error processing the database file.');
		} finally {
			this.close();
		}
	}

	private async mergeDatabases(SQL: any, filePath: string, newData: Uint8Array) {
		const vault = this.app.vault;
		const currentData = await vault.adapter.readBinary(filePath);
		const currentDB = new SQL.Database(new Uint8Array(currentData));
		const newDB = new SQL.Database(newData);

		const tablesRes = newDB.exec(`SELECT name FROM sqlite_master WHERE type='table';`);
		const newTables = tablesRes?.[0]?.values?.map((row: any[]) => row[0]).filter((name: string) => name !== 'MAIN') || [];

		for (const tableName of newTables) {
			// Drop and recreate table
			const createSQL = newDB.exec(`SELECT sql FROM sqlite_master WHERE name='${tableName}' AND type='table';`);
			if (createSQL.length === 0) continue;

			currentDB.run(`DROP TABLE IF EXISTS ${tableName};`);
			currentDB.run(createSQL[0].values[0][0]);

			// Copy rows
			const rowsRes = newDB.exec(`SELECT * FROM ${tableName};`);
			if (rowsRes.length === 0) continue;

			const { columns, values } = rowsRes[0];
			for (const row of values) {
				const placeholders = row.map(() => '?').join(', ');
				currentDB.run(
					`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders});`,
					row
				);
			}
		}

		const mergedData = currentDB.export();
		await this.saveFile(new Uint8Array(mergedData));
	}

	private async saveFile(data: Uint8Array) {
		const vault = this.app.vault;
		const folderPath = normalizePath(this.targetFolder);
		const filePath = normalizePath(`${this.targetFolder}/${this.targetFileName}`);

		// Ensure folder exists
		if (!(await vault.adapter.exists(folderPath))) {
			await this.createFolderRecursively(folderPath);
		}

		// Remove old file
		if (await vault.adapter.exists(filePath)) {
			await vault.adapter.remove(filePath);
		}

		await vault.createBinary(filePath, data);
	}

	private async createFolderRecursively(path: string) {
		const parts = path.split('/');
		let currentPath = '';
		for (const part of parts) {
			currentPath = normalizePath(`${currentPath}/${part}`);
			if (!(await this.app.vault.adapter.exists(currentPath))) {
				await this.app.vault.createFolder(currentPath);
			}
		}
	}

	onClose() {
		this.contentEl.empty();
	}
}
