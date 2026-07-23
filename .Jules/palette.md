## 2024-05-18 - Icon-Only Button Accessibility Pattern
**Learning:** React elements utilizing Lucide icons often lack structural ARIA properties, leading to an inaccessible UI since standard screen readers will announce unlabelled icon-only buttons as "button".
**Action:** When implementing icon-only buttons, standard UX/a11y practice in this project is to include both an aria-label for screen readers and a dynamic title attribute for hover tooltips.
