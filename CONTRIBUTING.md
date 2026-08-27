# 🤝 Contributing to Vertex Client CRM

Thank you for your interest in contributing to the **Vertex Client CRM Suite**!

## 📋 Code Standards & Workflow

1. **Branch Naming**:
   - `feature/feature-name` for new capabilities.
   - `fix/bug-name` for bug fixes.
   - `chore/task-name` for maintenance or dependencies.

2. **TypeScript & Linting**:
   - Run `npm run type-check` to ensure all types pass strict mode with zero errors.
   - Run `npm run lint` before committing.

3. **Dark Mode & RTL Conventions**:
   - Always verify new components in both **Dark Mode** and **Light Mode**.
   - Use logical CSS properties (`start`, `end`, `ms-`, `me-`, `ps-`, `pe-`) to maintain flawless RTL Arabic and LTR English layouts.
   - Add new strings to both `ar` and `en` dictionaries in `lib/i18n.ts`.

4. **Pull Request Guidelines**:
   - Provide a concise summary of changes and UI screenshots/GIFs for visual features.
   - Ensure all builds pass (`npm run build`).

---

<div align="center">
  <sub>QX-Devs • Vertex Automation Suite</sub>
</div>
