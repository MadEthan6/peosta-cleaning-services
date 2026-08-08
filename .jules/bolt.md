## 2024-10-24 - React Import Missing
**Learning:** This codebase does not import `React` as a default import in all files, relying instead on named imports for hooks. Using `React.useMemo` directly without adding it to the named imports risks crashing the application.
**Action:** Always prefer named imports for React hooks (e.g., `import { useState, useMemo } from 'react'`) instead of relying on the global or default `React` object.
