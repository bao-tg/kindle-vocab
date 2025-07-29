import { normalizePath } from 'obsidian';
import KindleVocabPlugin from 'src/main';
import { DEFAULT_SETTINGS } from 'src/settings/Settings';

function getAssetsFolder(plugin: KindleVocabPlugin): string {
	return plugin.settings?.assetsFolderPath ?? DEFAULT_SETTINGS.assetsFolderPath;
}

function getMarkdownFolder(plugin: KindleVocabPlugin): string {
	return plugin.settings?.markdownFolderPath ?? DEFAULT_SETTINGS.markdownFolderPath;
}

export function getVocabDbPath(plugin: KindleVocabPlugin): string {
	const folder = getAssetsFolder(plugin);
	return normalizePath(`${folder}/vocab.db`);
}

export function getDictionaryCsvPath(plugin: KindleVocabPlugin): string {
	const folder = getAssetsFolder(plugin);
	return normalizePath(`${folder}/dictionary.csv`);
}

export function getAssetsFolderPath(plugin: KindleVocabPlugin): string {
	return normalizePath(getAssetsFolder(plugin));
}

export function getMarkdownOutputPath(plugin: KindleVocabPlugin): string {
	return normalizePath(getMarkdownFolder(plugin));
}
