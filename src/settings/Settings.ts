export interface MyPluginSettings {
	vocabDbPath: string;
	dictionaryCsvPath: string;
	sortOrder: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	vocabDbPath: '',
	dictionaryCsvPath: '',
	sortOrder: 'timestamp',
};
