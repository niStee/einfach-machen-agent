# Contributing Guidelines

Thank you for your interest in contributing to **einfach-machen-agent**!

## Code of Conduct & Ethical Guidelines

This project is a civic tech initiative for administrative research, usability analysis, and legitimate open-government advocacy.

- **No Spamming**: Do not alter scripts to flood government services or bypass rate limits.
- **Privacy First**: Ensure pull requests contain no secrets, personal identification data, or confidential information.
- **Bun Standard**: All code must execute cleanly under [Bun](https://bun.sh/).

## Development & Submitting Pull Requests

1. **Clone & Install**:
   ```bash
   git clone https://github.com/niStee/einfach-machen-agent.git
   cd einfach-machen-agent
   bun install
   ```

2. **Branching Workflow**:
   Direct pushes to `main` are restricted. Create a feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

3. **Testing**:
   Ensure all tests pass before submitting a PR:
   ```bash
   bun test
   ```

4. **Pull Request**:
   Push your branch and open a PR via GitHub (`gh pr create`).
