import { normalizePath } from 'obsidian';

export function getVocabDbPath(): string {
	return normalizePath(`${this.app.vault.configDir}/plugins/kindle-vocab/src/data/vocab.db`);
}

export function getDictionaryCsvPath(): string {
	return normalizePath(`${this.app.vault.configDir}/plugins/kindle-vocab/src/data/dictionary.csv`);
}

export function getdatafolderPath(): string {
	return normalizePath(`${this.app.vault.configDir}/plugins/kindle-vocab/src/data`);
}

export function getMarkdownOutputPath(): string {
	return normalizePath('My Vocabulary Builder.md');
}
