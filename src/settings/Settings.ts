export interface KindleVocabSettings {
	sortOrder: string;
	markdownFolderPath: string;
	assetsFolderPath: string;
}

export const DEFAULT_SETTINGS: KindleVocabSettings = {
	sortOrder: 'timestamp',
	markdownFolderPath: 'kindle-vocab/My Vocabulary Builder.md',
	assetsFolderPath: 'kindle-vocab/assets', 
};

