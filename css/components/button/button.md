# Button

## Component Specification

| Property | Value |
|----------|-------|
| **Name** | Button |
| **ID** | CMP-BTN-001 |
| **Category** | Primitive |
| **Layer** | 1 — Primitives |
| **Version** | 1.0.0 |
| **Owner** | Component Library Manager |
| **Status** | ✅ Active |

## Purpose
Trigger an action. The most-used interactive component. Buttons communicate "something will happen when you activate this."

## Business Goal
Provide a consistent, accessible, token-driven action trigger used across all pages: CTAs, forms, cards, navigation, modals, toasts.

## Variants

| Variant | Class | Usage |
|---------|-------|-------|
| Solid | `.btn--solid` | Primary CTAs. One per viewport. |
| Outline | `.btn--outline` | Secondary actions. |
| Ghost | `.btn--ghost` | Tertiary actions, toolbars. |
| Danger | `.btn--danger` | Destructive actions. |
| Danger Outline | `.btn--danger-outline` | Secondary destructive. |
| Icon | `.btn--icon` | Icon-only buttons. Requires `aria-label`. |

## Sizes

| Size | Class | Height |
|------|-------|--------|
| Small | `.btn--sm` | 36px |
| Medium (default) | *(none)* | 44px |
| Large | `.btn--lg` | 52px |

## States

| State | Visual Treatment |
|-------|-----------------|
| Rest | Solid: lavender bg + black text. Outline: transparent + lavender border. Ghost: transparent + gray text. |
| Hover | Solid: lighter lavender. Outline: 10% lavender bg. Ghost: subtle white bg. |
| Focus | 2px lavender outline, 2px offset. |
| Active/Pressed | Darker bg, scale(0.98). |
| Disabled | 40% opacity, not-allowed cursor, no pointer events. |
| Loading | Text hidden, spinner shown. Width preserved. `aria-busy="true"`. |

## Tokens Used

```
--color-accent-primary, --color-accent-primary-hover, --color-accent-primary-pressed
--color-text-inverse, --color-text-primary, --color-text-secondary
--color-bg-hover, --color-bg-pressed, --color-bg-accent, --color-bg-accent-hover
--color-border-accent, --color-white, --color-danger
--radius-button, --radius-full
--font-family-sans, --font-size-button, --font-size-button-sm
--font-weight-medium, --font-weight-semibold
--space-1, --space-2, --space-3, --space-5, --space-7
--size-button-height, --size-button-height-sm, --size-button-height-lg
--size-touch-min
--border-width-thin, --border-width-medium
--opacity-disabled, --opacity-muted
--motion-duration-fast, --motion-ease-out, --motion-ease-spring
```

## Accessibility

| Requirement | Implementation |
|-------------|---------------|
| Keyboard | Enter/Space activates. Tab focuses. |
| Screen reader | Icon-only: `aria-label` required. Loading: `aria-busy="true"`. |
| Focus visible | 2px lavender ring, 2px offset (`:focus-visible`). |
| Touch target | Minimum 44×44px. Icon buttons are exactly 44×44px. |
| Disabled | `disabled` attribute + `aria-disabled="true"`. |
| Color contrast | Solid: >7:1 (AAA). Outline text: >7:1 (AAA). |

## Responsive

| Breakpoint | Behavior |
|------------|----------|
| xs–sm (<768px) | Full-width in forms. Icon buttons unchanged. |
| md+ (768px+) | Auto-width. Side-by-side in button groups. |

## Examples

```html
<!-- Solid (Primary CTA) -->
<button class="btn--solid" type="button">Add to Cart</button>

<!-- Outline with icon -->
<button class="btn--outline" type="button">
  <svg class="icon-md" aria-hidden="true"><use href="#icon-cart"></use></svg>
  View Cart
</button>

<!-- Ghost -->
<button class="btn--ghost" type="button">Cancel</button>

<!-- Danger -->
<button class="btn--danger" type="button">Delete Item</button>

<!-- Icon Only -->
<button class="btn--icon" type="button" aria-label="Search">
  <svg class="icon-md" aria-hidden="true"><use href="#icon-search"></use></svg>
</button>

<!-- Large Full-Width -->
<button class="btn--solid btn--lg btn--full" type="button">Checkout</button>

<!-- Loading -->
<button class="btn--solid btn--loading" type="button" aria-busy="true">Saving...</button>

<!-- Disabled -->
<button class="btn--solid" type="button" disabled>Sold Out</button>
```

## Dependencies
- Design Tokens: [`css/tokens/`](../../tokens/)
- Icon component (for icon buttons)
- No JavaScript dependency (works without JS)

## Related Components
- Input
- Card
- Modal
- Toast

## Revision History

| Date | Version | Changes |
|------|---------|---------|
| 2026-08-07 | 1.0.0 | Initial creation |
