# prcheck

> Lightweight GitHub Action that enforces PR description templates with custom validation rules

## Installation

```bash
npm install prcheck
```

## Usage

Add the following to your workflow file (`.github/workflows/prcheck.yml`):

```yaml
name: PR Check

on:
  pull_request:
    types: [opened, edited, synchronize]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run prcheck
        uses: your-org/prcheck@v1
        with:
          config: .github/prcheck.yml
```

Define your validation rules in `.github/prcheck.yml`:

```yaml
rules:
  - name: require-description
    pattern: "## Description"
    message: "PR must include a Description section"
  - name: require-ticket
    pattern: "Fixes #\\d+"
    message: "PR must reference an issue number"
min_length: 50
```

## Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `config` | Path to config file | `.github/prcheck.yml` |
| `min_length` | Minimum description length | `0` |
| `fail_on_error` | Fail the check on violations | `true` |

## License

[MIT](LICENSE)