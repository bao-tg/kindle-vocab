import { AbstractInputSuggest, App, Notice, Setting, TFolder } from 'obsidian';

// Custom suggester class for folder autocompletion
export class FolderSuggest extends AbstractInputSuggest<TFolder> {
  constructor(app: App, textInputEl: HTMLInputElement) {
    super(app, textInputEl);
  }

  // Get folder suggestions based on user input
  getSuggestions(input: string): TFolder[] {
    const folders = this.app.vault.getAllLoadedFiles().filter(isTFolder);
    if (!input) return folders;
    return folders.filter(folder =>
      folder.path.toLowerCase().includes(input.toLowerCase())
    );
  }

  // Render suggestion in the dropdown
  renderSuggestion(folder: TFolder, el: HTMLElement): void {
    el.setText(folder.path || 'Vault root');
  }

  // Handle selection of a folder
  selectSuggestion(folder: TFolder): void {
    this.setValue(folder.path || '');
    this.close();
  }
}

// Type guard for TFolder
export function isTFolder(f: any): f is TFolder {
  return f instanceof TFolder;
}

