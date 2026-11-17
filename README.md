# 测试 · HSBC UK Tavern Skin

An offline, third-party SillyTavern UI extension inspired by the supplied HSBC UK mobile app screenshots. It adds a compact banking-style navigation, three chat shortcut pages, a responsive message composer and a right-side Library drawer. Icons and illustrations are inline SVG; no remote images, fonts, or runtime services are required.

## Update 0.3.0

This update fixes narrow-screen message overflow and the Library drawer stacking order, reapplies the HSBC stylesheet after SillyTavern custom CSS, normalizes message and composer typography, and adds a short offline vector splash inspired by the supplied mobile welcome screen. The splash is a visual transition only and does not simulate banking authentication.

## Install for local testing

In SillyTavern, open **Extensions → Install extension**, enter `https://github.com/kmbdxxx/tavern-test`, then install and enable **测试**. To update later, use **Manage extensions → Update**.

The repository root contains `manifest.json`, `index.js`, `style.css`, and this README so it can be installed directly from GitHub.

## Navigation mapping

| HSBC label | SillyTavern destination |
| --- | --- |
| Home | AI response configuration / presets |
| Pay | Active API connection panel |
| Cards | Persona manager |
| Save & Invest | Extensions panel |
| Products and services | Character list |
| Money trends | World Info (if present in this ST version) |
| Insurance | Background selector |
| Security and fraud | Advanced formatting (when exposed by the host) |
| User icon | User settings |

The extension invokes existing host controls and leaves host settings, personas, chats and API credentials under SillyTavern's own storage. Unavailable host controls are skipped safely.

## Shortcuts

The pages are switched with the numbered controls or previous/next arrows. Page 1 opens with **Chat**, page 2 groups tools, and page 3 can keep commonly used shortcuts. Use **＋ Add shortcut** with a supported shortcut name; drag shortcuts to reorder and right-click to remove one. On **Cards**, the strip reads personas from SillyTavern's native persona manager. Its switch toggles a swipeable debit-card presentation and a compact list; upload a custom face for the currently selected card. Preferences and uploaded card art are stored in this browser's local storage under `hsbc-tavern.preferences.v1`.

## Notes

- Visuals are an independent community skin inspired by HSBC UK, not an official HSBC product or affiliation.
- This extension only adds presentation and click-through navigation; it does not replace SillyTavern workflows or persist chat data itself.
- The exact selectors for optional panels vary across SillyTavern versions. The extension tries known host controls and degrades without blocking the rest of the UI.
- To disable cleanly, switch the extension off in SillyTavern's Extensions panel and reload.
