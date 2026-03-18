import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const inputDir = path.join(__dirname, '../examples/resumes_json')
const outputDir = path.join(__dirname, '../examples/resumes_txt')

function formatDate (str) {
  if (!str) return 'Present'
  const [year, month] = str.split('-')
  if (!month) return year
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec'
  ]
  return `${months[parseInt(month, 10) - 1]} ${year}`
}

function dateRange (start, end) {
  return `${formatDate(start)} – ${formatDate(end)}`
}

function lines (...parts) {
  return parts.filter(Boolean).join('\n')
}

function section (title, body) {
  if (!body) return ''
  return `\n${'─'.repeat(60)}\n${title}\n${'─'.repeat(60)}\n${body}`
}

function bullets (items) {
  return (items || []).map(i => `  • ${i}`).join('\n')
}

function resumeToText (r) {
  const parts = []
  const b = r.basics || {}

  // Header
  if (b.name) parts.push(b.name.toUpperCase())
  if (b.label) parts.push(b.label)

  const contact = [b.email, b.phone, b.url].filter(Boolean).join(' | ')
  if (contact) parts.push(contact)

  if (b.location) {
    const loc = b.location
    const locStr = [loc.address, loc.city, loc.region, loc.countryCode]
      .filter(Boolean)
      .join(', ')
    if (locStr) parts.push(locStr)
  }

  if ((b.profiles || []).length) {
    parts.push('\nPROFILES')
    b.profiles.forEach(p => {
      const detail = [p.network, p.username, p.url].filter(Boolean).join(' – ')
      parts.push(`  • ${detail}`)
    })
  }

  if (b.summary) {
    parts.push(section('SUMMARY', b.summary))
  }

  // Work
  if ((r.work || []).length) {
    const body = r.work
      .map(w =>
        lines(
          `${w.position || ''}${w.name ? ` | ${w.name}` : ''}`,
          w.startDate || w.endDate ? dateRange(w.startDate, w.endDate) : '',
          w.summary || '',
          (w.highlights || []).length ? bullets(w.highlights) : ''
        )
      )
      .join('\n\n')
    parts.push(section('WORK EXPERIENCE', body))
  }

  // Volunteer
  if ((r.volunteer || []).length) {
    const body = r.volunteer
      .map(v =>
        lines(
          `${v.position || ''}${v.organization ? ` | ${v.organization}` : ''}`,
          v.startDate || v.endDate ? dateRange(v.startDate, v.endDate) : '',
          v.summary || '',
          (v.highlights || []).length ? bullets(v.highlights) : ''
        )
      )
      .join('\n\n')
    parts.push(section('VOLUNTEER', body))
  }

  // Education
  if ((r.education || []).length) {
    const body = r.education
      .map(e =>
        lines(
          `${e.institution || ''}`,
          [e.studyType, e.area].filter(Boolean).join(', '),
          e.startDate || e.endDate ? dateRange(e.startDate, e.endDate) : '',
          e.score ? `Score: ${e.score}` : '',
          (e.courses || []).length ? bullets(e.courses) : ''
        )
      )
      .join('\n\n')
    parts.push(section('EDUCATION', body))
  }

  // Awards
  if ((r.awards || []).length) {
    const body = r.awards
      .map(a =>
        lines(
          a.title,
          [a.awarder, a.date ? formatDate(a.date) : '']
            .filter(Boolean)
            .join(' | '),
          a.summary || ''
        )
      )
      .join('\n\n')
    parts.push(section('AWARDS', body))
  }

  // Certificates
  if ((r.certificates || []).length) {
    const body = r.certificates
      .map(c =>
        lines(
          c.name,
          [c.issuer, c.date ? formatDate(c.date) : '']
            .filter(Boolean)
            .join(' | ')
        )
      )
      .join('\n\n')
    parts.push(section('CERTIFICATES', body))
  }

  // Publications
  if ((r.publications || []).length) {
    const body = r.publications
      .map(p =>
        lines(
          p.name,
          [p.publisher, p.releaseDate ? formatDate(p.releaseDate) : '']
            .filter(Boolean)
            .join(' | '),
          p.summary || ''
        )
      )
      .join('\n\n')
    parts.push(section('PUBLICATIONS', body))
  }

  // Skills
  if ((r.skills || []).length) {
    const body = r.skills
      .map(s =>
        lines(
          `${s.name}${s.level ? ` (${s.level})` : ''}`,
          (s.keywords || []).length ? `  ${s.keywords.join(', ')}` : ''
        )
      )
      .join('\n\n')
    parts.push(section('SKILLS', body))
  }

  // Languages
  if ((r.languages || []).length) {
    const body = r.languages
      .map(l => `  • ${l.language}${l.fluency ? `: ${l.fluency}` : ''}`)
      .join('\n')
    parts.push(section('LANGUAGES', body))
  }

  // Interests
  if ((r.interests || []).length) {
    const body = r.interests
      .map(i =>
        lines(
          i.name,
          (i.keywords || []).length ? `  ${i.keywords.join(', ')}` : ''
        )
      )
      .join('\n\n')
    parts.push(section('INTERESTS', body))
  }

  // References
  if ((r.references || []).length) {
    const body = r.references
      .map(ref => lines(ref.name, ref.reference ? `  "${ref.reference}"` : ''))
      .join('\n\n')
    parts.push(section('REFERENCES', body))
  }

  // Projects
  if ((r.projects || []).length) {
    const body = r.projects
      .map(p =>
        lines(
          p.name,
          p.startDate || p.endDate ? dateRange(p.startDate, p.endDate) : '',
          p.description || '',
          (p.highlights || []).length ? bullets(p.highlights) : ''
        )
      )
      .join('\n\n')
    parts.push(section('PROJECTS', body))
  }

  return parts.join('\n') + '\n'
}

await fs.mkdir(outputDir, { recursive: true })

const files = (await fs.readdir(inputDir)).filter(f => f.endsWith('.json'))

await Promise.all(
  files.map(async file => {
    const json = JSON.parse(
      await fs.readFile(path.join(inputDir, file), 'utf-8')
    )
    const txt = resumeToText(json)
    const outFile = path.join(outputDir, file.replace('.json', '.txt'))
    await fs.writeFile(outFile, txt, 'utf-8')
    console.log(`wrote ${outFile}`)
  })
)
