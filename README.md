# hrlw.dev

Static landing page for hrlw.dev: a calm, ruled-line index of tools and projects. Plain HTML and CSS, no JavaScript, no build step, no external requests. Served via GitHub Pages; `CNAME` sets the domain.

- `index.html`: all content and the inline SVG favicon.
- `style.css`: theme (dark only, via custom properties on `:root`) and the parallel-line motif.
- `assets/space.jpg`: the hero background image (resized copy of "Polygon Planets", 2560x1418). It was posted to r/wallpapers by u/pentachrism, who said they found it on an image board. A commenter, u/Jaorizabal, said they made it (edited and posted), which is unverified, so the original artist is not confirmed. It is not the site owner's work and is not covered by this repo's licence. If you are the artist, or know who is, please open an issue so it can be credited or removed.

Preview locally with `python3 -m http.server` and open http://127.0.0.1:8000.

## Adding a tool

1. Open `index.html` and find the `ADD A TOOL` comment inside the `Tools` section.
2. Copy the whole `<li class="card"> ... </li>` block that follows it, paste it below the last real card (above the "More coming" placeholder) and edit the title, description and links. Remove the "Code" link if there is no source.

That is all; no CSS changes are needed, and the grid reflows by itself.
