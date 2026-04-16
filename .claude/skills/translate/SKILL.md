---
name: translate
description: Translate changed English locale keys into all other languages
allowed-tools: Read, Write, Edit, Bash, Glob
---

Translate changed English locale keys into all other languages.

Here are the current changes to the English locale files:

```diff
!`git diff HEAD -- src/shared/locales/en/ 2>/dev/null || echo "No changes detected in English locale files."`
```

## Steps

1. Using the diff above, identify which namespace files changed. For any file that is new (not in git history), treat all keys as added. If the diff is empty, stop and report that there is nothing to translate.

2. Identify:
   - **Added keys**: present in the current file but not in the committed version
   - **Updated keys**: present in both but with a different English value
   - **Removed keys**: present in the committed version but not in the current file

   Flatten nested objects to dot-notation for comparison (e.g. `{"a": {"b": "hi"}}` becomes `a.b = "hi"`).

3. If there are no changes across any namespace, stop and report that there is nothing to translate.

4. For each other locale directory (`de`, `pt-br`, `zh`, `zh-Hant`), apply changes to every namespace:
   - **Remove** deleted keys
   - **Translate** added/updated English values into the target language and insert them
   - Preserve all unchanged keys and their existing translations as-is

5. Write the updated JSON files with 2-space indentation.

## Translation rules

- Preserve interpolation placeholders exactly as they appear: `{{variable}}`, `{variable}`, `<1>`, `%s`, etc.
- Translate naturally for the target language — do not transliterate.
- Consult `glossary.md` in this directory for project-specific terminology.
- Target languages:
  - `de` = German
  - `pt-br` = Brazilian Portuguese
  - `zh` = Simplified Chinese
  - `zh-Hant` = Traditional Chinese

## Important

- Only modify non-English locale files. Never modify the `en` files.
- Keep the same key structure and ordering as the English file.
- If a namespace file does not exist yet for a locale, create it with all keys translated.
