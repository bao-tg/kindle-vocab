import { Plugin, Notice } from 'obsidian';
import { SyncDatabaseModal } from '../modals/SyncDatabaseModal';

export function registerRibbons(plugin: Plugin) {
	// Ribbon: Sync Database
	const syncRibbon = plugin.addRibbonIcon('book-open', 'Sync kindle vocabulary', () => {
        new SyncDatabaseModal(plugin.app, this).open();
    });
}
