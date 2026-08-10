import {
  formatFontWeightLabel,
  getFontRole,
  parseCssSize,
} from './brandKitUtils'

export async function downloadBrandGuidelinePdf({ kitName, kitData, setGeneratingGuideline, setError }) {
    try {
      setGeneratingGuideline(true)
      const { jsPDF } = await import('jspdf')
      const doc = new jsPDF({
        orientation: 'landscape',
        unit: 'pt',
        format: [960, 540], // 16:9 Widescreen Aspect Ratio PDF Presentation!
      })

      const name = kitName || 'Brand Kit'
      const colors = kitData.colors || []
      const headingFont = getFontRole(kitData.fonts, 'heading')
      const subheadingFont = getFontRole(kitData.fonts, 'subheading')
      const bodyFont = getFontRole(kitData.fonts, 'body')

      // SLIDE 1: COVER SLIDE
      doc.setFillColor(15, 23, 42) // #0F172A Dark Slate
      doc.rect(0, 0, 960, 540, 'F')

      doc.setFillColor(37, 99, 235) // Primary Blue Accent Bar
      doc.rect(70, 160, 8, 220, 'F')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(13)
      doc.text('BRAND IDENTITY & DESIGN SYSTEM', 95, 185)

      doc.setFontSize(44)
      doc.text(name, 95, 240)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(16)
      doc.setTextColor(148, 163, 184)
      doc.text('Executive Brand Guidelines & Presentation Specification Deck', 95, 278)

      doc.setFontSize(12)
      doc.text(`Generated: ${new Date().toLocaleDateString()}  •  Aspect Ratio: 16:9 Widescreen  •  v1.0 Deck`, 95, 470)
      doc.text('Page 1 of 6', 850, 470)

      // SLIDE 2: COLOR PALETTE
      doc.addPage([960, 540], 'l')
      doc.setFillColor(248, 250, 252)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('02 / COLOR PALETTE', 70, 55)

      doc.setTextColor(15, 23, 42)
      doc.setFontSize(28)
      doc.text('Harmonic Brand Color System', 70, 90)

      const swatchWidth = 120
      const swatchHeight = 110
      colors.slice(0, 6).forEach((c, idx) => {
        const x = 70 + idx * 135
        const y = 125
        let hex = c.hex || '#94A3B8'

        try {
          let clean = hex.replace('#', '')
          if (clean.length === 3) clean = clean.split('').map((x) => x + x).join('')
          const num = parseInt(clean, 16) || 0
          doc.setFillColor((num >> 16) & 255, (num >> 8) & 255, num & 255)
          doc.rect(x, y, swatchWidth, swatchHeight, 'F')
        } catch {
          doc.setFillColor(148, 163, 184)
          doc.rect(x, y, swatchWidth, swatchHeight, 'F')
        }

        doc.setTextColor(15, 23, 42)
        doc.setFontSize(12)
        doc.setFont('helvetica', 'bold')
        doc.text(c.name || `Color ${idx + 1}`, x, y + swatchHeight + 20)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(100, 116, 139)
        doc.text(hex, x, y + swatchHeight + 36)
      })

      doc.setFillColor(255, 255, 255)
      doc.rect(70, 325, 820, 140, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.rect(70, 325, 820, 140, 'D')

      doc.setTextColor(15, 23, 42)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(14)
      doc.text('Color Usage & Accessibility Standards', 95, 355)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(11)
      doc.setTextColor(71, 85, 105)
      doc.text('• Primary brand colors must be used for key CTA elements, header highlights, and focal graphics.', 95, 380)
      doc.text('• Secondary palette colors should provide contrast for secondary buttons, tags, and data visualization.', 95, 400)
      doc.text('• Ensure all text combinations meet WCAG AA contrast ratio standards (4.5:1 minimum).', 95, 420)

      doc.setTextColor(100, 116, 139)
      doc.text('Page 2 of 6', 850, 495)

      // SLIDE 3: LOGO SYSTEM
      doc.addPage([960, 540], 'l')
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('03 / LOGO SYSTEM', 70, 55)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.text('Logo Lockups & Clear Space Rules', 70, 90)

      const logoCards = [
        { title: 'Primary Mark', desc: 'Main logo for light/neutral backgrounds' },
        { title: 'Light Mode', desc: 'Optimised for white backgrounds' },
        { title: 'Dark Mode', desc: 'Optimised for dark backgrounds' },
        { title: 'Monochrome', desc: 'Single-color black/white version' },
      ]
      logoCards.forEach((lc, idx) => {
        const col = idx % 2
        const row = Math.floor(idx / 2)
        const x = 70 + col * 420
        const y = 120 + row * 170

        doc.setFillColor(30, 41, 59)
        doc.rect(x, y, 400, 150, 'F')
        doc.setDrawColor(51, 65, 85)
        doc.rect(x, y, 400, 150, 'D')

        doc.setTextColor(255, 255, 255)
        doc.setFont('helvetica', 'bold')
        doc.setFontSize(14)
        doc.text(lc.title, x + 20, y + 30)

        doc.setFont('helvetica', 'normal')
        doc.setFontSize(11)
        doc.setTextColor(148, 163, 184)
        doc.text(lc.desc, x + 20, y + 50)

        doc.setFillColor(51, 65, 85)
        doc.rect(x + 20, y + 68, 360, 64, 'F')
        doc.setTextColor(203, 213, 225)
        doc.text(`[ ${name} Logo Specimen ]`, x + 125, y + 106)
      })

      doc.setTextColor(148, 163, 184)
      doc.text('Page 3 of 6', 850, 495)

      // SLIDE 4: TYPOGRAPHY SYSTEM
      doc.addPage([960, 540], 'l')
      doc.setFillColor(248, 250, 252)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setTextColor(100, 116, 139)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('04 / TYPOGRAPHY SYSTEM', 70, 55)

      doc.setTextColor(15, 23, 42)
      doc.setFontSize(28)
      doc.text('Typographic Hierarchy & Specimens', 70, 90)

      doc.setFillColor(255, 255, 255)
      doc.rect(70, 120, 820, 95, 'F')
      doc.setDrawColor(226, 232, 240)
      doc.rect(70, 120, 820, 95, 'D')

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(10)
      doc.text(
        `HEADING  •  ${String(headingFont.family).toUpperCase()}  •  ${formatFontWeightLabel(headingFont.weight).toUpperCase()}  •  ${headingFont.size}  •  LH ${headingFont.lineHeight}`,
        90,
        142,
      )
      doc.setTextColor(15, 23, 42)
      doc.setFontSize(Math.min(28, Math.max(14, parseCssSize(headingFont.size, 22) * 0.55)))
      doc.setFont('helvetica', Number(headingFont.weight) >= 600 ? 'bold' : 'normal')
      doc.text('The quick brown fox jumps over the lazy dog', 90, 180)

      doc.setFillColor(255, 255, 255)
      doc.rect(70, 230, 820, 90, 'F')
      doc.rect(70, 230, 820, 90, 'D')

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(10)
      doc.text(
        `SUBHEADING  •  ${String(subheadingFont.family).toUpperCase()}  •  ${formatFontWeightLabel(subheadingFont.weight).toUpperCase()}  •  ${subheadingFont.size}  •  LH ${subheadingFont.lineHeight}`,
        90,
        252,
      )
      doc.setTextColor(30, 41, 59)
      doc.setFontSize(Math.min(20, Math.max(12, parseCssSize(subheadingFont.size, 16) * 0.7)))
      doc.setFont('helvetica', Number(subheadingFont.weight) >= 600 ? 'bold' : 'normal')
      doc.text('A clean, modern sans-serif perfectly paired for clarity and contrast.', 90, 285)

      doc.setFillColor(255, 255, 255)
      doc.rect(70, 335, 820, 120, 'F')
      doc.rect(70, 335, 820, 120, 'D')

      doc.setTextColor(100, 116, 139)
      doc.setFontSize(10)
      doc.text(
        `BODY  •  ${String(bodyFont.family).toUpperCase()}  •  ${formatFontWeightLabel(bodyFont.weight).toUpperCase()}  •  ${bodyFont.size}  •  LH ${bodyFont.lineHeight}`,
        90,
        357,
      )
      doc.setTextColor(71, 85, 105)
      doc.setFontSize(Math.min(14, Math.max(10, parseCssSize(bodyFont.size, 12) * 0.75)))
      doc.setFont('helvetica', Number(bodyFont.weight) >= 600 ? 'bold' : 'normal')
      doc.text('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et', 90, 382)
      doc.text('dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip', 90, 402)
      doc.text('ex ea commodo consequat. Executive deck layouts combine display headings with readable body type.', 90, 422)

      doc.setTextColor(100, 116, 139)
      doc.text('Page 4 of 6', 850, 495)

      // SLIDE 5: IMAGERY & MOOD
      doc.addPage([960, 540], 'l')
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('05 / IMAGERY & MOOD', 70, 55)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(28)
      doc.text('Visual Style & Photography Guidelines', 70, 90)

      doc.setFillColor(30, 41, 59)
      doc.rect(70, 120, 820, 110, 'F')
      doc.setDrawColor(51, 65, 85)
      doc.rect(70, 120, 820, 110, 'D')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(14)
      doc.setFont('helvetica', 'bold')
      doc.text('Image Brief & Visual Philosophy', 95, 150)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(148, 163, 184)
      doc.text(`"${kitData.imageStyle || 'Clean product photography with natural lighting, studio quality, brand-safe minimalist aesthetics.'}"`, 95, 180)

      doc.setTextColor(148, 163, 184)
      doc.text('Page 5 of 6', 850, 495)

      // SLIDE 6: GOVERNANCE
      doc.addPage([960, 540], 'l')
      doc.setFillColor(15, 23, 42)
      doc.rect(0, 0, 960, 540, 'F')

      doc.setFillColor(37, 99, 235)
      doc.rect(0, 0, 960, 8, 'F')

      doc.setTextColor(148, 163, 184)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(11)
      doc.text('06 / GOVERNANCE & CLOSING', 70, 55)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(30)
      doc.text('Brand Compliance & Contact', 70, 95)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(14)
      doc.setTextColor(148, 163, 184)
      doc.text('These brand guidelines ensure consistent application across all internal and external communication.', 70, 128)

      doc.setFillColor(30, 41, 59)
      doc.rect(70, 155, 820, 270, 'F')
      doc.setDrawColor(51, 65, 85)
      doc.rect(70, 155, 820, 270, 'D')

      doc.setTextColor(255, 255, 255)
      doc.setFont('helvetica', 'bold')
      doc.setFontSize(16)
      doc.text('Brand Governance Checklist', 100, 190)

      doc.setFont('helvetica', 'normal')
      doc.setFontSize(12)
      doc.setTextColor(203, 213, 225)
      doc.text('1. Always verify logo files are exported from official brand kit vectors.', 100, 225)
      doc.text('2. Do not modify color hex codes or typography pairings without brand team approval.', 100, 250)
      doc.text('3. Use designated slide templates for external presentation decks.', 100, 275)
      doc.text(`4. Voice Tone Target: ${kitData.voice?.tone || 'Professional & Confident'}.`, 100, 300)
      doc.text(`5. Target Audience: ${kitData.voice?.audience || 'General Enterprise Stakeholders'}.`, 100, 325)

      doc.setTextColor(148, 163, 184)
      doc.setFontSize(11)
      doc.text(`© ${new Date().getFullYear()} ${name}. All rights reserved.`, 70, 495)
      doc.text('Page 6 of 6', 850, 495)

      doc.save(`${name.replace(/\s+/g, '_')}_Brand_Guidelines.pdf`)
    } catch (err) {
      console.error('Error generating PDF guideline:', err)
      setError('Failed to generate PDF. Please try again.')
    } finally {
      setGeneratingGuideline(false)
    }
}
