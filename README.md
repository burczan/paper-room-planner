# Paper Room Planner

Paper Room Planner creates printable, scaled A4 room plans and matching cutouts for furniture and other items. Describe a room and its items, generate a PDF, print it, cut out the items, and arrange them physically on the room page.

Use it to try different room layouts and compare item sizes before moving real objects or buying something new.

## Use cases

Typical use cases include:

- Rearranging furniture and other items before moving the real objects.
- Comparing alternative product sizes before buying, such as different shower or bed sizes.
- Exploring layouts in compact spaces such as bathrooms.
- Planning spaces containing non-furniture items such as vehicles, workbenches, or storage.
- Generating a room plan without item cutouts.

## How to use it

Install dependencies:

```bash
npm install
```

Create an input JSON file describing one room and its items. Dimensions are in metres. Room dimensions are required, and all dimensions must be positive and representable in whole millimetres. Only rectangular item footprints are currently supported.

```json
{
  "room": {
    "width": 4.2,
    "length": 3.6
  },
  "items": [
    {
      "name": "Bed",
      "shape": "rectangle",
      "width": 1.6,
      "length": 2.0
    }
  ]
}
```

Item names must contain at least one non-whitespace character. They may contain Unicode characters supported by the bundled Noto Sans font; unsupported characters cause generation to fail.

> [!TIP]
> Keep item names concise. Labels are drawn inside their cutouts, so long names can be awkward on small pieces.

Generate the PDF with:

```bash
npm run generate -- path/to/input.json
```

The PDF is written to `output/<input-basename>.pdf`. For example, `examples/garage.json` produces `output/garage.pdf`.

The PDF contains a room page followed by one or more item-cutout pages, with a calibration reference on the first item page. If `items` is empty, the PDF still contains the room page and a calibration-only item page ([Empty room example](examples/empty-room.pdf)).

Cutouts may be rotated on the item pages to use the available paper space more efficiently. This does not change their dimensions or scale; after cutting them out, they can be rotated freely on the room plan.

> [!CAUTION]
> Print the PDF at _100%_, _Actual Size_, or the equivalent setting in your PDF viewer. Do **not** use _Fit to page_ or automatic scaling.

After printing, measure the calibration line. It should be exactly 10 cm long. If it is not, the physical scale of the printed room and cutouts should not be trusted even if the PDF looks correct on screen.

Once the scale is verified, cut out the items and move them around on the room page to explore different arrangements.

## Examples

- Bedroom rearrangement — a typical bedroom layout ([JSON](examples/bedroom-rearrangement.json) · [PDF](examples/bedroom-rearrangement.pdf))
- Bathroom comparison — compares two shower sizes in a compact bathroom ([JSON](examples/bathroom-comparison.json) · [PDF](examples/bathroom-comparison.pdf))
- Garage — demonstrates planning with vehicles, storage, and a workbench ([JSON](examples/garage.json) · [PDF](examples/garage.pdf))
- Empty room — a room plan without item cutouts ([JSON](examples/empty-room.json) · [PDF](examples/empty-room.pdf))

## Assumptions

- Each input file describes one rectangular room.
- Item footprints are rectangles.
- One automatically selected whole-number scale is shared by the room and every item.
- Output uses A4 pages.

## Limitations

Doors, windows, radiators, columns, and other architectural details are not modeled. The tool does not automatically place items or determine whether an arrangement provides enough clearance or usable space. It preserves the dimensions needed to compare footprints, but it does not attempt to reproduce every constraint of the real room. For example, a chair footprint does not include the space needed to pull the chair out, and a shower footprint does not account for door movement or plumbing requirements.

The program chooses a common scale that allows both the room and every item to fit on their respective pages. A very large or elongated item can therefore make the entire plan physically smaller on paper.

Only rectangular footprints are supported. Circular, curved, polygonal, and other irregular shapes are not supported. The simplified geometry is intentional: the goal is to compare the space items occupy, not to reproduce their exact shapes.

## Known issues

- Very small or narrow cutouts can be awkward to cut and handle. Their practical size depends on the selected scale.
- Long item names may not fit comfortably inside small cutouts, so prefer concise labels.
- The first item page reserves space for the calibration reference. A large cutout may therefore move to the next page even though it fits on a regular item page, leaving the first item page with only the calibration reference.

## Development

### jsPDF coordinate system

The jsPDF drawing API uses the top-left corner of the page as the origin `(0, 0)`:

- `x` increases to the right.
- `y` increases downward.

For an A4 landscape page (297 × 210 mm) using millimetres as units:

```text
(0,0)                               (297,0)
  ●─────────────────────────────────────●
  │                                     │
  │                                     │
  │                                     │
  │                                     │
  │                                     │
  │                                     │
  │                                     │
  │                                     │
  │                                     │
  ●─────────────────────────────────────●
(0,210)                             (297,210)
```

This differs from the usual mathematical Cartesian coordinate system, where positive `y` points upward:

```text
      +y
       ↑
       │
-x ←───┼───→ +x
       │
       ↓
      -y
```

In jsPDF:

```text
(0,0) ────→ +x
  │
  │
  ↓
 +y
```
