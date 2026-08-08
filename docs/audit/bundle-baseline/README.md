# Bundle baseline safety manifest

`npx next experimental-analyze --output` completed successfully against the baseline checkout on 2026-08-08. The generated report was initially written here and measured 3.9 MB.

The analyzer also compiled the user's pre-existing, untracked `/words/privacy/mobile-demo` route. Because binary `analyze.data` files and emitted chunks can embed source from that unrelated work, the raw output is deliberately not committed. It was moved intact to:

`/tmp/words_overtime_bundle_baseline_raw_2026-08-08`

This is a safety boundary, not a failed analysis. Canonical-route byte results are retained in `bundle-summary.json`, and route, HTML, RSC/Flight, initial-JS, client-boundary, and serialized-prop evidence is retained in `../performance-baseline.json` and `../route-inventory.md`. The untracked route is recorded as a deployment risk without reproducing its code.

Command evidence:

```text
npx next experimental-analyze --output
exit: 0
baseline analyzer output: 3.9 MB
raw output retention: /tmp/words_overtime_bundle_baseline_raw_2026-08-08
```

No raw research cache or unrelated privacy-demo source is included in this directory.
