import { App, Modal, Notice, ButtonComponent, normalizePath, TFile } from 'obsidian';

export class DictionaryUploadModal extends Modal {
	private fileInputEl: HTMLInputElement;
	private readonly allowedExtensions = new Set(['csv']);
	private readonly targetFolder = '.obsidian/plugins/obsidian-kindle-vocab-plugin/src/data';
	private readonly targetFileName = 'dictionary.csv';

	constructor(app: App) {
		super(app);
	}

	onOpen() {
		const { contentEl } = this;
		contentEl.empty();

		contentEl.createEl('h2', { text: 'Upload a Dictionary File (CSV)' });

		this.fileInputEl = contentEl.createEl('input', {
			type: 'file',
			attr: { accept: '.csv' },
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
			new Notice('Invalid file type. Please upload a valid CSV file.');
			return;
		}

		const maxSizeMB = 1024;
		if (file.size > maxSizeMB * 1024 * 1024) {
			new Notice(`File too large. Max allowed size: ${maxSizeMB}MB.`);
			return;
		}

		try {
			const arrayBuffer = await file.arrayBuffer();
			await this.saveFile(new Uint8Array(arrayBuffer));
			new Notice('✅ Dictionary uploaded and saved successfully!');
		} catch (err) {
			console.error(err);
			new Notice('❌ Failed to save the dictionary file.');
		} finally {
			this.close();
		}
	}

	private async saveFile(data: Uint8Array) {
		const vault = this.app.vault;
		const folderPath = normalizePath(this.targetFolder);
		const filePath = normalizePath(`${this.targetFolder}/${this.targetFileName}`);

		// Ensure folder exists (create recursively if needed)
		if (!(await vault.adapter.exists(folderPath))) {
			await this.createFolderRecursively(folderPath);
		}

		// Replace existing file
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
