---
name: Armazém Ficção
description: Objetos que não existem, vendidos com toda a seriedade — uma banca de cordel de feira.
colors:
  lona: "#1f4f9a"
  lona-escura: "#153a74"
  lona-funda: "#0f2b57"
  tinta: "#17130f"
  tinta-suave: "#3a3128"
  claro: "#fbf6e9"
  claro-suave: "#d9e4f5"
  amarelo: "#f7d34e"
  rosa: "#f4a0bd"
  verde: "#a3dbb5"
  celeste: "#b2d8f0"
  laranja: "#f7a965"
  jornal: "#f1ece0"
  papel-campo: "#fffdf7"
  barbante: "#d8b47a"
  barbante-escuro: "#9c7a45"
  madeira: "#c4884a"
  madeira-escura: "#8a5a2b"
  carimbo: "#8f1d17"
  erro: "#b3261e"
  ok: "#1d6b3a"
typography:
  display:
    fontFamily: "Ultra, 'Rockwell Extra Bold', serif"
    fontSize: "clamp(2.1rem, 4.2vw, 3.7rem)"
    fontWeight: 400
    lineHeight: 0.98
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Ultra, 'Rockwell Extra Bold', serif"
    fontSize: "clamp(2rem, 4.4vw, 3.4rem)"
    fontWeight: 400
    lineHeight: 1
  title:
    fontFamily: "Ultra, 'Rockwell Extra Bold', serif"
    fontSize: "1.02rem"
    fontWeight: 400
    lineHeight: 1.08
    letterSpacing: "0.01em"
  folheto:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: "1.12rem"
    fontWeight: 400
    lineHeight: 1.55
  folheto-italico:
    fontFamily: "Alegreya, Georgia, serif"
    fontSize: "1.3rem"
    fontWeight: 400
    lineHeight: 1.35
  body:
    fontFamily: "'Alegreya Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.0625rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "'Alegreya Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.85rem"
    fontWeight: 800
    letterSpacing: "0.08em"
  button:
    fontFamily: "'Alegreya Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "0.95rem"
    fontWeight: 800
    letterSpacing: "0.06em"
  preco:
    fontFamily: "'Alegreya Sans', 'Segoe UI', system-ui, sans-serif"
    fontSize: "1.15rem"
    fontWeight: 800
    lineHeight: 1.05
    fontFeature: "'tnum' 1"
rounded:
  corte: "0px"
  campo: "2px"
  sm: "3px"
  carimbo: "6px"
  full: "999px"
spacing:
  xs: "0.5rem"
  sm: "0.75rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2.5rem"
  secao: "4.5rem"
  margem: "clamp(1rem, 3vw, 2rem)"
  largura: "1240px"
components:
  button-tinta:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.claro}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0.5em 1.05em"
    height: "44px"
  button-tinta-hover:
    backgroundColor: "#000000"
    textColor: "{colors.amarelo}"
  button-contorno:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    typography: "{typography.button}"
    rounded: "{rounded.sm}"
    padding: "0.5em 1.05em"
    height: "44px"
  button-contorno-hover:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.claro}"
  button-grande:
    height: "52px"
    padding: "0.5em 1.4em"
  folheto:
    backgroundColor: "{colors.amarelo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.corte}"
    padding: "12px"
    width: "236px"
  sacola-link:
    backgroundColor: "{colors.amarelo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.sm}"
    padding: "0.3rem 0.5rem 0.3rem 0.85rem"
    height: "44px"
  sacola-contador:
    backgroundColor: "{colors.carimbo}"
    textColor: "#ffffff"
    rounded: "{rounded.full}"
    size: "1.75rem"
  campo:
    backgroundColor: "{colors.papel-campo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.campo}"
    padding: "0.5rem 0.75rem"
    height: "44px"
  opcao-tag:
    backgroundColor: "{colors.papel-campo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.corte}"
    padding: "0.4rem 0.95rem"
    height: "44px"
  opcao-tag-selecionada:
    backgroundColor: "{colors.tinta}"
    textColor: "{colors.claro}"
  carimbo:
    textColor: "{colors.carimbo}"
    typography: "{typography.headline}"
    rounded: "{rounded.carimbo}"
    padding: "0.35rem 0.8rem 0.45rem"
  letreiro:
    backgroundColor: "{colors.lona-funda}"
    textColor: "{colors.claro}"
    padding: "0.65rem clamp(1rem, 3vw, 2rem)"
  aviso:
    backgroundColor: "{colors.amarelo}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.corte}"
    padding: "0.85rem 0.5rem 0.85rem 1rem"
    width: "360px"
  conta:
    backgroundColor: "{colors.celeste}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.corte}"
    padding: "1.5rem"
---

# Design System: Armazém Ficção

## Overview

**Creative North Star: "A Banca de Cordel"**

The whole store is a cordel stall at a northeastern market fair. The ground is the stall's blue tarp, faintly woven; every invented product is a folheto of cordel, a small booklet printed in black ink on flat coloured paper, its cover a hand-cut woodcut, hung by a wooden clothes-peg from a straw-coloured string. Interface surfaces (the cart, the checkout, the sign-in form, the order) are more sheets of the same paper: newsprint, yellow, sky blue. Ink is the only dark; red appears only where something has been stamped.

The tone is deadpan. Huge wood-type headlines state impossible things with complete seriousness; the folheto's own voice (Alegreya, often italic) does the humour; the interface voice (Alegreya Sans, heavy, uppercase on buttons) stays plain and operational so the store's rules read as real. Density is moderate: few, large, tactile objects on the tarp, with generous blue between them. The world refuses the neutral grid of white product cards and the promotional banner.

Depth is physical, not digital: paper casts a soft navy shadow on the tarp, hangs at a slight tilt, swings when touched, and drops off the string into the bag when bought.

**Key Characteristics:**
- Blue woven tarp ground; all content sits on flat-colour paper printed in near-black ink.
- Three type voices: Ultra wood type (shout), Alegreya (the folheto's printed text), Alegreya Sans (the interface).
- Square-cut paper with an inset printed rule; small, irregular tilts.
- The string (barbante) is the one continuous line that links home, catalog, checkout steps and the order.
- Authored woodcut SVGs with gouge marks and a roughened-ink filter; no photography.
- Red is a rubber stamp: serial numbers, "Pago", "Esgotado", provenance labels, the bag counter.

## Colors

A saturated cobalt tarp under bright fairground papers, with warm near-black ink and a single stamp red.

### Primary
- **Lona (Stall-Tarp Cobalt)** (`lona`): The ground of every page, layered with two fine thread gradients (white at 3.5% every 4px horizontally, black at 6% every 5px vertically) and a soft top highlight. Never used as a paper colour.
- **Lona Funda (Night Tarp)** (`lona-funda`): The painted stall sign (header) and the catalog filter board. `lona-escura` sits between the two and is reserved for darker tarp areas.
- **Tinta (Printer's Ink)** (`tinta`): All text and line work on paper, primary buttons, woodcut ink, the footer ground, and the focus ring on paper.

### Secondary
- **Amarelo (Folheto Yellow)** (`amarelo`): The most-used paper (house rules sheet, toast, current checkout step, order, checkout summary), the bag button, the brand's first word, active nav underline, focus ring on the tarp, and text selection.
- **Rosa, Verde, Celeste, Laranja** (`rosa`, `verde`, `celeste`, `laranja`): The other folheto papers. `rosa` also carries the fictional-store notice on the home; `verde` marks a completed checkout step; `celeste` is the cart summary sheet.

### Tertiary
- **Carimbo (Stamp Red)** (`carimbo`): Serial numbers (Nº 001), the "Pago"/"Aguardando pagamento" stamp, the "Esgotado" seal, provenance labels on the bilhete, and the bag counter.
- **Barbante & Madeira (String and Peg)** (`barbante`, `barbante-escuro`, `madeira`, `madeira-escura`): The string stroke and the wooden pegs. `barbante` also tints the scrollbar thumb.

### Neutral
- **Claro (Cream)** (`claro`): Text on the tarp and on ink buttons.
- **Claro Suave (Faded Sky)** (`claro-suave`): Secondary text on the tarp (subtitles, counts, user greeting), nav hover underline.
- **Jornal (Newsprint)** (`jornal`): Default paper for interface sheets: cart, checkout step, product inner pages, orders table, empty and failure states.
- **Papel de Campo (Field White)** (`papel-campo`): The fill of every input, select, quantity stepper, option tag, and provenance ticket.
- **Tinta Suave (Faded Ink)** (`tinta-suave`): Author line, stock note, hints, unit prices.
- **Erro / Ok** (`erro`, `ok`): Validation text and field borders; confirmed coupon and free-shipping text. `erro` is a separate red from `carimbo` and never stamps.

### Named Rules
**The Ink-On-Paper Rule.** Anything printed on paper uses ink text and an ink focus ring; anything on the tarp uses cream text and a yellow focus ring. A surface switches by setting `--foco` and `color`, never by inventing a third combination.

**The Same Paper Everywhere Rule.** A product keeps one paper colour wherever it appears (string, catalog, cart thumbnail, product cover), assigned by its id across yellow, pink, green, sky and orange in that order.

**The Red Is A Stamp Rule.** Stamp red marks only what has been numbered, stamped or sealed. It is never a button, a link or a background.

## Typography

**Display Font:** Ultra (with Rockwell Extra Bold, serif)
**Folheto Font:** Alegreya (with Georgia, serif)
**Interface Font:** Alegreya Sans (with Segoe UI, system-ui, sans-serif)

**Character:** Ultra is a fat slab wood type, the letterpress poster face of the fairground; it shouts. Alegreya is a calligraphic book serif that reads like the folheto's printed verse. Alegreya Sans is its humanist sibling and carries every control, so interface and story share a skeleton but never a voice.

### Hierarchy
- **Display** (Ultra 400, `clamp(2.1rem, 4.2vw, 3.7rem)`, 0.98): The home headline only, max 19ch, cream on tarp.
- **Headline** (Ultra 400, `clamp(2rem, 4.4vw, 3.4rem)`, 1): Page titles. Product title runs `clamp(1.8rem, 3.6vw, 2.9rem)`; order and house-rules titles sit in the same band.
- **Title** (Ultra 400, 1.02rem, 1.08, uppercase): Folheto cover titles and cart line names, reserved height of 3.3em so prices align along the string.
- **Folheto** (Alegreya 400, 1.12rem, 1.55, max 60ch): Product descriptions, house rules, order items, payment notes. The italic cut (1.3rem, 1.35) carries the product summary and order thanks; at 0.9rem italic it is the "por [inventor]" line.
- **Body** (Alegreya Sans 400, 1.0625rem, 1.5): All interface text.
- **Label** (Alegreya Sans 800, 0.72–0.85rem, 0.06–0.1em tracking, uppercase): Form labels, legends, filter headings, definition terms, table headers.
- **Button** (Alegreya Sans 800, 0.95rem, 0.06em, uppercase).
- **Price** (Alegreya Sans 800, tabular figures): 1.15rem on the folheto, 2rem on the product page, 1.35rem for the cart total.

### Named Rules
**The Three Voices Rule.** Ultra for titles, Alegreya for anything the folheto itself "says", Alegreya Sans for anything the store needs you to operate. A button never speaks in Alegreya; a description never speaks in Ultra.

**The Wood Type Has One Weight Rule.** Ultra is always set at 400 and never below 1rem; hierarchy comes from size, never from faux bold or tracking.

## Layout

A single centred column, max 1240px (`largura`), with fluid side margins of `clamp(1rem, 3vw, 2rem)` and top padding `clamp(1.25rem, 3vw, 2.5rem)`. The string is the organising device: on the home it runs the full viewport width above 1100px, in a parabolic sag (28px at the centre), and folhetos hang lower toward the middle following `4t(1-t)`. Below 1100px the string becomes a horizontal scroll-snap rail of 210px folhetos that bleeds to the screen edges.

Working pages use a main-plus-sidebar grid: catalog filters 250px left; cart and checkout summaries 380px / 360px right, sticky at 6rem. All collapse to one column at 960px. The home intro splits 1.35fr / 1fr and stacks at 760px. At 640px the header stops being sticky, the filter board folds into a disclosure, the toast moves to the bottom, and form grids (six columns, fields spanning 2/3/4) go full width.

Spacing is a rem rhythm of 0.5, 0.75, 1, 1.5, 2.5rem, with 4.5rem between major home sections. Every interactive target is at least 44px tall (40px inside a folheto, 48px for pagination and the stepper).

### Named Rules
**The String Rule.** The barbante is the only continuous line in the store. It appears on the home, catalog, checkout steps (each step a slip of paper pegged to it) and the order confirmation (the order sheet pegged with two pegs). Do not draw other decorative horizontal rules across the tarp.

## Elevation & Depth

Depth is paper on cloth. Every paper surface lifts off the tarp with one soft, navy-black, negatively spread shadow; nothing else is elevated. There are no hard offset shadows, no glows, no inner shadows beyond a 1px inset on errored fields. The open product booklet adds a gutter: a soft dark gradient where the two pages meet.

### Shadow Vocabulary
- **Sombra de Papel** (`box-shadow: 0 14px 22px -12px rgb(5 14 30 / 0.55), 0 3px 5px -2px rgb(5 14 30 / 0.35)`): Every folheto and every paper sheet (rules, cart, summary, checkout step, form, order, notice, table, step slips).
- **Letreiro** (`box-shadow: 0 10px 24px -14px rgb(0 0 0 / 0.8)`): The sticky header over scrolling content.
- **Folheto Aberto** (`box-shadow: 0 30px 50px -28px rgb(0 0 0 / 0.7), 0 4px 10px -4px rgb(0 0 0 / 0.4)`): The open product booklet.
- **Em Voo** (`box-shadow: 0 30px 40px -20px rgb(0 0 0 / 0.6)`): The folheto copy while it flies to the bag.
- **Aviso** (`box-shadow: 0 18px 28px -14px rgb(0 0 0 / 0.65)`): The toast slip.
- **Pregador** (`box-shadow: 0 3px 4px -1px rgb(0 0 0 / 0.45)`): The wooden peg; the string carries `drop-shadow(0 3px 2px rgb(0 0 0 / 0.35))`.

### Named Rules
**The Hung Paper Rule.** Shadows exist only because paper is lying on or hanging over the tarp. A surface that is not paper (the header aside) casts nothing.

## Shapes

Paper is square-cut: folhetos, sheets, slips and booklets have no radius. Each carries an inset printed rule like a real cordel cover: a 1.5px ink line 5px in on folhetos, a 2px ink outline 10–14px in on larger sheets (house rules, form, order, product cover). Paper hangs slightly off true, between -2.4° and +2.2° on the string, -1° on the home notice, -0.6° on the order and provenance ticket. Controls are almost square (buttons and bag 3px, fields 2px). Rounding is reserved for stamps (6px), pegs (3px), and true circles (bag counter, step numbers, icon buttons). The provenance ticket (bilhete) uses a dashed 2px ink border with dashed dividers. Woodcuts sit in a 3px ink frame (4px when large) at a 160:140 ratio and pass through an SVG turbulence filter (`#xilo`, displacement 2.2) that roughens every edge; the order stamp uses the same filter.

## Components

### Buttons
Heavy, inked, and plain: a printed block of ink with cream capitals.
- **Shape:** Nearly square (3px), 2px ink border, minimum 44px.
- **Primary (Tinta):** Ink fill, cream uppercase Alegreya Sans 800 at 0.95rem, 0.06em tracking. Hover goes to pure black with yellow text. Active presses down 1px and scales to 0.98. Disabled at 50% opacity.
- **Outline (Contorno):** Transparent with ink border and text; hover fills with ink.
- **Large:** 52px tall, 1.02rem, wider inline padding (product page "Adicionar à sacola").
- **Text link button:** Bold underlined text, 2px underline at 0.25em offset, cream on tarp or ink on paper.
- **Transitions:** 150ms colour, 120ms transform, on the shared ease-out `cubic-bezier(0.16, 1, 0.3, 1)`.

### Chips (option tags)
- **Style:** Square field-white tag, 2px ink border, bold label with an optional small price delta.
- **State:** Selected inverts to ink with cream text; focus draws a 3px ink outline offset 3px.

### Cards / Containers
- **Folheto (signature card):** Flat paper colour, max 236px, 12px padding, square corners, inset rule, paper shadow, hung from a peg 26px above, serial number badge (stamp red, 2px border, rotated 5°) at the top right, framed woodcut, Ultra uppercase title, italic author, and an ink-ruled footer holding price and Comprar. Sold-out folhetos fade the woodcut to 55% and replace the button with a rotated red "Esgotado" seal.
- **Sheets:** Newsprint, yellow or sky-blue paper with `clamp`-scaled padding (1–3rem) and the paper shadow. Rows inside are separated by 2px ink rules or 1.5px dotted ink lines (totals, receipt items).

### Inputs / Fields
- **Style:** Field-white fill, 2px ink border, 2px radius, 44px minimum, ink text, placeholder in a muted brown. Selects use a custom ink chevron.
- **Labels:** Uppercase 800 label style above the field; hints in faded ink below.
- **Focus:** 3px ink outline offset 3px (on paper) or yellow (on tarp).
- **Error:** Border and 1px inset switch to `erro`; bold error text below.
- **On the filter board:** Checkboxes and radios are drawn in yellow on night tarp; the checked box fills yellow with an ink tick that scales in.

### Navigation
- **Letreiro (header):** Sticky night-tarp band with a 4px ink bottom border. Brand in Ultra (yellow "Armazém", cream "Ficção"). Links are bold Alegreya Sans with a 3px bottom border: transparent at rest, faded sky on hover, yellow when active. The bag is a yellow 3px-radius button with a Lucide bag icon and a red pill counter that drops in (360ms) whenever the count changes.
- **Mobile:** The header wraps, stops sticking, hides the "Sacola" word and the greeting; the bag pushes right.
- **Pagination:** 48px square cream-outlined buttons; hover and current fill yellow with ink text.
- **Icons:** Lucide line icons at heavy strokes (2.4–3), 16–22px, always decorative (`aria-hidden`).

### Varal (the string)
An SVG quadratic curve stroked in `barbante` at 3px (non-scaling) with a soft drop shadow, behind a grid of folhetos whose column count equals the number hung. Folhetos receive a tilt from a fixed sequence and a sag offset by position. On hover-capable devices a folheto swings (`balanco`, 900ms, damped ±3.2° → ±0.8°).

### Carimbo (stamp)
Ultra uppercase in stamp red inside a 4px border with 6px radius, `mix-blend-mode: multiply`, roughened by the woodcut filter, rotated -9°. On the order page it lands with a stamp motion (scale 2.4 → 0.94 → 1, 520ms, 150ms delay).

### Aviso (toast)
A yellow paper slip, top right under the header (bottom on mobile), max 360px, that drops in from -24px and -5° in 380ms and closes after 5s; bold message, optional link, 40px close button.

### Motion
**The One Authored Motion Rule.** Buying copies the folheto, drops it 18px off the string, arcs it to the bag while rotating and shrinking (760ms, `cubic-bezier(0.5, 0, 0.3, 1)`), then the bag wobbles (420ms). Everything else is short state feedback on the shared ease-out. Product woodcuts morph between list and page with a view transition (260ms). Under reduced motion the flight is skipped (only the bag wobble remains), all animation collapses to 1ms, and the stamp and toast fade in over 200ms.

## Do's and Don'ts

### Do:
- **Do** put every piece of content on paper over the tarp: newsprint (`jornal`) for operational sheets, the five folheto colours for products and featured sheets.
- **Do** keep each product on its assigned paper colour everywhere it appears.
- **Do** give paper sheets the paper shadow and an inset ink rule (1.5–2px, 5–14px in), with square corners.
- **Do** hang new sequences (steps, featured rows, confirmations) from the barbante with wooden pegs.
- **Do** draw product imagery as woodcuts: solid ink, gouge marks in the paper colour, a ground strip, the `#xilo` roughening filter, a 3px ink frame.
- **Do** use Ultra only at 400 and only for titles; Alegreya for the folheto's voice; Alegreya Sans for every control, label and price.
- **Do** use tabular figures for every price, quantity and total.
- **Do** keep targets at 44px minimum and switch the focus ring between ink (paper) and yellow (tarp).

### Don't:
- **Don't** show products as white cards with photos on a neutral background, or add promotional banners.
- **Don't** round paper corners or give sheets a border radius; radius is for stamps, pegs and circles.
- **Don't** use stamp red for buttons, links or backgrounds, and don't use `erro` red as a stamp.
- **Don't** use hard offset shadows, glows or coloured shadows; shadows are soft and navy-black, negatively spread.
- **Don't** set body text, buttons or labels in Ultra, or fake-bold it.
- **Don't** add a second decorative motion on the scale of the drop-to-bag; new motion is short state feedback on `cubic-bezier(0.16, 1, 0.3, 1)` and must respect reduced motion.
- **Don't** place cream text on paper or ink text directly on the tarp.
