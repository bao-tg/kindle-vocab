export interface MyPluginSettings {
	mySetting: string;
	dictionaryCsvPath?: string;
	vocabDbPath?: string;
}


export const DEFAULT_SETTINGS: MyPluginSettings = {
	mySetting: 'default'
};
