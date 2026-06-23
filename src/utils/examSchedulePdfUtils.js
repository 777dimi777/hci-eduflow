import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist'
import pdfWorkerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

GlobalWorkerOptions.workerSrc = pdfWorkerUrl

const MAX_FILE_SIZE = 15 * 1024 * 1024

const cyrillicToLatinMap = {
  А: 'A',
  а: 'a',
  Б: 'B',
  б: 'b',
  В: 'V',
  в: 'v',
  Г: 'G',
  г: 'g',
  Д: 'D',
  д: 'd',
  Ђ: 'Dj',
  ђ: 'dj',
  Е: 'E',
  е: 'e',
  Ж: 'Z',
  ж: 'z',
  З: 'Z',
  з: 'z',
  И: 'I',
  и: 'i',
  Ј: 'J',
  ј: 'j',
  К: 'K',
  к: 'k',
  Л: 'L',
  л: 'l',
  Љ: 'Lj',
  љ: 'lj',
  М: 'M',
  м: 'm',
  Н: 'N',
  н: 'n',
  Њ: 'Nj',
  њ: 'nj',
  О: 'O',
  о: 'o',
  П: 'P',
  п: 'p',
  Р: 'R',
  р: 'r',
  С: 'S',
  с: 's',
  Т: 'T',
  т: 't',
  Ћ: 'C',
  ћ: 'c',
  У: 'U',
  у: 'u',
  Ф: 'F',
  ф: 'f',
  Х: 'H',
  х: 'h',
  Ц: 'C',
  ц: 'c',
  Ч: 'C',
  ч: 'c',
  Џ: 'Dz',
  џ: 'dz',
  Ш: 'S',
  ш: 's',
}

const monthMap = {
  januar: '01',
  februar: '02',
  mart: '03',
  april: '04',
  maj: '05',
  jun: '06',
  jul: '07',
  avgust: '08',
  septembar: '09',
  oktobar: '10',
  novembar: '11',
  decembar: '12',
}

function cleanText(value) {
  return String(value || '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function toLatin(value) {
  return String(value || '')
    .split('')
    .map((character) => cyrillicToLatinMap[character] || character)
    .join('')
}

export function normalizeText(value) {
  return toLatin(value)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

export function normalizeCourseCode(value) {
  return toLatin(value)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
}

function looksLikeCourseCode(value) {
  const code = normalizeCourseCode(value)

  if (code.length < 5) {
    return false
  }

  if (!/\d/.test(code) || !/[A-Z]/.test(code)) {
    return false
  }

  return (
    /^(?:\d{1,2}[A-Z]{2,}\d[A-Z0-9]*|[A-Z]{2,4}\d[A-Z0-9]*)$/.test(code)
  )
}

function looksLikeDate(value) {
  const normalizedValue = normalizeText(value)

  return /\d{1,2}\.\s*[a-z]+\s+\d{4}\./.test(normalizedValue)
}

function looksLikeTime(value) {
  return /^\d{1,2}:\d{2}(?::\d{2})?$/.test(cleanText(value))
}

function looksLikeDuration(value) {
  return /^\d{2}:\d{2}:\d{2}$/.test(cleanText(value))
}

function looksLikeRoomInfo(value) {
  const normalizedValue = normalizeText(value)

  return (
    normalizedValue.includes('u dogovoru') ||
    normalizedValue.includes('polaze se') ||
    /^\d+\s*\(/.test(normalizedValue) ||
    /^[a-z]\d+/.test(normalizedValue) ||
    /^c\d+/.test(normalizedValue) ||
    /^l\d+/.test(normalizedValue)
  )
}

function getDateIso(dateText) {
  const normalizedDate = normalizeText(dateText)

  const match = normalizedDate.match(
    /(\d{1,2})\.\s*([a-z]+)\s*(\d{4})\./
  )

  if (!match) {
    return ''
  }

  const day = match[1].padStart(2, '0')
  const month = monthMap[match[2]]
  const year = match[3]

  if (!month) {
    return ''
  }

  return `${year}-${month}-${day}`
}

function createRowsFromItems(items) {
  const positionedItems = items
    .filter((item) => item.str && item.str.trim())
    .map((item) => ({
      text: cleanText(item.str),
      x: Number(item.transform?.[4] || 0),
      y: Number(item.transform?.[5] || 0),
      width: Number(item.width || 0),
    }))
    .sort((firstItem, secondItem) => {
      if (Math.abs(firstItem.y - secondItem.y) > 3) {
        return secondItem.y - firstItem.y
      }

      return firstItem.x - secondItem.x
    })

  const lines = []

  positionedItems.forEach((item) => {
    const lastLine = lines[lines.length - 1]

    if (lastLine && Math.abs(lastLine.y - item.y) <= 3) {
      lastLine.items.push(item)
      return
    }

    lines.push({
      y: item.y,
      items: [item],
    })
  })

  return lines.map((line) => {
    const sortedItems = line.items.sort(
      (firstItem, secondItem) => firstItem.x - secondItem.x
    )

    const cells = []

    sortedItems.forEach((item) => {
      const previousCell = cells[cells.length - 1]

      if (
        previousCell &&
        item.x - previousCell.right <= 14
      ) {
        previousCell.parts.push(item.text)
        previousCell.right = Math.max(
          previousCell.right,
          item.x + item.width
        )
        return
      }

      cells.push({
        parts: [item.text],
        right: item.x + item.width,
      })
    })

    const cleanCells = cells
      .map((cell) => cleanText(cell.parts.join(' ')))
      .filter(Boolean)

    return {
      cells: cleanCells,
      text: cleanText(cleanCells.join(' ')),
    }
  })
}

export async function extractPdfRows(file, onProgress) {
  if (!file) {
    throw new Error('Izaberi PDF fajl.')
  }

  const isPdf =
    file.type === 'application/pdf' ||
    file.name.toLowerCase().endsWith('.pdf')

  if (!isPdf) {
    throw new Error('Izabrani fajl nije PDF dokument.')
  }

  if (file.size > MAX_FILE_SIZE) {
    throw new Error('PDF je prevelik. Maksimalna veličina je 15 MB.')
  }

  const arrayBuffer = await file.arrayBuffer()

  const loadingTask = getDocument({
    data: new Uint8Array(arrayBuffer),
  })

  const pdf = await loadingTask.promise
  const rows = []

  for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber)
    const textContent = await page.getTextContent()

    const pageRows = createRowsFromItems(textContent.items).map((row) => ({
      ...row,
      pageNumber,
    }))

    rows.push(...pageRows)

    onProgress?.({
      currentPage: pageNumber,
      totalPages: pdf.numPages,
    })
  }

  return {
    pageCount: pdf.numPages,
    rows,
  }
}

function parseStructuredRow(row) {
  const levelIndex = row.cells.findIndex(
    (cell) => normalizeText(cell) === 'oas'
  )

  if (levelIndex === -1) {
    return null
  }

  const level = row.cells[levelIndex]
  const accreditation = row.cells[levelIndex + 1]
  const semester = row.cells[levelIndex + 2]
  const module = row.cells[levelIndex + 3]
  const courseCode = row.cells[levelIndex + 4]

  if (!looksLikeCourseCode(courseCode)) {
    return null
  }

  const dateIndex = row.cells.findIndex(
    (cell, index) =>
      index > levelIndex + 4 && looksLikeDate(cell)
  )

  if (dateIndex === -1) {
    return null
  }

  const time = row.cells.find(
    (cell, index) =>
      index > dateIndex && looksLikeTime(cell)
  )

  const subjectName = cleanText(
    row.cells.slice(levelIndex + 5, dateIndex).join(' ')
  )

  if (!subjectName) {
    return null
  }

  return {
    id: `${row.pageNumber}-${courseCode}-${dateIndex}`,
    level,
    accreditation,
    semester,
    module,
    courseCode,
    subjectName,
    dateText: row.cells[dateIndex],
    dateIso: getDateIso(row.cells[dateIndex]),
    time: time || '',
    duration: '',
    rooms: '',
  }
}

function parseScheduleRow(row) {
  const codeIndex = row.cells.findIndex((cell) =>
    looksLikeCourseCode(cell)
  )

  if (codeIndex === -1) {
    return null
  }

  const dateText = row.cells
    .slice(0, codeIndex)
    .find((cell) => looksLikeDate(cell))

  if (!dateText) {
    return null
  }

  const time = row.cells
    .slice(0, codeIndex)
    .find((cell) => looksLikeTime(cell) && !looksLikeDuration(cell))

  const duration = row.cells
    .slice(0, codeIndex)
    .find((cell) => looksLikeDuration(cell))

  const afterCode = row.cells.slice(codeIndex + 1)

  const roomIndex = afterCode.findIndex((cell) =>
    looksLikeRoomInfo(cell)
  )

  const subjectName = cleanText(
    (
      roomIndex === -1
        ? afterCode
        : afterCode.slice(0, roomIndex)
    ).join(' ')
  )

  const rooms = cleanText(
    roomIndex === -1
      ? ''
      : afterCode.slice(roomIndex).join(' ')
  )

  if (!subjectName) {
    return null
  }

  return {
    id: `${row.pageNumber}-${row.cells[codeIndex]}-${codeIndex}`,
    level: '',
    accreditation: '',
    semester: '',
    module: '',
    courseCode: row.cells[codeIndex],
    subjectName,
    dateText,
    dateIso: getDateIso(dateText),
    time: time || '',
    duration: duration || '',
    rooms,
  }
}

function matchesProfile(entry, profile) {
  const normalizedPrefix = normalizeCourseCode(profile.codePrefix)

  const hasStructuredData =
    entry.level ||
    entry.accreditation ||
    entry.semester ||
    entry.module

  if (!hasStructuredData) {
    return normalizedPrefix
      ? normalizeCourseCode(entry.courseCode).startsWith(normalizedPrefix)
      : true
  }

  const levelMatches =
    !profile.level ||
    normalizeText(entry.level) === normalizeText(profile.level)

  const accreditationMatches =
    !profile.accreditation ||
    normalizeText(entry.accreditation) ===
      normalizeText(profile.accreditation)

  const semesterMatches =
    !profile.semester ||
    String(entry.semester) === String(profile.semester)

  const moduleMatches =
    !profile.module ||
    normalizeText(entry.module) === normalizeText(profile.module)

  return (
    levelMatches &&
    accreditationMatches &&
    semesterMatches &&
    moduleMatches
  )
}

export function parseExamScheduleRows(rows, profile) {
  const uniqueEntries = new Map()

  rows.forEach((row) => {
    const entry =
      parseStructuredRow(row) ||
      parseScheduleRow(row)

    if (!entry || !matchesProfile(entry, profile)) {
      return
    }

    const uniqueKey = [
      normalizeCourseCode(entry.courseCode),
      entry.dateIso,
      entry.time,
      normalizeText(entry.subjectName),
    ].join('|')

    if (!uniqueEntries.has(uniqueKey)) {
      uniqueEntries.set(uniqueKey, entry)
    }
  })

  return [...uniqueEntries.values()].sort((firstEntry, secondEntry) => {
    const firstValue = `${firstEntry.dateIso} ${firstEntry.time}`
    const secondValue = `${secondEntry.dateIso} ${secondEntry.time}`

    return firstValue.localeCompare(secondValue)
  })
}

export function createEmptyExamEntry(profile) {
  return {
    id: `manual-${Date.now()}`,
    level: profile.level || '',
    accreditation: profile.accreditation || '',
    semester: profile.semester || '',
    module: profile.module || '',
    courseCode: '',
    subjectName: '',
    dateText: '',
    dateIso: '',
    time: '',
    duration: '',
    rooms: '',
  }
}
export function findMatchingSubjectForEntry(subjects, entry) {
  if (!entry) {
    return null
  }

  const normalizedEntryCode = normalizeCourseCode(entry.courseCode)
  const normalizedEntryName = normalizeText(entry.subjectName)

  return subjects.find((subject) => {
    const normalizedSubjectCode = normalizeCourseCode(subject.code)
    const normalizedSubjectName = normalizeText(subject.name)

    const sameCode =
      normalizedEntryCode &&
      normalizedSubjectCode &&
      normalizedEntryCode === normalizedSubjectCode

    const sameName =
      normalizedEntryName &&
      normalizedSubjectName &&
      (normalizedEntryName === normalizedSubjectName ||
        normalizedEntryName.includes(normalizedSubjectName) ||
        normalizedSubjectName.includes(normalizedEntryName))

    return sameCode || sameName
  })
}