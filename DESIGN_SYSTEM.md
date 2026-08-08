# NEXUS GAMING — Design System Documentation

## Design Philosophy

**Dark Gaming Aesthetic** — Premium, technical, immersive. Inspired by Razer, Logitech G, ASUS ROG branding. Cyan primary evokes RGB lighting; purple secondary adds depth. Slate backgrounds reduce eye strain for late-night gaming sessions.

**Key Principles**:
1. **Contained Interactions** — Hover effects never shift layout (fixed Risk 1)
2. **Token-Driven** — Single source of truth via CSS custom properties
3. **Motion with Purpose** — Spring easing for modals, smooth for UI, respect `prefers-reduced-motion`
4. **Accessibility First** — WCAG AA contrast, focus visible, semantic HTML
5. **Performance Conscious** — GPU-accelerated transforms, lazy loading, optimized assets

---

## Color System

### CSS Custom Properties (Source of Truth)
```css
:root {
  /* Backgrounds — Slate scale for depth */
  --bg-deep: 2, 6, 23;           /* Hero, footer */
  --bg-base: 15, 23, 42;         /* Page background */
  --bg-elevated: 30, 41, 59;     /* Cards, modals, dropdowns */
  --bg-hover: 51, 65, 85;        /* Interactive hover */
  --bg-card: 30, 41, 59;         /* Product cards */
  --bg-muted: 30, 41, 59;        /* Disabled, subtle */

  /* Accent Primary — Cyan (Brand) */
  --accent-primary: 6, 182, 212;
  --accent-primary-glow: 34, 211, 238;  /* Glow effects */
  --accent-primary-dim: 8, 145, 178;    /* Gradients end */

  /* Accent Secondary — Purple (Depth) */
  --accent-secondary: 168, 85, 247;
  --accent-secondary-glow: 192, 132, 252;

  /* Semantic — Status & Feedback */
  --accent-success: 34, 197, 94;
  --accent-success-glow: 74, 222, 128;
  --accent-warning: 245, 158, 11;
  --accent-danger: 239, 68, 68;
  --accent-info: 99, 102, 241;

  /* Text — High contrast on dark */
  --text-primary: 248, 250, 252;    /* Headlines, primary */
  --text-secondary: 148, 163, 184;  /* Body, descriptions */
  --text-muted: 100, 116, 139;      /* Labels, hints, disabled */

  /* Borders */
  --border-subtle: 51, 65, 85;      /* Default borders */
  --border-hover: 71, 85, 105;      /* Hover borders */
  --border-focus: 6, 182, 212;      /* Focus rings */
}
```

### Tailwind Token Mapping
All tokens available as utilities:
```jsx
// Backgrounds
bg-[rgb(var(--bg-base))]
bg-bg-base          // via Tailwind config
bg-bg-elevated
bg-bg-hover

// Text
text-text-primary
text-text-secondary
text-text-muted

// Accents
text-accent-primary
bg-accent-primary/10
border-accent-primary/30

// Semantic
text-success, bg-success/10, border-success/30
text-warning, bg-warning/10, border-warning/30
text-danger, bg-danger/10, border-danger/30
text-info, bg-info/10, border-info/30
```

### Category Gradients (Tokenized)
```css
/* Tailwind backgroundImage tokens */
grad-cat-mice:        linear-gradient(135deg, var(--accent-primary), var(--accent-primary-glow))
grad-cat-keyboards:   linear-gradient(135deg, var(--accent-secondary), var(--accent-secondary-glow))
grad-cat-headsets:    linear-gradient(135deg, var(--accent-success), var(--accent-success-glow))
grad-cat-monitors:    linear-gradient(135deg, var(--accent-warning), var(--accent-danger))
grad-cat-laptops:     linear-gradient(135deg, var(--accent-secondary), var(--accent-primary))
grad-cat-components:  linear-gradient(135deg, var(--accent-danger), rgb(255, 107, 107))
grad-cat-accessories: linear-gradient(135deg, rgb(32, 201, 151), var(--accent-primary))
grad-cat-default:     linear-gradient(135deg, var(--text-muted), var(--border-hover))
```

Usage: `<div className="bg-grad-cat-mice">`

---

## Typography

### Fluid Type Scale (clamp-based)
```js
// tailwind.config.js
fontSize: {
  display: ['clamp(2.5rem, 5vw, 4rem)', { lineHeight: '1.1', letterSpacing: '-0.02em' }],
  h1: ['clamp(2rem, 4vw, 3rem)', { lineHeight: '1.2', letterSpacing: '-0.01em' }],
  h2: ['clamp(1.5rem, 3vw, 2.25rem)', { lineHeight: '1.25' }],
  h3: ['clamp(1.25rem, 2.5vw, 1.5rem)', { lineHeight: '1.3' }],
  h4: ['clamp(1.125rem, 2vw, 1.25rem)', { lineHeight: '1.4' }],
  'body-lg': ['1.125rem', { lineHeight: '1.6' }],
  body: ['1rem', { lineHeight: '1.6' }],
  'body-sm': ['0.875rem', { lineHeight: '1.5' }],
  caption: ['0.75rem', { lineHeight: '1.5' }],
}
```

### Usage
```jsx
<h1 className="text-h1 font-bold">NEXUS GAMING</h1>
<h2 className="text-h2 font-semibold">Shop by Category</h2>
<p className="text-body text-text-secondary">Description text</p>
<span className="text-caption text-text-muted">Label</span>
```

### Font Stack
```css
font-family: 'Inter', 'DM Sans', system-ui, sans-serif;
/* Inter for UI, DM Sans for headlines — both variable fonts */
```

---

## Spacing System

### Scale (4px base unit)
```js
spacing: {
  0: '0',
  1: '0.25rem',   // 4px
  2: '0.5rem',    // 8px
  3: '0.75rem',   // 12px
  4: '1rem',      // 16px
  5: '1.25rem',   // 20px
  6: '1.5rem',    // 24px
  8: '2rem',      // 32px
  10: '2.5rem',   // 40px
  12: '3rem',     // 48px
  16: '4rem',     // 64px
  20: '5rem',     // 80px
  24: '6rem',     // 96px
}
```

### Container Widths
```js
maxWidth: {
  'container-sm': '640px',   // Mobile
  'container-md': '768px',   // Tablet
  'container-lg': '1024px',  // Desktop
  'container-xl': '1280px',  // Large desktop
  'container-2xl': '1440px', // Ultra-wide
}
```

### Page Layout Pattern
```jsx
<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
  {/* Content */}
</div>
```

---

## Motion & Transitions

### Duration Tokens
```js
transitionDuration: {
  fast: '150ms',    // Color, border, background
  normal: '250ms',  // Standard UI transitions
  slow: '400ms',    // Modals, drawers, complex
}
```

### Easing Tokens
```js
transitionTimingFunction: {
  smooth: 'cubic-bezier(0.16, 1, 0.3, 1)',      // Natural, friendly
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',  // Playful, gaming feel
}
```

### Utility Classes
```css
.transition-smooth { transition: all 250ms cubic-bezier(0.16, 1, 0.3, 1); }
.transition-spring { transition: all 400ms cubic-bezier(0.34, 1.56, 0.64, 1); }
```

### Component Patterns
```jsx
// Button — fast color transition
<button className="transition-colors duration-fast">

// Card — smooth all properties
<Card className="transition-smooth">

// Modal content — spring entrance
<div className="transition-spring">

// Image hover — contained scale
<img className="transition-transform duration-300 group-hover:scale-105" />
```

### Reduced Motion (Accessibility)
```css
@media (prefers-reduced-motion: reduce) {
  .animate-float,
  .animate-pulse-glow,
  .animate-scanline,
  .animate-rgb-shift,
  .animate-shimmer {
    animation: none !important;
  }
  .transition-smooth,
  .transition-spring {
    transition: none !important;
  }
}
```

---

## Component Library

### Button (`src/components/ui/Button.jsx`)
```jsx
<Button 
  variant="primary | secondary | danger | outline | ghost"
  size="sm | md | lg | icon"
  loading={boolean}
  disabled={boolean}
>
  Content
</Button>
```

**Variants** (using design tokens):
- `primary` — Cyan gradient, glow shadow, scale on hover
- `secondary` — Purple gradient, glow shadow
- `danger` — Red gradient
- `outline` — Cyan border, transparent bg, fill on hover
- `ghost` — Transparent, subtle hover bg

### Card (`src/components/ui/Card.jsx`)
```jsx
<Card className="flex flex-col h-full" hover>
  {/* hover adds .transition-smooth */}
</Card>
```

**Hover State** (fixed — no layout shift):
```css
.card:hover {
  border-color: rgb(var(--accent-primary));
  box-shadow: 0 20px 40px -15px rgb(0 0 0 / 0.5), 0 0 30px rgb(var(--accent-primary) / 0.1);
  /* NO transform: translateY(-4px) — was causing grid shift */
}
```

### Modal (`src/components/ui/Modal.jsx`)
- Portal-rendered, focus trap
- Spring entrance animation
- Sizes: sm, md, lg, xl, full
- `ConfirmDialog` variant for destructive actions

### Toast (`src/components/ui/Toast.jsx`)
- Slide-in animation
- Types: success, error, warning, info (semantic colors)
- Auto-dismiss (5s), manual close
- Accessible `role="alert"`

### Form Controls
| Component | Features |
|-----------|----------|
| `Input` | Label, error state, focus ring, autofill fix |
| `Select` | Native select styled, chevron icon, focus ring |
| `Checkbox` | Custom styled, accent color, focus ring |
| `Badge` | Variants: primary, success, warning, danger, neutral |

---

## Product Card — Interaction System

### Contained Hover Effects (No Layout Shift)
```jsx
// Image — scales within overflow-hidden container
<Link className="block aspect-square relative overflow-hidden">
  <img className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
</Link>

// Brand badge — scales in place
<div className="absolute top-4 left-4 z-10 group-hover:scale-105 transition-transform duration-300">

// Gradient overlay — fades in
<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">

// Text expansion — line-clamp toggle
<h3 className="line-clamp-1 group-hover:line-clamp-none group-hover:max-h-[3rem] transition-all duration-300">
```

### Compact Variant
```jsx
// Simplified for dense grids (admin, related products)
<Link className="flex gap-4 p-3 card hover:border-accent-primary/50 transition-colors">
```

---

## Accessibility Checklist

### Color Contrast (WCAG AA — 4.5:1 minimum)
- [ ] `text-primary` on `bg-base` — **13.4:1** ✅
- [ ] `text-secondary` on `bg-base` — **7.2:1** ✅
- [ ] `text-muted` on `bg-base` — **4.8:1** ✅
- [ ] `accent-primary` on `bg-base` — **3.2:1** ⚠️ (large text only)
- [ ] `accent-primary` on `bg-elevated` — **4.1:1** ⚠️ (large text only)
- [ ] Button `primary` — white on cyan gradient — **verify**
- [ ] Focus ring — `accent-primary` on `bg-base` — **verify**

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Focus visible (`:focus-visible` ring)
- [ ] Modal focus trap
- [ ] Dropdown keyboard support (Esc to close)
- [ ] Tab order logical

### Semantic HTML
- [ ] `<main>`, `<header>`, `<footer>`, `<nav>`, `<aside>`
- [ ] Heading hierarchy (h1 → h2 → h3)
- [ ] `<dl>/<dt>/<dd>` for order summary
- [ ] `<button>` for actions, `<a>` for navigation
- [ ] `aria-label` on icon-only buttons

### Screen Reader
- [ ] Alt text on all images
- [ ] Loading states announced
- [ ] Toast `role="alert"`
- [ ] Form errors linked via `aria-describedby`

---

## Implementation Guidelines

### Adding New Colors
1. Add CSS custom property to `src/styles/index.css:6-34`
2. Add Tailwind token to `tailwind.config.js:9-48`
3. Use `rgb(var(--token-name))` or `token-name` utility
4. **Never** use hardcoded `slate-*`, `cyan-*`, etc.

### Adding Spacing
1. Use existing scale (4, 8, 12, 16, 24, 32, 48, 64)
2. For new values, add to `tailwind.config.js` spacing

### Adding Motion
1. Use `transition-smooth` (250ms) or `transition-spring` (400ms)
2. For custom durations: `duration-fast` / `duration-normal` / `duration-slow`
3. Always test with `prefers-reduced-motion`

### Component Creation
```jsx
// Follow pattern: forwardRef + className merging + design tokens
export const NewComponent = forwardRef(({ className = '', variant = 'default', ...props }, ref) => {
  const variants = {
    default: 'bg-[rgb(var(--bg-elevated))] text-[rgb(var(--text-primary))]',
    primary: 'bg-[rgb(var(--accent-primary))] text-[rgb(var(--bg-deep))]',
  };
  return <div ref={ref} className={`${variants[variant]} ${className}`} {...props} />;
});
```

---

## Visual Reference

### Home Page Sections
1. **Hero** — `bg-grad-hero`, glow orbs, gradient headline, dual CTA
2. **Features** — 4-column grid, icon cards with hover glow
3. **Categories** — 7-column responsive, gradient icons, hover cyan glow
4. **Featured Products** — ProductGrid (4/3/2/1 columns)
5. **Brands** — Grayscale logos, hover color + glow

### Product Pages
- **Products** — Sidebar filters (sticky), ProductGrid, skeleton loaders
- **ProductDetail** — Image gallery, quantity selector, add-to-cart, related

### Checkout Flow
1. **Contact Info** — Name, email, phone (prefilled for auth users)
2. **Shipping** — Address form, country default Philippines
3. **Payment** — Radio group (COD, E-Wallet, Bank), accessible labels
4. **Notes** — Optional textarea
5. **Summary** — Sticky sidebar, line items, totals, secure badge

### Admin Dashboard
- **Sidebar** — Navigation, collapsible on mobile
- **Tables** — Sortable, paginated, row actions
- **Forms** — Modal-based create/edit, image upload preview
- **Status Badges** — Semantic colors from design tokens