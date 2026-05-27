# Privacy modern transit system

Layer ID: `modern_transit_system`

This layer supports the 1950-2026 privacy metro-map direction inside chart 01C. It is a source-supported data layer, not a finished chart.

- Routes: 7
- Stations: 23
- Transfer stations: 17
- Route segments: 39
- Route-period flow rows: 42
- Reachable station sources: 23 / 23
- Manual-review stations: 3

## Strongest Supported Routes

- `rights_personhood`: 4 stations, 15 frequency series, 5 collocation hits
- `information_data_protection`: 15 stations, 9 frequency series, 4 collocation hits
- `internet_platform_interface`: 8 stations, 21 frequency series, 8 collocation hits
- `surveillance_security_tension`: 5 stations, 9 frequency series, 5 collocation hits
- `breach_risk_compliance`: 7 stations, 3 frequency series, 5 collocation hits
- `identity_consent_advertising`: 5 stations, 0 frequency series, 4 collocation hits
- `ai_biometrics_sensitive_data`: 2 stations, 0 frequency series, 6 collocation hits

## Design Use

- Use routes as semantic branches, stations as source-supported anchors, and transfer stations where privacy meanings cross.
- Particle density can follow `flow_metrics.by_route_period[].particle_density`.
- Hover details should use fixed side-panel copy; avoid floating labels over the map.

## Limitations

- This is a chart-support data layer, not a complete global privacy-law database.
- Google Books data ends at 2022, while the visual range runs to 2026; post-2022 flow should lean on anchors and attention metrics, not Ngram values.
- Wikimedia pageviews are public attention proxies only and do not equal social importance.
- Manual-review stations are useful for layout continuity but should be visually marked lighter until source-grade verification is complete.
- Some legal sources are jurisdiction-specific; the metro metaphor should show branching semantic routes, not a single universal legal timeline.
