# Kindle Vocabulary Sync Plugin for Obsidian

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)  
[![Developer Docs](https://img.shields.io/badge/developers-documentation-green.svg)](https://bao-tg.github.io/blog/obsidian-kindle-vocab)

**Kindle Vocabulary Sync** is an Obsidian plugin that lets you import vocabulary lookups from your Kindle device and convert them into structured, interactive Markdown notes.

> Ideal for learners who want to build a personal vocabulary library and review it directly within Obsidian.

**Developed by:** [Bao Truong](https://github.com/bao-tg)

---

## Features

- Generate Markdown from your Kindle lookups (`vocab.db`)
- Integrate custom dictionary files (CSV format)
- Mark words as "Learned/Unlearned" using checkboxes
- View statistics such as percentage learned
- Sort words by timestamp or prioritize unlearned items

---

## Installation

Search for **“Kindle Vocabulary Sync”** in the [Obsidian Plugin Store](https://obsidian.md/plugins) and install it.

---

## How to Use

### 1. Upload Your Vocabulary Database

- Open the command palette (Ctrl + P) and run:  
  **`Upload your vocabulary database`**
- Select your `vocab.db` file.  
  You can find this file by connecting your Kindle to your computer via USB and searching for `vocab.db` inside the `Kindle (E:)` directory.

### 2. Upload a Dictionary File (CSV)

- Download a public dictionary file:
  - [Webster’s Dictionary CSV](https://github.com/matthewreagan/WebstersEnglishDictionary)
  - [wiktionary.csv (customized)](https://drive.google.com/file/d/1yyfdPqF0jJ7Y54PPgLq4_sS0SgJ8p537/view?usp=sharing)

> You may also upload your own dictionary file, provided that it is in CSV format with the structure:  
> `word, information`

- Run the command:  
  **`Upload your dictionary file`**  
  Then select your `.csv` dictionary file.

> ℹ️ Amazon dictionaries are DRM-protected and cannot be used. This plugin uses public alternatives like GCIDE and Wiktionary. The `wiktionary.csv` file is a customized version of data from [Wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Main_Page).

### 3. Sync and Review Vocabulary

- Click the **Sync** icon in the ribbon (left sidebar), or run the command:  
  **`Sync the vocabulary builder to your Obsidian`**
- In the popup modal, click **`Start Sync`**
- A new file named `My Vocabulary Builder.md` will be created
- Switch to **Preview mode (Ctrl + E)** to interact with checkboxes, and resync to track your learning progress


<img src="demo/demo.gif" alt="Demo" width="800">

---

## References

* [Obsidian Plugin Developer Docs](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
* [Obsidian API Reference](https://publish.obsidian.md/api/)
* [TypeScript Handbook](https://www.typescriptlang.org/docs/)
* [esbuild Documentation](https://esbuild.github.io/)
* [GCIDE Dictionary](https://gcide.gnu.org.ua/)
* [Webster’s Dictionary CSV](https://github.com/atthewreagan/WebstersEnglishDictionary)
* [Wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Main_Page)
* [Microsoft Docs – DRM](https://learn.microsoft.com/vi-vn/windows-hardware/drivers/audio/digital-rights-management)

---

## Additional Tools

Want to sync vocabulary directly to Anki?  
Check out: [KindleVocab2Anki](https://github.com/wzyboy/kindle_vocab_anki)

> ⚠️ Note: This tool may require **deDRM**, which is legally restricted in some regions.

---

## FAQ

**Q: Can I log in with my Amazon account and sync the vocab.db automatically?**  
**A:** No. You must manually upload the `vocab.db` file. Amazon does not provide an API or allow access to this file via account login.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Say Thanks

If you found this plugin useful, you can support its development:

<a href="https://www.buymeacoffee.com/baotg" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" width="140">
</a>

---

