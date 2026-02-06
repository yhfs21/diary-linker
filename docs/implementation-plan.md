# Diary Linker Implementation Plan

## Goal summary
Build an Obsidian Community Plugin that:
- Lets users configure a diary root folder and a template note for diary entries.
- Requires the template to contain `{{diary-link}}` placeholder.
- Shows a calendar in the right sidebar; clicking a date opens the corresponding note (creating it if missing).
- Creates nested folders and index notes: `YYYY/`, `YYYY-MM/`, `YYYY-MM-DD.md` (with names exactly `YYYY`, `YYYY-MM`, `YYYY-MM-DD`).
- Replaces `{{diary-link}}` with the correct inter-note links at each level:
  - Diary root note → link to template note
  - `YYYY` note → link to diary root note
  - `YYYY-MM` note → link to `YYYY` note
  - `YYYY-MM-DD` note → link to `YYYY-MM` note

## Assumptions (confirm if needed)
- Note links should use standard wiki links `[[note name]]` (not `[[path/to/note]]`).
- The “diary root note” is a note with the same name as the diary folder (e.g. `Daily.md`) stored at the diary root folder level.
- The “template note” is referenced by a note path or name that the user selects in settings.

## File structure (target)
```
src/
  main.ts
  settings.ts
  commands/
    index.ts
  ui/
    calendar-view.ts
    calendar-component.ts
  diary/
    diary-paths.ts
    diary-note.ts
    diary-links.ts
  utils/
    dates.ts
    vault.ts
  types.ts
```

## Detailed plan

### 1. Settings and validation
- Extend settings to include:
  - `diaryFolder` (string)
  - `templateNote` (string: file path or note name)
- Add validation helpers:
  - Ensure `diaryFolder` is not empty.
  - Ensure `templateNote` resolves to an existing file.
  - When invalid, show a `Notice` and disable calendar actions.
- Settings UI:
  - “Diary folder” (text input)
  - “Template note” (text input + optional “Pick file” button using `app.fileManager` / file picker).
  - Inline help text: “Template must include `{{diary-link}}`.”

### 2. Calendar UI in right sidebar
- Register a custom view (e.g. `DIARY_CALENDAR_VIEW`) and add it to right sidebar on load.
- Implement a simple month grid component (no heavy dependencies):
  - Header with month/year and prev/next buttons.
  - 7-column weekday grid.
  - Days are clickable; clicking triggers `openOrCreateDiary(date)`.
- Persist the last viewed month in view state (optional).
- Ensure view cleanup via `this.registerView` and `this.registerEvent`.

### 3. Date and path utilities
- `dates.ts`: format helpers for `YYYY`, `YYYY-MM`, `YYYY-MM-DD`, and local date handling.
- `diary-paths.ts`: compute:
  - diary root folder path
  - `YYYY/` folder path
  - `YYYY-MM/` folder path
  - file paths for `YYYY.md`, `YYYY-MM.md`, `YYYY-MM-DD.md`
- `vault.ts`: wrappers for `getOrCreateFolder`, `getOrCreateFile`, `readFile`, `writeFile` with error handling.

### 4. Creation flow (open-or-create)
- On day click:
  1. Validate settings and template file existence.
  2. Ensure folder structure exists:
     - diary root folder
     - `YYYY/` folder
     - `YYYY-MM/` folder
  3. Ensure index notes exist:
     - diary root note (`<diaryFolder>/<diaryFolder>.md`)
     - `YYYY.md` inside diary root folder
     - `YYYY-MM.md` inside `YYYY/`
  4. Ensure day note exists in `YYYY-MM/`.
  5. Replace `{{diary-link}}` in each note with the appropriate link target.
  6. Open day note in active leaf.

### 5. Placeholder replacement rules
- Define `resolveDiaryLink(noteType)`:
  - `root` → `[[templateNote]]`
  - `year` → `[[<diaryRootName>]]`
  - `month` → `[[YYYY]]`
  - `day` → `[[YYYY-MM]]`
- Replace only the first occurrence (or all occurrences) of `{{diary-link}}` in each note. Decide behavior and document it in README.
- If placeholder is missing, optionally append a link section at the end (confirm desired behavior).

### 6. Commands (optional, future)
- Add commands:
  - “Open diary calendar” (focus the right sidebar view)
  - “Create/open today’s diary”

### 7. Error handling and UX
- Use `Notice` for:
  - invalid settings
  - missing template note
  - file creation errors
- Keep onload light; initialize view and settings only.

### 8. Testing checklist (manual)
- Calendar appears in right sidebar.
- Clicking a date creates expected folder + files.
- Links are inserted correctly at each level.
- Existing files are opened without duplication.
- Template placeholder enforcement works (warns when missing).

## Open questions
1. How should the user specify the template note: note name only, full path, or a picker to select a file?
2. Should `{{diary-link}}` replacement be “first occurrence only” or “all occurrences”? If missing, should we append a link block or warn only?
3. For links, should we use `[[Note]]` or `[[path/to/Note]]` to avoid name collisions?
4. Is the “diary root note” expected to be `<diaryFolder>/<diaryFolder>.md`, or a fixed name like `index.md`?

## Next steps
- Confirm answers to open questions.
- Implement modules per the structure above.
- Run `npm run build` and verify the plugin loads in Obsidian.
