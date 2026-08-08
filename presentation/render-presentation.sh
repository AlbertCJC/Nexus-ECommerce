/* NEXUS GAMING Marp Theme */
@import 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600;700&display=swap';

:root {
  --bg-deep: #020617;
  --bg-base: #0f172a;
  --bg-elevated: #1e293b;
  --bg-hover: #334155;
  --accent-primary: #06b6d4;
  --accent-primary-glow: #22d3ee;
  --accent-secondary: #a855f7;
  --accent-success: #22c55e;
  --accent-warning: #f59e0b;
  --accent-danger: #ef4444;
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --border-subtle: #334155;
}

section {
  background: var(--bg-base);
  color: var(--text-primary);
  font-family: 'Inter', 'DM Sans', system-ui, sans-serif;
  padding: 64px 80px;
}

section.title-slide {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: linear-gradient(145deg, var(--bg-deep) 0%, var(--bg-base) 50%, #1e1b4b 100%);
}

section.section-slide {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  background: var(--bg-deep);
}

section.title-slide h1,
section.section-slide h1 {
  font-family: 'Space Grotesk', 'Syne', 'Inter', system-ui, sans-serif;
  font-weight: 700;
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  line-height: 1.1;
  letter-spacing: -0.03em;
  background: linear-gradient(135deg, var(--text-primary) 0%, var(--accent-primary) 50%, var(--accent-secondary) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 1rem;
}

section.title-slide h2,
section.section-slide h2 {
  font-family: 'Inter', system-ui, sans-serif;
  font-weight: 400;
  font-size: clamp(1.25rem, 2.5vw, 1.75rem);
  color: var(--text-secondary);
  margin-top: 0;
}

h1 { font-family: 'Space Grotesk', 'Syne', 'Inter', system-ui, sans-serif; font-weight: 700; font-size: clamp(1.75rem, 4vw, 2.5rem); line-height: 1.2; letter-spacing: -0.02em; }
h2 { font-family: 'Space Grotesk', 'Syne', 'Inter', system-ui, sans-serif; font-weight: 600; font-size: clamp(1.5rem, 3vw, 2rem); line-height: 1.25; letter-spacing: -0.01em; color: var(--accent-primary); }
h3 { font-family: 'Space Grotesk', 'Inter', system-ui, sans-serif; font-weight: 600; font-size: 1.25rem; line-height: 1.3; }

p { font-size: 1rem; line-height: 1.6; color: var(--text-secondary); }
strong { color: var(--text-primary); }

code { font-family: 'JetBrains Mono', 'IBM Plex Mono', 'Fira Code', monospace; font-size: 0.875rem; background: var(--bg-elevated); padding: 2px 6px; border-radius: 4px; color: var(--accent-primary-glow); }
pre { background: var(--bg-deep); border: 1px solid var(--border-subtle); border-radius: 12px; padding: 16px; overflow-x: auto; }
pre code { background: none; padding: 0; font-size: 0.8rem; line-height: 1.5; }

a { color: var(--accent-primary); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 150ms; }
a:hover { border-color: var(--accent-primary); }

table { width: 100%; border-collapse: collapse; font-size: 0.875reminder>
The theme file has been created. Let me also add a quick render script and verify the presentation structure.

<tool_call>
<function=Write>
<parameter=content>
#!/bin/bash
# Render NEXUS GAMING Presentation
# Usage: ./render-presentation.sh [pdf|html|pptx|images]

set -e

THEME="presentation/NEXUS-GAMING-Presentation.md"
OUTPUT_DIR="presentation/output"

mkdir -p "$OUTPUT_DIR"

case "${1:-pdf}" in
  pdf)
    echo "📄 Rendering PDF..."
    npx @marp-team/marp-cli@latest "$THEME" \
      --theme presentation/nexus-gaming-theme.css \
      --pdf \
      --output "$OUTPUT_DIR/nexus-gaming-presentation.pdf"
    echo "✅ PDF saved to $OUTPUT_DIR/nexus-gaming-presentation.pdf"
    ;;
  html)
    echo "🌐 Rendering HTML..."
    npx @marp-team/marp-cli@latest "$THEME" \
      --theme presentation/nexus-gaming-theme.css \
      --html \
      --output "$OUTPUT_DIR/nexus-gaming-presentation.html"
    echo "✅ HTML saved to $OUTPUT_DIR/nexus-gaming-presentation.html"
    ;;
  pptx)
    echo "📊 Rendering PPTX..."
    npx @marp-team/marp-cli@latest "$THEME" \
      --theme presentation/nexus-gaming-theme.css \
      --pptx \
      --output "$OUTPUT_DIR/nexus-gaming-presentation.pptx"
    echo "✅ PPTX saved to $OUTPUT_DIR/nexus-gaming-presentation.pptx"
    ;;
  images)
    echo "🖼️ Rendering PNG images..."
    npx @marp-team/marp-cli@latest "$THEME" \
      --theme presentation/nexus-gaming-theme.css \
      --images png \
      --output "$OUTPUT_DIR/images/"
    echo "✅ Images saved to $OUTPUT_DIR/images/"
    ;;
  all)
    echo "🚀 Rendering all formats..."
    $0 pdf
    $0 html
    $0 pptx
    $0 images
    ;;
  *)
    echo "Usage: $0 [pdf|html|pptx|images|all]"
    exit 1
    ;;
esac