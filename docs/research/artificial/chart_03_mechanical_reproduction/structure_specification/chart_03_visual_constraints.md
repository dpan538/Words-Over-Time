# Chart 03 Visual Constraints

## 1. Layout

```
viewBox:  0 0 1200 700
background: #0a0a0a (near-black)
padding: 60px left (for stratum labels), 40px right, 50px top, 50px bottom
time axis: horizontal, x = 60 to 1160, year 1800 to 2019
stratum bands: five equal-height horizontal bands stacked top to bottom
```

Five stratum bands within y = 50 to 650 (600px total usable height):
- Stratum I: y = 50 → 170   (120px)
- Stratum II: y = 180 → 270  (90px)
- Stratum III: y = 280 → 400 (120px)
- Stratum IV: y = 410 → 510  (100px)
- Stratum V: y = 520 → 640   (120px)

Thin hairline divider lines at y = 175, 275, 405, 515 (stroke: #333, opacity 0.5).

Time axis label bar at y = 650 → 680.

## 2. Time-to-X Mapping

```
x(year) = 60 + (year - 1800) / (2019 - 1800) * 1100
```

Key x positions:
- 1800: x = 60
- 1850: x = 310.5
- 1900: x = 561
- 1950: x = 811.4
- 2000: x = 1056.6
- 2019: x = 1160

## 3. Arc Geometry (per term)

Each structural anchor term is rendered as a bell-curve arc (Gaussian shape) drawn as an SVG path.

```
Arc center: x = x(peak_year)
Arc height: h = scale(peak_per_million, stratum)
Arc width: w = x(era_end) - x(era_start)
  where era_start = first_above_0_1_per_million year (or peak_year - 20 if unavailable)
  where era_end   = last year where value > 0.1/M (or peak_year + 20 if unavailable)
```

The arc is approximated by a cubic bezier:
```
M (cx - w/2, baseline)
C (cx - w/4, baseline - h), (cx + w/4, baseline - h), (cx + w/2, baseline)
```
where baseline = bottom of the stratum band (y at bottom edge).

This produces a smooth tent/arch shape. For asymmetric arcs (fast rise, slow decline or vice versa), use:
```
M (cx - w_left, baseline)
C (cx - w_left/2, baseline - h), (cx, baseline - h * 1.1), (cx, baseline - h)
  then symmetric right half
```

## 4. Per-Stratum Vertical Scale

Each stratum has its own independent peak-height scale:

| stratum | max term | max peak_per_million | max arc height (px) |
|---|---|---|---|
| I | genuine (22.48) / simulation (36.14) | 36.14 | 90px |
| II | panorama (4.20) | 4.20 | 70px |
| III | electric light (21.86) | 21.86 | 90px |
| IV | television (53.75) | 53.75 | 80px |
| V | simulation (36.14) | 36.14 | 90px |

Scale formula per stratum:
```
arc_height = (peak_per_million / stratum_max) * stratum_max_px
minimum arc height for labeled anchor = 8px
minimum arc height for texture arc = 4px
```

## 5. Stroke Weights and Opacity

```
anchor arc:    stroke #ffffff, weight 1.5px, opacity 1.0
texture arc:   stroke #ffffff, weight 0.8px, opacity 0.28
hover arc:     stroke #ffffff, weight 2.5px, opacity 1.0
hover others:  texture arcs dim to opacity 0.12
```

## 6. Term Labels

Labels appear only on anchor terms.

```
font: 9px, monospace or light sans-serif
color: #ffffff
opacity: 0.85
position: directly above arc peak, centered horizontally
offset: -6px from peak tip
```

If two anchor peaks fall within 30px horizontal of each other in the same stratum:
- stagger one label 12px higher
- connect to arc with a thin hairline (0.5px, #555)

## 7. Stratum Labels (Left Margin)

```
x: 8px from left edge
y: vertically centered within each stratum band
font: 9px, letter-spacing 0.08em, uppercase
color: #666666
alignment: right-aligned within the 55px left margin
```

Label text:
```
I   perceptual quality pressure
II  spectacle apparatus
III reproduction technology
IV  mass experience
V   simulation
```

## 8. Time Axis

Tick positions: 1800, 1825, 1850, 1875, 1900, 1925, 1950, 1975, 2000, 2019

```
tick mark: hairline, 4px tall, y = 645
label: year number, 8px, color #555555, centered under tick
axis line: y = 645, x = 60 to 1160, stroke #333, weight 0.5px
```

## 9. The Valley Annotation (Stratum I)

A faint shaded rectangle marking the authenticity vacuum:
```
x = x(1880) to x(1960)
y = top of Stratum I to bottom of Stratum I
fill: #ffffff, opacity 0.025
no stroke
```

Annotation text:
```
authenticity vacuum
c. 1880–1960
```
Position: centered horizontally in the rectangle, y = 95 (near top of Stratum I)
Font: 8px italic, color #555555

## 10. Title Block

```
title:    "In the Age of Mechanical Reproduction"
          font: 14px, weight: normal, color: #ffffff
          x: 65, y: 30

subtitle: "From artificial objects to manufactured experience"
          font: 9px, weight: normal, color: #777777
          x: 65, y: 45
```

## 11. Interaction States

### Hover on an anchor arc

```
arc stroke weight: 1.5 → 2.5px
arc opacity: 1.0 (unchanged)
tooltip appears:
  - term name (11px, white)
  - peak year and peak per-million (9px, #999)
  - stratum name (8px, #666)
```

Tooltip box:
```
background: #111111
border: 0.5px solid #333
padding: 6px 10px
border-radius: 2px
```

### Hover on a stratum label

```
all anchor arcs in that stratum: opacity 1.0, stroke weight 2.0px
all texture arcs in that stratum: opacity 0.55
all arcs in other strata: opacity 0.12
stratum label: color #ffffff
```

### Default (no hover)

All anchor arcs at full opacity.
All texture arcs at 0.28 opacity.

## 12. Simulation Double-Coding

`simulation` appears in both Stratum I (right wave of authenticity) and Stratum V (digital experience).

Render it as two separate arcs:
- Stratum I arc: full anchor style, labeled "simulation"
- Stratum V arc: same data, full anchor style, labeled "simulation" (or omit label if too close to other V labels)

A thin vertical hairline connects the two arc peaks:
```
x = x(1995)
y = peak_top of Stratum I arc → peak_top of Stratum V arc
stroke: #444444, weight 0.5px, dashed (3 2)
```

## 13. What the Visual Must Not Include

- gridlines
- tooltip on texture arcs (hover does nothing for texture)
- color differentiation between strata (all white on black)
- filled arc areas (stroke only, no fill)
- data table view
- play / animate button (static diagram)
- legend explaining every term
