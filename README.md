# HSBC UK Tavern Skin

A SillyTavern third-party extension that places an HSBC UK inspired interface shell over SillyTavern while preserving its native chat, settings, persona, character, prompt, API, world info, and extension controls.

## Release 1.0.3

- Restored the Cards page by rendering its controls before attaching event handlers.
- Added guarded page renderers and explicit visibility recovery for native panels moved into the shell.
- Kept prompt editing dialogs above the shell and restyled the prompt list as one grouped surface.
- Added a crisp white HSBC first-paint loader and removed the legacy example account amount.
- Hid the idle API welcome tip and refined the account card, User Settings, World Info, Characters, and Extensions layouts.

## Install

In SillyTavern, open Extensions, choose Install extension, and enter:

`https://github.com/kmbdxxx/tavern-test`

For local testing, place this project folder in SillyTavern's `public/scripts/extensions/third-party/` directory. The standalone project remains usable as a local import package.

## Files

- `manifest.json` - SillyTavern extension metadata.
- `index.js` - shell, native panel bridges, page rendering, and inline SVG icons.
- `style.css` - the HSBC UK visual system; the same stylesheet is embedded in `index.js` to reduce stale mobile CSS.
- `assets/cards/` - offline card artwork supplied for the persona card selector.

## Compatibility notes

The extension moves existing SillyTavern panels into its subpage host and restores them when navigating away. It does not replace SillyTavern's underlying data storage. The displayed account amount is a local visual preference and starts at a generic zero value.

Disable the extension from SillyTavern's Extensions panel to restore the native interface.
