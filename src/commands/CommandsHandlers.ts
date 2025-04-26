import { Editor, MarkdownView } from 'obsidian';
import { SampleModal } from '../modals/SampleModal';
import MyPlugin from '../main';
import { DatabaseUploadModal } from '../modals/DatabaseUploadModal';

export function registerCommands(plugin: MyPlugin) {
	plugin.addCommand({
		id: 'Upload your vocabulary database',
		name: 'Upload your vocabulary database',
		callback: () => {
			new DatabaseUploadModal(this.app).open();
		}
	});
}
