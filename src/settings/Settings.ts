export interface MyPluginSettings {
	sortOrder: string;
	markdownFolderPath: string;
}

export const DEFAULT_SETTINGS: MyPluginSettings = {
	sortOrder: 'timestamp',
	markdownFolderPath: '',
};
