import { normalizePath } from 'obsidian';

export function getVocabDbPath(): string {
	return normalizePath('.obsidian/plugins/obsidian-kindle-vocab-plugin/src/data/vocab.db');
}

export function getDictionaryCsvPath(): string {
	return normalizePath('.obsidian/plugins/obsidian-kindle-vocab-plugin/src/data/dictionary.csv');
}

export function getdatafolderPath(): string {
	return normalizePath('.obsidian/plugins/obsidian-kindle-vocab-plugin/src/data');
}

export function getMarkdownOutputPath(): string {
	return normalizePath('My Vocabulary Builder.md');
}
