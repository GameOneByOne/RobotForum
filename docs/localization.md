# Interface languages

Talovryn supports Chinese (`zh`, the default) and English (`en`). The header language button saves a one-year, same-site, HTTP-only `talovryn-locale` cookie through a Server Action. Next.js then renders the current route again, including server components, metadata and `<html lang>`, while preserving client component state such as editor drafts. No URL or database migration is needed.

Server components use `await getTranslator()` from `lib/i18n/server.ts`. Client components use `useI18n()` from the root `LanguageProvider`. Both use the same dictionary in `lib/i18n/messages.ts`; parameterized messages use `{0}`, `{1}`, etc. Cookie values other than `en` resolve to Chinese. Server-rendered language selection avoids a flash of the wrong language and keeps locale-specific HTML out of shared static page output.

Translate interface labels at the point of display. Keep stored category names, option values, learning metadata, slugs, search queries and database writes unchanged. Existing article titles, summaries, chapters, Markdown, user tags, project descriptions and comments retain their original language. Only newly created editor templates follow the language selected when they are created. Switching language must not replace text the user has already edited.

Add translations to the dictionary when adding UI. `npm test` checks supported locale resolution, agreed brand copy, parameterized messages, guest-name display and static Chinese translation-key coverage. Browser verification should cover both languages, reload/navigation persistence, form values, draft preservation and mobile layouts.
