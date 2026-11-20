# HSBC Tavern Theme

Repository: https://github.com/kmbdxxx/-HSBC-tavern-theme

An unofficial, HSBC-UK-mobile-app-inspired skin for [SillyTavern](https://github.com/SillyTavern/SillyTavern).
It wraps SillyTavern in a banking-app style shell while keeping every native SillyTavern feature reachable.

> **Disclaimer**
> Unofficial fan-made theme for SillyTavern. Not affiliated with, endorsed by, or connected to HSBC Holdings plc or any HSBC group company.
> HSBC and the hexagon logo are trademarks of their owners; no commercial use.

## Features

- Banking-app shell: header tabs (Home / Pay / Cards / Save & Invest), Library drawer, welcome screen, account tile with recent chats.
- SillyTavern pages restyled in one flat look: Presets, API connections, Characters (list and editor), World Info, Extensions,
  Backgrounds, Advanced formatting, User settings, popups and toasts.
- Mobile layout (tested at 360-392 px wide) and desktop layout.
- Quick Reply drawer: a thin handle on the line above the input bar; the Quick Reply buttons of all extensions flow in one wrapping row.
  Can be switched to a plain always-visible strip.
- Language option for the theme's own texts: English, 简体中文, 繁體中文, 粵語.
- Stop button: while SillyTavern is generating, the send arrow turns into a stop button (forwards to SillyTavern's own stop).
- Chinese Subtitles (Personas page): optional Chinese line under each action, in Simplified, Traditional or Cantonese wording to match the theme language. Off by default.
- Popups: close buttons always reachable (Manage chat files: X pinned top-right, tap outside to close).
- Chat input grows when other extensions fill it by code (e.g. suggested replies); one extra line of height before it scrolls.
- Manage chat files on phones: centred panel, one content edge, X centred on the title line; Presets on phones: grouped prompts no longer indented.
- Phones: the prompt edit (pencil) popup opens fully on screen (header with close X, fields scroll inside, Save always visible).
- Products and services opens the current character's page first when a character chat is open; the list button still shows the list.
- Manage extensions: extensions with an update get an amber dot and an "Update" tag next to the name; on phones the top buttons stack one per row and the third-party header no longer clips.
- Presets: one column system for group rows and prompt rows (titles, handles, names and controls line up; 36px controls end at the content edge), also without the grouping extension.
- Extensions > Regex: flat HSBC layout on the page content edge (red outlined buttons, 36px icon squares, flat group rows); stop button shows only a short rotating arc (no track ring).
- Enter adds a new line by default (phone and desktop); send with the send button. Theme setting "Enter key sends message" restores sending on Enter.
- Chat input: no scrollbar on phones, a 4px light scrollbar on desktop. Phones: the chat panel (or the Home tile) starts directly under the tab bar.
- Extensions > Regex opens faster: off-screen script rows skip layout (same look).
- Regex/ticket blocks that copy the message colour now get the skin ink (the hidden message template uses it). Desktop Presets: Multi-select and Remove selected buttons (removes prompts from the current list like the single remove icon).
- No blurred text: the UI theme text shadow is switched off while the skin is on (also in other extensions' panels and toasts).
- JS-Slash-Runner (Tavern Helper) windows (new script / folder, import, built-in library) open above the skin instead of underneath it.
- Welcome card image: choose your own picture for the welcome screen (stored in the extension settings), reset to default any time.

All options live in **Extensions → HSBC UK Theme Settings**.

## Install

- SillyTavern → **Extensions** → **Install extension** → paste this repository's URL, or
- copy this folder to `SillyTavern/public/scripts/extensions/third-party/`.

Reload SillyTavern afterwards.

Updating from an older copy installed under a different folder name (for example `tavern-test`): disable or remove the old folder first,
so that only one copy of the theme is loaded. Your theme preferences are kept (they are stored by key, not by folder name).

## Tested with

SillyTavern 1.19.0 (desktop browser and mobile browser).

## Disable / uninstall

- Disable: Extensions → Manage extensions → switch the theme off, then reload. SillyTavern's own interface comes back unchanged.
- Uninstall: delete the extension in Manage extensions (or remove its folder from `public/scripts/extensions/third-party/`) and reload.

The theme does not modify SillyTavern's files. While it is active it hides your Custom CSS theme; it is restored when the theme is off.

## Known limitations

- Other extensions' own windows and widgets keep their own look; some may appear different inside the theme.
- The theme's language option translates only the theme's own texts, never SillyTavern's interface (set that in User Settings → Language).
- Developer debug panel: off by default; it only appears when `localStorage` key `hsbc-tavern.debug` is set to `1`.

## License

MIT - see [LICENSE](LICENSE).
