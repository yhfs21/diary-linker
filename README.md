# Diary Linker

Diary Linker adds a calendar view for your daily notes and keeps month/year/root notes linked together. Click a day to open (or create) the note for that date.

## What it does

- Adds a **Diary calendar** view with month navigation and a Today button.
- Creates a structured diary hierarchy: `<Diary folder>/<year>/<month>/<day>.md`.
- Ensures parent links are present:
  - root note → year note → month note → day note
- Uses a template note from your `Templates/` folder and replaces placeholders.

## How to use

1. Enable the plugin.
2. Open **Settings → Community plugins → Diary Linker**.
3. Set **Diary folder** (default: `Diary`).
4. Choose a template note from your `Templates/` folder.
5. Run the command **Open diary calendar**.
6. Click a date to open or create the note.

The plugin also opens the calendar view automatically on startup.

## Template placeholders

Your template note must include `{{diary-link}}`. The plugin replaces it with a link to the parent note.

Additional supported placeholders:

- `{{title}}` → note title (filename without `.md`)
- `{{date}}` → day number (`01`..`31`)
- `{{time}}` → current time (`HH:mm`)

Example template:

```md
# {{title}}

Created at {{time}}

{{diary-link}}
```

## Commands

- **Open diary calendar**: Opens the calendar view.

## Settings

- **Diary folder**: Root folder for diary notes (default: `Diary`).
- **Template note**: A note inside the `Templates/` folder. Must include `{{diary-link}}`.

## Privacy

- No network requests.
- No telemetry or analytics.
- Only reads/writes inside your vault.

## Development

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Manual install

Copy these files to `<Vault>/.obsidian/plugins/diary-linker/`:

- `main.js`
- `manifest.json`
- `styles.css`

## License

MIT
