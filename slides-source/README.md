Drop your `.pptx` files here, named **`ppt1.pptx`, `ppt2.pptx`, `ppt3.pptx`, ...**

The number maps to the Nth *lesson*-type week in `src/data/weekMeta.json`, in
order — exam and presentation weeks are skipped automatically, so you don't
need to know week numbers:

    ppt1.pptx  -> week01 (1st lesson week)
    ppt2.pptx  -> week02 (2nd lesson week)
    ppt3.pptx  -> week03 (3rd lesson week)
    ...
    ppt6.pptx  -> week07 (6th lesson week — exam1 is skipped)
    ...

Then run:

    npm run slides:build

This converts every deck into PNGs under `public/slides/<weekId>/` plus a
manifest.json. Commit the generated `public/slides/` folder along with the
source `.pptx` files (or just push and let the GitHub Action in
`.github/workflows/convert-slides.yml` do the conversion for you — see the
main README).

That's it — there's nothing to edit in weekMeta.json or anywhere else. The
site checks for a matching `public/slides/<weekId>/manifest.json` on every
lesson page automatically and shows the slide viewer if one exists.

Need to target a week that isn't type "lesson" (e.g. the group presentation
week, `week16_17`)? Name the file after its exact week id instead —
`week16_17.pptx` — and it'll be used directly, bypassing the ppt-N mapping.

Requires LibreOffice + poppler-utils installed locally if you run this
script yourself — see the comment at the top of scripts/convert-slides.js.
Not required if you use the GitHub Action.
