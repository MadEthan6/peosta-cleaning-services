## 2024-05-14 - Icon buttons and accessibility
**Learning:** Found multiple instances of icon-only buttons missing `aria-label`s across components (e.g. Navbar, Calendar, ClientInvoices).
**Action:** When adding or fixing icon-only buttons, standard UX/a11y practice in this project is to include both an `aria-label` for screen readers and a dynamic `title` attribute for hover tooltips.
