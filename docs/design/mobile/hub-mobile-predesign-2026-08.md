# Hub mobile research edition — approved predesign

Status: implementation authorized by the user on 2026-08-16.

Later user override, 2026-08-16: Hub mobile is essentially card-free. Evidence,
phrase trajectories, and disclosures sit directly on the continuous background;
no filled card shell, rounded container, or shadow is permitted.

This predesign was derived from the retained Hub raw inputs. Existing Hub page
composition and desktop figure geometry are not research or design inputs.

## Principal question

How did *hub* retain the idea of a centre while becoming available to describe
places, routes, institutions, networks, and digital services?

## Supported findings

- The production comparison uses 39 successful, non-background, unhyphenated
  two-token phrase proxies. Ambiguous, sparse, and mechanical-adjacent rows are
  excluded by their retained raw notes.
- A phrase is visible in a period when its unsmoothed twenty-year arithmetic
  mean is at least 0.002 occurrences per million printed-book tokens.
- Visible share changes from 12.82% in 1900–1919, to 48.72% in 1980–1999, to
  89.74% in 2000–2019. The denominator remains the same 39 selected phrases.
- Of the selected phrases, 27 are visible in fewer than three of the six
  periods and have a higher 2000–2019 mean than 1980–1999 mean. This describes
  the selected proxy set, not all English uses of *hub*.
- Selected mechanical phrases have a lower family mean in 2000–2019 than in
  1900–1919. The five other semantic families rise from a much smaller base.

## 390 px storyboard

| Vertical position | Module | Surface category |
| --- | --- | --- |
| 0.00–0.45 viewport | Privacy-pattern opening | prose / navigation |
| 0.45–1.75 | blurred semantic field | primary visualisation |
| 1.75–2.85 | six-family line small multiples | primary visualisation |
| 2.85–4.05 | historical evidence strip | primary visualisation |
| 4.05–5.45 | near-full-width nested arc figure and one paragraph | primary visualisation / prose |
| 5.45–6.65 | persistence × change quadrant | primary visualisation |
| 6.65–7.85 | representative phrase trajectory field | primary visualisation |
| 7.85–8.00 | Privacy-pattern closing finding and folded sources | prose |

The user explicitly replaced the standard word-study card allocation for this
page. Hub targets approximately 88–90% direct-on-background visual evidence and
10–12% always-visible prose/navigation. Native disclosures remain available but
do not receive card shells. The final rendered audit must use measured bounding
boxes at 390 px and 430 px.

## Reference mapping

- Reference 1 supplies the dominant language: a pale continuous surface,
  irregular rounded translucent colour fields, soft overlaps, sparse labels,
  and large areas without chrome.
- Reference 2 supplies labels placed directly inside organic colour territory
  and the bounded circular expand/close control. Blob area is never decorative
  when it appears inside a quantitative figure.
- Reference 3 supplies the near-full-width scale, nested quarter-arc grammar,
  direct results, and a chart field much taller than its accompanying prose.
- Reference 4 supplies compact line plots, coordinate density, large-to-small
  type hierarchy, and small analytical controls.
- Reference 5 supplies translucent orange/blue/violet overlap, visible grain,
  and restrained black typography over a luminous field.

No device frame, copied brand mark, sharp polygonal colour division, opaque
section background, or decorative quantitative-looking shape is permitted.

## Shared background contract

The mobile project uses a continuous background primitive consisting of a warm
paper base, irregular rounded translucent colour fields, and fine grain. It is
available to every mobile route. The ambient layer is non-quantitative and is
not aligned with axes or labels. Within the Hub semantic-field figure only,
colour, vertical placement, and diameter have explicit data meanings.

## Figure and swipe-entry contracts

### HUB-M01 — Semantic field

- Source: `hub_chart01_frequency_raw.json`, `query_results[].semantic_group`,
  `query_results[].raw_series[].frequency_per_million`.
- Filters: production 39-phrase rule above.
- Grouping: six semantic families and six twenty-year periods.
- Denominator: eligible phrases within each family.
- Formula: period arithmetic mean; visible when mean >= 0.002 per million.
- Channels: colour = family; vertical position = first visible period;
  diameter = current-period visible share; direct label = family and period.
- Missingness: failed queries are excluded, never shown as zero.

### HUB-M02 — Family trend lines

- Same source and filters as HUB-M01.
- Formula: unweighted arithmetic mean of eligible phrase-period means within
  each family.
- Unit: occurrences per million printed-book tokens.
- Channels: x = period; y = family mean; colour and direct label = family.
- Prohibited: treating the family means as semantic population shares.

### HUB-M03 — Visible-share arcs

- Same fixed denominator of 39 phrases for every displayed period.
- Formula: visible phrase count / 39 × 100.
- Unit: percent of the selected comparable phrase inventory.
- Channels: arc length on equal-width tracks = percent; direct text = percent.
- Prohibited: radius or filled area encoding value; population-frequency claim.

### HUB-M04 — Persistence × change quadrant

- x = number of six periods in which the phrase mean is >= 0.002 per million.
- y = 2000–2019 mean minus 1980–1999 mean, per million.
- Fixed guides: x = 3 periods, y = 0 change.
- One equal-area point per eligible phrase; colour = semantic family.
- Zero, below-threshold, and failed are not conflated.

### HUB-M05 — Historical evidence strip

- Swipe order: 1828, 1858, 1878, 1943, 1980.
- Direct view: year, term/sense, confidence, and a timeline microvisual.
- Native disclosure: interpretation, evidence type, caveat, and source link.
- Dictionary claims remain visibly different from direct text.
- No background, rounded shell, shadow, or card boundary.

### HUB-M06 — Phrase trajectory field

- Swipe order: wheel, commercial, transport, network, financial, data.
- Direct view: phrase, qualitative direction, and six-period micro-line.
- Native disclosure: period values, formula, family, and source boundary.
- Small curated-inventory counts are not used as display numbers.
- Panels are separated only by rules and spacing on the continuous background.

## Copy

- Opening: `A CENTER THAT LEARNED TO TRAVEL.`
- Main transition: `THE ORIGINAL LINE FALLS. THE OTHERS RISE AROUND IT.`
- Arc paragraph: the wheel sense remains while the same centre-and-distribution
  logic moves into cities, transport, institutions, networks, and services.
- Closing: `THE CENTER STAYED. WHAT IT CONNECTED CHANGED.`

## Production limits

- Google Books Ngram is a printed-book frequency signal and semantic proxy, not
  direct proof of sense or a complete count of English usage.
- The raw capture records `corpus=en`, 1800–2022, smoothing 0, and
  case-insensitive queries, but does not pin a persistent corpus release.
- Counts from curated naming and dependency inventories remain in methods only.
- Desktop stays read-only. Mobile does not import desktop Hub figure components.
