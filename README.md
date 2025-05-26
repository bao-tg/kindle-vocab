# Kindle Vocabulary Sync Plugin for Obsidian

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)  
[![Developer Docs](https://img.shields.io/badge/developers-documentation-green.svg)](https://bao-tg.github.io/blog/Obsidian_Kindle_Vocab)

**Kindle Vocabulary Sync** is a powerful Obsidian plugin that allows users to seamlessly import vocabulary lookups from Kindle devices and convert them into structured, interactive Markdown notes.

**Ideal for learners who want to build a personal vocabulary library and study words directly within Obsidian.**

**Developed by:** [Bao Truong](https://github.com/bao-tg)

---

## Features

- Generate Markdown from your Kindle lookups (`vocab.db`)
- Integrate your own dictionary files (CSV)
- Mark words as "Learned/Unlearned" with checkbox interactivity
- View stats like % learned
- Sort words by timestamp or unlearned-first

---

## Installation

1. Search for **“Kindle Vocabulary Sync”** in the [Obsidian Plugin Store](https://obsidian.md/plugins) and install it  
   — or —
2. Clone this repository and place it in your local `.obsidian/plugins/` folder.

---

## How to Use

### 1. Upload Your Vocabulary Database

- Run the command: **`Upload your vocabulary database`**
- Select your `vocab.db` file (usually found in `Kindle/system/vocabulary/`)

### 2. Upload a Dictionary File (CSV)

- Download a public dictionary file:
  - 📘 [Webster’s Dictionary CSV](https://github.com/matthewreagan/WebstersEnglishDictionary).
  - 🧠 [wiktionary.csv](https://drive.google.com/file/d/1yyfdPqF0jJ7Y54PPgLq4_sS0SgJ8p537/view?usp=sharing). 
  - You may upload a custom dictionary file, provided that it is in CSV format with the structure: `word, information`.
- Run the command: **`Upload your dictionary file`**.

> ℹ️ Note: Amazon dictionaries are DRM-protected and cannot be used. We use public alternatives like GCIDE/Webster.

### 3. Sync and Review Vocabulary

- Click the **Sync** icon in the ribbon (left sidebar)
- In the modal popup, click **`Start Sync`**
- A file `My Vocabulary Builder.md` will be created
- Use checkboxes to track learning progress directly in Obsidian

---

## References

- [Obsidian Plugin Developer Guide](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)
- [GCIDE Dictionary](https://gcide.gnu.org.ua/)
- [Webster’s Dictionary CSV](https://github.com/matthewreagan/WebstersEnglishDictionary)
- [Wiktionary](https://en.wiktionary.org/wiki/Wiktionary:Main_Page)
- [Microsoft Docs – DRM](https://learn.microsoft.com/vi-vn/windows-hardware/drivers/audio/digital-rights-management)

---

## Additional Tools

Want to sync directly to Anki?  
See this repo: [KindleVocab2Anki](https://github.com/wzyboy/kindle_vocab_anki)

> ⚠️ Note: It may require deDRM, which is legally sensitive in some regions.

---

## FAQ

**Q: Can I log in with my Amazon account and auto-sync the vocab.db?**  
**A:** No. You need to manually upload the file. Amazon does not provide an API or allow direct sync access.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Say Thanks

If you found this plugin useful, you can support its development:

[![Buy Me a Coffee](https://cdn.buymeacoffee.com/buttons/v2/default-violet.png)](https://www.buymeacoffee.com/baotg)

---

