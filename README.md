# hrlw.dev

Static landing page for hrlw.dev: a friendly little desktop of personal projects and tools. Plain HTML, CSS and JavaScript, no build step, no external requests. Served via GitHub Pages; `CNAME` sets the domain.

- `index.html`: all content and the inline SVG wallpaper and icons. Readable and usable without JavaScript.
- `style.css`: theme (light and dark via custom properties on `:root`), layout, windows.
- `script.js`: progressive enhancement: dragging, close/minimise, tabs, clock, Trash.

Preview locally with `python3 -m http.server` and open http://127.0.0.1:8000.

## Adding a tool

1. Open `index.html` and find the `ADD A TOOL` comment inside the `Tools` window.
2. Copy the whole `<li class="card"> ... </li>` block, paste it below the last real card (above the "More coming soon" placeholder) and edit the title, description and links. Remove the "View code" link if there is no source.
3. Optional: add a desktop icon by copying an `<li>` in `<nav class="icons">`, pointing its `href` at the tool and picking a symbol from the sprite at the bottom of the file (`i-gem`, `i-code`, ...).

That is all; no JavaScript changes are needed.
