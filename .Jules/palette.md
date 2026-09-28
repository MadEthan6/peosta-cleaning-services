## 2024-03-24 - Accessibility improvements for icon-only buttons
**Learning:** Found several icon-only buttons (using Lucide React icons) lacking aria-labels, titles, and aria-hidden="true" on the icons. This causes screen readers to either read nothing or attempt to read the SVG, resulting in poor accessibility.
**Action:** Adding accessible attributes to these buttons across multiple components to ensure screen readers announce them properly and sighted users get tooltips.
