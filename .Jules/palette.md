## 2024-03-24 - Missing tooltips and ARIA labels on icon-only buttons
**Learning:** The application heavily relies on lucide-react icons inside button elements. While visually clean, many of these buttons (such as the Trash2 delete buttons across components) lacked 'aria-label' and 'title' attributes. This significantly degrades the experience for screen reader users and those seeking tooltip clarification on hover.
**Action:** Audit icon-only buttons and explicitly add standard HTML 'aria-label' and 'title' attributes to ensure full a11y compliance and improved visual UX.
