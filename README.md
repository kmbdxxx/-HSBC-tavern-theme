# HSBC Tavern Theme

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
- The theme's language option translates only the theme's own texts, not SillyTavern's interface.
- Developer debug panel: off by default; it only appears when `localStorage` key `hsbc-tavern.debug` is set to `1`.

## License

MIT - see [LICENSE](LICENSE).
