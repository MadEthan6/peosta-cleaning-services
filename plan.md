1. **Optimize `totalUnpaid` and `totalPaid` in `src/components/InvoiceManager.jsx`**
   - The values `totalUnpaid` and `totalPaid` are currently calculated on every render using chained `.filter().reduce()`.
   - Update `import React, { useState, useEffect } from 'react';` to include `useMemo`.
   - Wrap the calculation of `totalUnpaid` and `totalPaid` in a single `useMemo` block that iterates through the `invoices` array once to calculate both totals.
   - Use `replace_with_git_merge_diff` to make these changes.
   - Add comments explaining the optimization (as required by Bolt guidelines).

2. **Verify changes**
   - Use `cat` to read the file and ensure the changes were applied correctly.
   - Run formatting and linting checks using `pnpm lint`.
   - Run tests using `npx vitest run`.

3. **Complete pre-commit steps**
   - Complete pre-commit steps to ensure proper testing, verification, review, and reflection are done.

4. **Submit PR**
   - Submit the PR with the title: `⚡ Bolt: Memoize invoice totals to reduce re-renders`.
   - Include 💡 What, 🎯 Why, 📊 Impact, and 🔬 Measurement in the description.
