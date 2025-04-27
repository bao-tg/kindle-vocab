import { App, Modal, Notice, ButtonComponent, normalizePath, TFile, Vault } from 'obsidian';


export class DictionaryUploadModal extends Modal {
    private fileInputEl: HTMLInputElement;
    private allowedExtensions: Set<string> = new Set(['csv']);
    private targetFolder: string = '.obsidian/plugins/obsidian-kindle-vocab-plugin/src/data'; // Save here
    private targetFileName: string = 'dictionary.csv'; // Save as

    constructor(app: App) {
        super(app);
    }

    onOpen() {
        const { contentEl } = this;

        contentEl.createEl('h2', { text: 'Upload a Dictionary File (CSV)' });

        this.fileInputEl = contentEl.createEl('input', {
            type: 'file',
            attr: {
                accept: '.csv',
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

        const maxSizeInGB = 1;
        if (file.size > maxSizeInGB * 1024 * 1024 * 1024) {
            new Notice(`File is too large. Max allowed size: ${maxSizeInGB}MB.`);
            return;
        }

        try {
            const arrayBuffer = await file.arrayBuffer();
            const uint8Array = new Uint8Array(arrayBuffer);
            await this.saveFile(uint8Array);
            new Notice('Database uploaded and saved successfully!');
        } catch (err) {
            console.error(err);
            new Notice('Failed to save the database file.');
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
