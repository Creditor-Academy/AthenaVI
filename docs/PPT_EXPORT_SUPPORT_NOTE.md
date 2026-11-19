# Presentation export: support note

For the support team. What each export format gives the customer, what PowerPoint and Google Slides can't show, and how to answer the common questions.

## Which format to use

| Format | Best for | Looks like the editor? | Editable? |
|---|---|---|---|
| **PDF** | Sharing, printing, sending to clients | Yes, exactly | No |
| **PNG / JPEG** | Social posts, documents, thumbnails | Yes, exactly. Sizes 1×, 2× or 3×; PNG can have a transparent background | No |
| **PowerPoint (PPTX)** | Editing further in PowerPoint | Very close (see below) | Yes, mostly |
| **PPTX made for Google Slides** | Importing into Google Slides | Close (see below) | Yes, mostly |

If a customer only needs to show or send the deck, recommend **PDF**: it is exactly what they see in the editor.

## PowerPoint: what stays editable

Text (with its fonts, sizes, colours, bullets, numbering, links, underline and so on), shapes and lines, photos (including their crop and round or rounded frames), tables, charts, groups, speaker notes, shadows, gradients and the slide backgrounds are all **real PowerPoint objects** the customer can edit.

The deck's fonts are **embedded** in the file, so PowerPoint shows them even if they aren't installed. If a font couldn't be embedded, PowerPoint uses a similar font, and text may wrap a little differently. The export dialog lists any such font.

## What becomes a picture

Some designs can't be drawn by PowerPoint. These are exported as **pictures** of exactly what the editor shows: they look right but can't be edited as text or shapes. After a PowerPoint export, the dialog's "What's in your file" list says how many there are and why.

- **Text:** curved text and glitch text. The words are copied into the slide's speaker notes so they can be retyped.
- **Photos:** filters, faded edges, borders, device frames (phone / laptop mock-ups), and shape masks other than circle, oval, rounded, arch, hexagon and blob.
- **Effects:** blur, outline and glitch effects on elements.
- **Pictures inside shapes**, and some icons and graphics from the library.
- **Embedded videos and web content:** a picture of the video with a link to it (PowerPoint can't play the embedded player).

Text boxes are sometimes made **slightly taller** so their text fits in PowerPoint (its text measures a little differently). The dialog mentions this when it happens.

## Google Slides

Choose **"Made for: Google Slides"** in the export dialog. Google Slides can't draw some things PowerPoint can, so for that choice:

- **Gradients** (in text, shapes and backgrounds), **glow** and **hollow (outline-only) text** become pictures.
- **Fonts are not embedded**: Google Slides uses Google Fonts by name. Our fonts are Google Fonts, so they normally appear correctly.
- **Charts** become pictures when Google Slides imports the file. This is how Google Slides handles PowerPoint charts, not something we can change. To edit the data, use PowerPoint, or rebuild the chart in Google Slides.
- A **glow** effect on an element is not shown.

If a customer opens the regular (PowerPoint) file in Google Slides instead, gradients show as a single colour and glow is missing. Ask them to export again with "Made for: Google Slides".

## Other apps

**Keynote** and **LibreOffice** open the PowerPoint file, but they are not tested to the same standard: some effects, gradient text and fonts may look different. For an exact copy, use PDF.

## Common questions

**"The export is taking a while."** Big decks take longer, and at busy times exports wait their turn ("Waiting for a free spot…"). The customer can close the dialog: they get an inbox message when the file is ready, and the message reopens the download.

**"It failed: this export took too long."** Ask them to try again, or to export fewer slides at a time (choose slides in the dialog). Nothing was charged.

**"It failed: servers are busy."** It waited too long for a free spot. Trying again in a few minutes usually works. Nothing was charged.

**"The download link doesn't work any more."** Each link lasts an hour; clicking Download again (or the inbox message) gets a fresh one. Files are kept for **7 days**; after that the dialog says the file has expired and they need to export again.

**"Was I charged for a cancelled or failed export?"** No. The export fee is charged only when the file is saved. Cancelled and failed exports are free.

**"Something looks different in PowerPoint."** Check, in order:
1. Is it in the "What becomes a picture" list above? Then it is expected, and it looks right as a picture.
2. Did the dialog list a font that couldn't be embedded? PowerPoint used a different font.
3. Is it opened in Google Slides from a PowerPoint export? Export again with "Made for: Google Slides".
4. Otherwise, collect the deck link, the slide number, the app and version (PowerPoint for Windows / Mac / web, or Google Slides), and a screenshot, and raise it with engineering.

**"Can I get the slides as images?"** Yes: choose PNG or JPEG, pick the slides, and the size. Several slides download as a .zip with one image per slide, named by page number.
