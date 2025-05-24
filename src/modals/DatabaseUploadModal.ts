import { App, Modal, Notice, ButtonComponent, normalizePath } from 'obsidian';
import initSqlJs from 'sql.js/dist/sql-wasm.js'; // ✅ This ensures wasm build is compatible


export class DatabaseUploadModal extends Modal {
	private fileInputEl: HTMLInputElement;
	private allowedExtensions: Set<string> = new Set(['db', 'sqlite', 'db3']);
	private targetFolder: string = '.obsidian/plugins/obsidian-kindle-vocab-plugin/src/data'; // Save here
	private targetFileName: string = 'vocab.db'; // Save as

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;

		contentEl.createEl('h2', { text: 'Upload a Vocabulary file (DB)' });

		this.fileInputEl = contentEl.createEl('input', {
			type: 'file',
			attr: {
				accept: '.db,.sqlite,.db3',
			}
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
			const arrayBuffer = await file.arrayBuffer();
			const SQL = await initSqlJs({ locateFile: file => `https://cdnjs.cloudflare.com/ajax/libs/sql.js/1.6.2/sql-wasm.wasm` });

			const vault = this.app.vault;
			const filePath = normalizePath(`${this.targetFolder}/${this.targetFileName}`);
			const currentExists = await vault.adapter.exists(filePath);

			if (!currentExists) {
				// ✅ File doesn't exist → directly save the uploaded file
				await this.saveFile(new Uint8Array(arrayBuffer));
				new Notice('✅ vocab.db uploaded successfully.');
			} else {
				// ✅ File exists → merge all tables except "dictionary"
				const currentDBData = await vault.adapter.readBinary(filePath);
				const currentDB = new SQL.Database(new Uint8Array(currentDBData));
				const newDB = new SQL.Database(new Uint8Array(arrayBuffer));

				const res = newDB.exec(`SELECT name FROM sqlite_master WHERE type='table';`);
				const newTables = res[0].values.map(row => row[0]).filter(name => name !== 'MAIN');

				for (const tableName of newTables) {
					const tableSQLs = newDB.exec(`SELECT sql FROM sqlite_master WHERE type='table' AND name='${tableName}'`);
					if (tableSQLs.length > 0) {
						const createSQL = tableSQLs[0].values[0][0];
						currentDB.run(`DROP TABLE IF EXISTS ${tableName};`);
						if (typeof createSQL === 'string') {
							currentDB.run(createSQL);
						}

						const rows = newDB.exec(`SELECT * FROM ${tableName}`);
						if (rows.length > 0) {
							const columns = rows[0].columns;
							for (const row of rows[0].values) {
								const placeholders = row.map(() => '?').join(', ');
								currentDB.run(
									`INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders});`,
									row
								);
							}
						}
					}
				}

				const mergedData = currentDB.export();
				await this.saveFile(new Uint8Array(mergedData));
				new Notice('✅ Database updated (excluding dictionary table).');
			}
		} catch (err) {
			console.error(err);
			new Notice('❌ Error processing the database file.');
		}

		this.close();
	}

	private async saveFile(data: Uint8Array) {
		const vault = this.app.vault;
		const folderPath = normalizePath(this.targetFolder);
		const filePath = normalizePath(`${this.targetFolder}/${this.targetFileName}`);

		// Ensure folder exists
		const folderExists = await vault.adapter.exists(folderPath);
		if (!folderExists) {
			await vault.createFolder(folderPath);
		}

		// If file already exists, delete it first (optional)
		const fileExists = await vault.adapter.exists(filePath);
		if (fileExists) {
			await vault.adapter.remove(filePath);
		}

		// Create file
		await vault.createBinary(filePath, data);
	}
	

	onClose() {
		const { contentEl } = this;
		contentEl.empty();
	}
}
