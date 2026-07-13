## 2024-07-13 - Add ARIA Labels to Icon-Only Buttons
**Learning:** Icon-only buttons (like calendar navigation chevrons) without ARIA labels or tooltips create significant accessibility barriers and cause confusion for users relying on screen readers or needing context hints.
**Action:** When implementing icon-only buttons, always include an `aria-label` for accessibility and a `title` attribute for hover tooltips.
