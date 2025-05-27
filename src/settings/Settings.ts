export interface KindleVocabSettings {
	sortOrder: string;
	markdownFolderPath: string;
}

export const DEFAULT_SETTINGS: KindleVocabSettings = {
	sortOrder: 'timestamp',
	markdownFolderPath: '',
};
