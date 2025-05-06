# Kindle Vocabulary Sync Plugin for Obsidian

[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://opensource.org/licenses/MIT)  
[![Developers' documentation](https://img.shields.io/badge/documentation-green.svg)](https://bao-tg.github.io/blog/Obsidian_Kindle_Vocab)

**Kindle Vocabulary Sync** is a powerful Obsidian plugin that enables users to seamlessly import vocabulary lookups from Kindle devices and convert them into structured Markdown notes. Designed for lifelong learners, this tool helps build a personalized vocabulary library within Obsidian for review, study, and long-term retention.

**Developed and maintained by:**  
**Bao Truong**

---

## Features

- Automatically generates a Markdown file summarizing your recent Kindle lookups.
- One-click sync from within Obsidian.
- Supports custom dictionary sources.

---

## Installation

1. Download the latest release of **Kindle Vocabulary Sync**.
2. Place the plugin folder into your Obsidian vault under `.obsidian/plugins/`.
3. Reload Obsidian and enable the plugin via **Settings → Community Plugins**.

---

## How to Use

1. Open the command palette and run **"Upload your vocabulary database"**.  
   Upload your Kindle `vocab.db` file (retrieved by connecting your Kindle to your computer).

![Image 1](image/image.png)

2. Download the dictionary file here:  
   📘 [websters-dictionary.csv](https://drive.google.com/file/d/1HV95XUzdCYExa1_eXrRbHHtCk4itSlYJ/view?usp=sharing)  
   _Note: Amazon's dictionary is DRM-protected ([read more](https://learn.microsoft.com/vi-vn/windows-hardware/drivers/audio/digital-rights-management)), so we use a public alternative._
3. Run **"Upload your dictionary file"** and select the downloaded `websters-dictionary.csv`.
4. Click the **Sync** icon in the left sidebar ribbon.
5. In the modal popup, click **Start Sync**.

![Image 2](image/image-1.png)

6. A new file named `My Vocabulary Builder.md` will be generated containing your lookups and definitions.
7. Review, edit, and study your vocabulary directly in Obsidian.

---

## FAQ

**Q: Can I use my own dictionary file?**  
A: Yes. You can update the dictionary path in Settings. Make sure the file follows the `[word, definition]` format.

**Q: What happens if I already have a `My Vocabulary Builder.md` file?**  
A: It will be automatically overwritten with the latest synced content.

---

## References

- [Obsidian Plugin Developer Guide](https://docs.obsidian.md/Plugins/Getting+started/Build+a+plugin)  
- [GCIDE: GNU Collaborative International Dictionary of English](https://gcide.gnu.org.ua/)  
- [Webster’s Dictionary CSV on GitHub](https://github.com/matthewreagan/WebstersEnglishDictionary)  
- [Microsoft Docs on DRM](https://learn.microsoft.com/vi-vn/windows-hardware/drivers/audio/digital-rights-management)

---

## Future Features

- Sync directly with Amazon accounts, removing the need to manually upload `vocab.db`.

---

## License

This project is licensed under the [MIT License](https://opensource.org/licenses/MIT).

---

## Say Thanks

If you like this plugin and would like to support its development, you can:

<a href="https://www.buymeacoffee.com/baotg" target="_blank">
  <img src="https://cdn.buymeacoffee.com/buttons/v2/default-violet.png" alt="Buy Me A Coffee" width="140">
</a>
