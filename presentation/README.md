# NEXUS GAMING — Presentation

Marp-compatible Markdown presentation for the NEXUS GAMING e-commerce platform.

## Quick Start

### Prerequisites
```bash
# Install Marp CLI globally
npm install -g @marp-team/marp-cli

# Or use npx (no install needed)
```

### Render Commands
```bash
# From project root
cd presentation

# PDF (best for sharing)
./render-presentation.sh pdf

# HTML (interactive, browser-based)
./render-presentation.sh html

# PowerPoint (editable slides)
./render-presentation.sh pptx

# PNG images (for embedding)
./render-presentation.sh images

# All formats
./render-presentation.sh all
```

### VS Code (Recommended)
1. Install **Marp for VS Code** extension
2. Open `NEXUS-GAMING-Presentation.md`
3. Press `Ctrl+Shift+P` → `Marp: Toggle Preview`
4. Export via `Marp: Export Slide Deck...`

## Presentation Structure

| Slide | Topic | Source |
|-------|-------|--------|
| 1 | Title | — |
| 2 | Agenda | — |
| 3 | Project Overview | `PROJECT_OVERVIEW.md` |
| 4 | Live Links | `PROJECT_OVERVIEW.md` |
| 5 | Tech Stack | `TECHNICAL_ARCHITECTURE.md` |
| 6 | System Architecture | `TECHNICAL_ARCHITECTURE.md` |
| 7 | Customer Flow | `TECHNICAL_ARCHITECTURE.md` |
| 8 | Admin Flow | `TECHNICAL_ARCHITECTURE.md` |
| 9-10 | Design System Colors | `DESIGN_SYSTEM.md` |
| 11 | Category Gradients | `DESIGN_SYSTEM.md` |
| 12 | Typography & Motion | `DESIGN_SYSTEM.md` |
| 13-16 | Desktop Screenshots | *(add your screenshots)* |
| 17 | Mobile Screenshots | *(add your screenshots)* |
| 18-19 | README Setup | `PROJECT_OVERVIEW.md` |
| 20 | Admin Credentials | `PROJECT_OVERVIEW.md` |
| 21 | 5 Risks Resolved | `PROJECT_OVERVIEW.md` |
| 22 | Risk 1 Deep Dive | `TECHNICAL_ARCHITECTURE.md` |
| 23 | Risk 4 Deep Dive | `TECHNICAL_ARCHITECTURE.md` |
| 24 | Performance | `PROJECT_OVERVIEW.md` |
| 25 | Security | `TECHNICAL_ARCHITECTURE.md` |
| 26 | Roadmap | `PROJECT_OVERVIEW.md` |
| 27 | Key Files | `PROJECT_OVERVIEW.md` |
| 28 | Thank You | — |

## Screenshots Required

Add these files to `presentation/screenshots/` before rendering:

```
presentation/screenshots/
├── home-hero-desktop.png
├── categories-desktop.png
├── products-desktop.png
├── product-detail-desktop.png
├── checkout-desktop.png
├── admin-dashboard-desktop.png
├── home-hero-mobile.png
├── categories-mobile.png
├── product-card-mobile.png
├── product-detail-mobile.png
├── cart-mobile.png
└── checkout-mobile.png
```

**Recommended dimensions:**
- Desktop: 1920×1080 (16:9)
- Mobile: 390×844 (iPhone 14 Pro) or 360×780 (Android)

## Customization

### Update Live URLs
Edit `NEXUS-GAMING-Presentation.md` slide 4:
```markdown
| **Customer Website** | `https://your-domain.vercel.app` | 🟢 Live |
| **Admin Dashboard** | `https://your-domain.vercel.app/admin` | 🟢 Live |
```

### Update Admin Credentials
Edit slide 20:
```markdown
| **Email** | `your-admin@domain.com` |
| **Password** | `your-secure-password` |
```

### Add Company Branding
Modify `nexus-gaming-theme.css`:
- Colors in `:root` variables
- Fonts in `@import` and `font-family`
- Logo in `section.title-slide::before`

## GitHub Actions (Auto-render on Push)

```yaml
# .github/workflows/presentation.yml
name: Build Presentation
on:
  push:
    paths:
      - 'presentation/**'
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm install -g @marp-team/marp-cli
      - run: cd presentation && ./render-presentation.sh all
      - uses: actions/upload-artifact@v4
        with:
          name: presentation
          path: presentation/output/
```

## File List

```
presentation/
├── NEXUS-GAMING-Presentation.md    # Main presentation (Marp Markdown)
├── nexus-gaming-theme.css           # Custom Marp theme (gaming aesthetic)
├── render-presentation.sh           # Build script
├── README.md                        # This file
├── screenshots/                     # Add your screenshots here
└── output/                          # Generated files (gitignored)
```

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Fonts not loading | Check internet connection (Google Fonts) or download locally |
| Code blocks cut off | Reduce font size in theme or use shorter lines |
| Images missing | Verify `screenshots/` folder exists with correct filenames |
| PDF fonts blurry | Use `--allow-local-files` flag with Marp CLI |
| Mermaid not rendering | Ensure `--html` output (Mermaid works in HTML, not PDF/PPTX directly) |