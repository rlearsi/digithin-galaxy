# 🌐 Translating Digithin Galaxy / Traduzindo o Digithin Galaxy

Digithin Galaxy uses a modern, single-file JSON architecture for each language. Translators **do not need any programming knowledge** — simply edit a single JSON file.

O Digithin Galaxy utiliza uma arquitetura moderna de arquivo JSON único para cada idioma. Tradutores **não precisam de nenhum conhecimento de programação** — basta editar um único arquivo JSON.

---

## 📁 File Structure / Estrutura de Arquivos

All translation files are located in the [`locales/`](file:///opt/lampp/htdocs/digithin-galaxy/locales/) directory:

```
locales/
  ├── en.json    # English (Default)
  ├── pt.json    # Português
  ├── fr.json    # Français
  ├── de.json    # Deutsch
  ├── ja.json    # 日本語
  ├── ko.json    # 한국어
  └── zh.json    # 简体中文
```

---

## 🚀 How to Add a New Language / Como Adicionar um Novo Idioma

1. **Copy the base template:**  
   Copy [`locales/en.json`](file:///opt/lampp/htdocs/digithin-galaxy/locales/en.json) and rename it to your target ISO 639-1 language code (for example, `locales/es.json` for Spanish, `locales/ru.json` for Russian, `locales/it.json` for Italian).

2. **Translate the sections inside the file:**  
   Each language pack has 5 clean sections:

   * `"ui"`: All user interface strings (buttons, HUD labels, modal titles, rules, privacy policy).
   * `"syllables"`: Common syllables for falling cosmic tokens in your language.
   * `"words"`: Cosmic, astronomical and astrophysics vocabulary words with categories and dictionary meanings (`text`, `type`, `meaning`).
   * `"bossWords"`: Thematic dialogue, names and concepts for the 6 Alien Invader Commanders (`xylarion`, `zorkon`, `vespera`, `kragthor`, `nebulor`, `xenor`).
   * `"trainingWorlds"`: The 4 keyboard training worlds adapted for your keyboard layout (Home Row, Top Row, Bottom Row, Accents/Symbols).

3. **Register the language code:**  
   Add your language code (e.g., `'es'`, `'ru'`) to the `SUPPORTED_LANGUAGES` array in [`js/i18n.js`](file:///opt/lampp/htdocs/digithin-galaxy/js/i18n.js) and as an `<option>` in the settings dropdown in [`index.html`](file:///opt/lampp/htdocs/digithin-galaxy/index.html) and [`privacy.html`](file:///opt/lampp/htdocs/digithin-galaxy/privacy.html).

4. **Submit a Pull Request on GitHub!**

---

## 💡 Important Tips for Translators / Dicas Importantes

- Keep the JSON format valid (ensure quotation marks `"..."` and commas `,` are respected).
- You can validate your JSON file easily on [jsonlint.com](https://jsonlint.com/) or by opening it in VS Code.
- Do not alter the keys on the left (e.g., `"btn_start"`), only translate the values on the right (`"Start Game"` → `"Iniciar Jogo"`).
- Words in the `"words"` list should adhere to the space exploration, celestial bodies, and cosmic science theme of Digithin Galaxy.
