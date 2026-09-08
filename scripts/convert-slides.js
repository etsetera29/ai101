#!/usr/bin/env node
/**
 * Converts numbered PPTX decks (ppt1.pptx, ppt2.pptx, ...) in slides-source/
 * into per-slide PNGs under public/slides/<weekId>/, plus a manifest.json.
 *
 * NAMING CONVENTION — this is the whole workflow:
 *   Drop decks in slides-source/ named ppt1.pptx, ppt2.pptx, ppt3.pptx, ...
 *   ppt1 maps to the 1st lesson-type week in weekMeta.json (in file order),
 *   ppt2 to the 2nd, and so on. Exam/presentation weeks are skipped
 *   automatically since they're not "lesson" type, so the numbering only
 *   ever counts actual lesson weeks — you don't need to know week numbers.
 *
 *   (If you ever need to target a specific week id directly — e.g. the
 *   group presentation week, which isn't type "lesson" — you can also name
 *   a file after the week id directly, e.g. week16_17.pptx, and it'll be
 *   used for that exact week instead of going through the ppt-N mapping.)
 *
 * The site (SlideViewer.jsx) checks for /slides/<weekId>/manifest.json on
 * every lesson page automatically — there's nothing to wire up in
 * weekMeta.json. Convert, commit (or let the GitHub Action do it), deploy.
 *
 * Requires on the machine running this script (NOT required on Vercel):
 *   - LibreOffice (`soffice` on PATH)
 *   - poppler-utils (`pdftoppm` on PATH)
 *   (Neither is required if you use the GitHub Action instead — see
 *   .github/workflows/convert-slides.yml)
 *
 * Usage:
 *   node scripts/convert-slides.js          # convert everything in slides-source/
 */

import { execFileSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import os from 'node:os'

const ROOT = path.resolve(import.meta.dirname, '..')
const SOURCE_DIR = path.join(ROOT, 'slides-source')
const OUTPUT_DIR = path.join(ROOT, 'public', 'slides')
const WEEK_META_PATH = path.join(ROOT, 'src', 'data', 'weekMeta.json')
const RESOLUTION_DPI = 150 // ~2000px wide for a 13.33in slide — crisp on retina, reasonable file size

function findBinary(names) {
  for (const name of names) {
    try {
      execFileSync(process.platform === 'win32' ? 'where' : 'which', [name], { stdio: 'pipe' })
      return name
    } catch {
      // try next candidate
    }
  }
  return null
}

/**
 * Resolves each source file to the weekId it should populate.
 *   - ppt1.pptx, ppt2.pptx, ... -> Nth lesson-type week in weekMeta.json
 *   - <weekId>.pptx (e.g. week16_17.pptx) -> that exact week id, direct override
 * Returns a Map<absolutePath, weekId>, and logs anything it can't resolve.
 */
function resolveDeckTargets(files) {
  const weekMeta = JSON.parse(fs.readFileSync(WEEK_META_PATH, 'utf8'))
  const lessonWeekIds = weekMeta.filter((w) => w.type === 'lesson').map((w) => w.id)
  const allWeekIds = new Set(weekMeta.map((w) => w.id))

  const targets = new Map()
  for (const file of files) {
    const base = path.basename(file, path.extname(file))
    const pptMatch = base.match(/^ppt(\d+)$/i)

    if (pptMatch) {
      const n = parseInt(pptMatch[1], 10)
      const weekId = lessonWeekIds[n - 1]
      if (!weekId) {
        console.warn(
          `  ⚠ ${base}.pptx — there's no ${n === lessonWeekIds.length + 1 ? 'a ' + n + 'th' : n + 'th'} lesson week (only ${lessonWeekIds.length} lesson weeks exist). Skipping.`
        )
        continue
      }
      targets.set(file, weekId)
    } else if (allWeekIds.has(base)) {
      // direct override: filename matches a weekId exactly (e.g. week16_17.pptx)
      targets.set(file, base)
    } else {
      console.warn(
        `  ⚠ ${path.basename(file)} — doesn't match "ppt<N>.pptx" or a known week id. Skipping. (Rename it to ppt1.pptx, ppt2.pptx, etc.)`
      )
    }
  }
  return { targets, lessonWeekIds, weekMeta }
}

function convertOne(pptxPath, weekId) {
  const outDir = path.join(OUTPUT_DIR, weekId)
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), `slides-${weekId}-`))

  console.log(`\n▶ ${path.basename(pptxPath)} → ${weekId}`)
  console.log(`  converting to PDF...`)

  const soffice = findBinary(['soffice', 'libreoffice'])
  if (!soffice) {
    throw new Error(
      'LibreOffice not found on PATH. Install it (e.g. `brew install --cask libreoffice` or `sudo apt install libreoffice-impress`), or just use the GitHub Action instead of running this locally.'
    )
  }
  execFileSync(soffice, ['--headless', '--convert-to', 'pdf', '--outdir', tmpDir, pptxPath], {
    stdio: 'pipe',
  })

  const pdfName = path.basename(pptxPath, path.extname(pptxPath)) + '.pdf'
  const pdfPath = path.join(tmpDir, pdfName)
  if (!fs.existsSync(pdfPath)) {
    throw new Error(`LibreOffice did not produce a PDF for ${path.basename(pptxPath)}. Check the deck isn't corrupted.`)
  }

  console.log(`  rasterizing PDF → PNGs at ${RESOLUTION_DPI} DPI...`)
  const pdftoppm = findBinary(['pdftoppm'])
  if (!pdftoppm) {
    throw new Error(
      'pdftoppm not found on PATH. Install poppler-utils (e.g. `brew install poppler` or `sudo apt install poppler-utils`), or just use the GitHub Action instead.'
    )
  }
  fs.rmSync(outDir, { recursive: true, force: true })
  fs.mkdirSync(outDir, { recursive: true })
  const prefix = path.join(tmpDir, 'slide')
  execFileSync(pdftoppm, ['-png', '-r', String(RESOLUTION_DPI), pdfPath, prefix], { stdio: 'pipe' })

  // pdftoppm names files slide-1.png, slide-2.png, ... slide-10.png (no zero-padding
  // by default) — normalize to zero-padded, 1-indexed names so they sort correctly
  // and are predictable to reference from the manifest.
  const produced = fs
    .readdirSync(tmpDir)
    .filter((f) => f.startsWith('slide-') && f.endsWith('.png'))
    .sort((a, b) => {
      const na = parseInt(a.match(/slide-(\d+)\.png/)[1], 10)
      const nb = parseInt(b.match(/slide-(\d+)\.png/)[1], 10)
      return na - nb
    })

  if (produced.length === 0) {
    throw new Error(`No slides were produced for ${weekId}. Is the deck empty?`)
  }

  produced.forEach((file, i) => {
    const n = String(i + 1).padStart(2, '0')
    fs.copyFileSync(path.join(tmpDir, file), path.join(outDir, `slide-${n}.png`))
  })

  const manifest = {
    weekId,
    sourceFile: path.basename(pptxPath),
    count: produced.length,
    files: produced.map((_, i) => `slide-${String(i + 1).padStart(2, '0')}.png`),
    generatedAt: new Date().toISOString(),
  }
  fs.writeFileSync(path.join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2))

  fs.rmSync(tmpDir, { recursive: true, force: true })
  console.log(`  ✓ wrote ${produced.length} slides → public/slides/${weekId}/`)
}

function main() {
  if (!fs.existsSync(SOURCE_DIR)) {
    fs.mkdirSync(SOURCE_DIR, { recursive: true })
    console.log(`Created ${path.relative(ROOT, SOURCE_DIR)}/ — drop decks there named ppt1.pptx, ppt2.pptx, etc. and re-run.`)
    return
  }

  const files = fs
    .readdirSync(SOURCE_DIR)
    .filter((f) => f.toLowerCase().endsWith('.pptx'))
    .map((f) => path.join(SOURCE_DIR, f))

  if (files.length === 0) {
    console.log(`No .pptx files found in ${path.relative(ROOT, SOURCE_DIR)}/. Add ppt1.pptx, ppt2.pptx, etc. and re-run.`)
    return
  }

  const { targets, lessonWeekIds } = resolveDeckTargets(files)

  if (targets.size === 0) {
    console.log('Nothing to convert — no source files resolved to a week.')
    return
  }

  console.log(`Found ${targets.size} deck(s) to convert (${lessonWeekIds.length} lesson weeks available).`)
  for (const [file, weekId] of targets) {
    convertOne(file, weekId)
  }
  console.log(`\nDone — the site will pick these up automatically, nothing else to edit.`)
}

main()

