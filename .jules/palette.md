## 2024-03-24 - Missing ARIA Labels on Icon-only Buttons
**Learning:** Found several icon-only buttons (like next/prev month in Calendar, delete in InvoiceManager, and close in ClientHistory) missing ARIA labels, making them inaccessible to screen readers.
**Action:** Always ensure icon-only buttons have an `aria-label` attribute describing their function.
