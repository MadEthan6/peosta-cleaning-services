## 2024-05-01 - Avoid dangerouslySetInnerHTML for CSS
**Vulnerability:** XSS vulnerability through \`dangerouslySetInnerHTML\`
**Learning:** Using \`dangerouslySetInnerHTML\` to inject styles could potentially open up XSS if combined with unsanitized user input in the future, and breaks React's standard way of passing CSS or simple text.
**Prevention:** Use standard JSX \`<style>{...}</style>\` syntax for injecting CSS, which is safer and better practice in React.
