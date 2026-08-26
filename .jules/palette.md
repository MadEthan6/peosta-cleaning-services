## 2024-11-20 - Adding keyboard accessibility to interactive divs
**Learning:** The application uses divs for clickable components without native keyboard navigation support, such as the logo area in the Navbar.
**Action:** Always ensure that interactive divs (like toggles and buttons) include `role="button"`, `tabIndex={0}`, an appropriate `aria-label`, and an `onKeyDown` handler for "Enter" and Space keys to maintain keyboard accessibility.
