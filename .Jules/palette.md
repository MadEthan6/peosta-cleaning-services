## 2024-05-19 - Job Checklist Keyboard Accessibility
**Learning:** React `div` elements used as interactive checklist items required manual implementation of `role="button"`, `tabIndex`, and `onKeyDown` to be keyboard accessible. Icon-only buttons (like Plus and Trash2) needed `aria-label`s and `aria-hidden` on the icons themselves for screen readers.
**Action:** When creating custom toggle interactions, always ensure keyboard accessibility and proper ARIA labels for icon-only actions.
