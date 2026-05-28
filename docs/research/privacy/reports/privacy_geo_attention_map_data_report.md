# Privacy Geo Attention Map Report

Generated: 2026-05-28T01:08:08.518266Z

## What This Layer Supports

- 02A global horizontal hotspot map.
- Optional radiation mode from concentrated privacy hubs.
- Elevation metadata is retained only for the later 02B direction.

## Counts

- Source records inspected: 139071
- Countries mapped: 58
- City/institution points mapped: 90
- Radiation links: 34
- Elevation-ready city points: 90
- Google Trends region data available: False

## Strongest Country Hotspots

- United States: 18615 records, density very_high
- United Kingdom: 6109 records, density medium
- China: 3267 records, density medium
- Australia: 2244 records, density low
- Canada: 1743 records, density low
- Germany: 1703 records, density low
- India: 1549 records, density low
- Brazil: 1295 records, density low
- South Africa: 1262 records, density low
- Netherlands: 1226 records, density low
- Italy: 1143 records, density low
- France: 1154 records, density low

## Strongest City Points

- Seattle, United States: 4728 records
- Cambridge, United States: 1046 records
- London, United Kingdom: 883 records
- Oxford, United Kingdom: 550 records
- London, United Kingdom: 548 records
- Hong Kong, China Hong Kong: 484 records
- Sydney, Australia: 454 records
- Baltimore, United States: 433 records
- Melbourne, Australia: 375 records
- Singapore, Singapore: 374 records
- Cambridge, United Kingdom: 363 records
- New York, United States: 346 records

## Radiation Logic

- Asia-Pacific data interface -> Australia (high)
- United States policy + platform -> Canada (high)
- EU data governance -> Germany (high)
- China platform governance -> India (high)
- United States policy + platform -> Brazil (high)
- United States policy + platform -> South Africa (high)
- EU data governance -> Netherlands (high)
- EU data governance -> Italy (high)
- EU data governance -> France (high)
- EU data governance -> Spain (high)
- China platform governance -> Japan (high)
- China platform governance -> China Taiwan (high)

## Limitations

- This is not a pure Google search-interest map because Google Trends region data was unavailable.
- Country hotspots combine academic production and news/source geography; they approximate attention/discourse, not population-normalized search demand.
- Radiation paths are visual and probabilistic; they should not be described as proven diffusion routes.
- Elevation is carried forward for the coordinate subset but belongs to a later 02B layer.

## Outputs

- Processed: `docs/research/privacy/processed/privacy_geo_attention_map_processed.json`
- Generated: `src/data/generated/privacy_geo_attention_map.json`
- JSON report: `docs/research/privacy/reports/privacy_geo_attention_map_data_report.json`
