const express = require('express')
const cors = require('cors')
const fs = require('fs')
const path = require('path')
const multer = require('multer')
const ffmpeg = require('fluent-ffmpeg')
const ffmpegPath = require('ffmpeg-static')

ffmpeg.setFfmpegPath(ffmpegPath)

const app = express()
const PORT = process.env.PORT || 5000
const FRONTEND_ORIGIN = '*'

const UPLOAD_DIR = path.join(process.cwd(), 'uploads')
const OUTPUT_DIR = path.join(process.cwd(), 'outputs')

for (const dir of [UPLOAD_DIR, OUTPUT_DIR]) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, UPLOAD_DIR),
  filename: (_, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '-')}`
    cb(null, safeName)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 1024 * 1024 * 350 },
  fileFilter: (_, file, cb) => {
    if (!file.mimetype.includes('mp4')) {
      cb(new Error('Only MP4 uploads are supported'))
      return
    }
    cb(null, true)
  },
})

app.use(
  cors({
    origin: FRONTEND_ORIGIN,
  }),
)
app.use(express.json())

app.get('/api/health', (_, res) => {
  res.json({ ok: true, service: 'mp4-to-mp3-converter' })
})

app.post('/api/convert', upload.single('video'), async (req, res) => {
  if (!req.file) {
    res.status(400).json({ error: 'No file uploaded.' })
    return
  }

  const inputPath = req.file.path
  const baseName = path.parse(req.file.filename).name
  const outputPath = path.join(OUTPUT_DIR, `${baseName}.mp3`)

  const cleanFiles = () => {
    for (const target of [inputPath, outputPath]) {
      if (fs.existsSync(target)) {
        fs.unlink(target, () => {})
      }
    }
  }

  ffmpeg(inputPath)
    .audioCodec('libmp3lame')
    .audioBitrate('192k')
    .audioFrequency(44100)
    .outputOptions('-vn')
    .on('end', () => {
      res.download(outputPath, `${baseName}.mp3`, (downloadErr) => {
        if (downloadErr && !res.headersSent) {
          res.status(500).json({ error: 'Could not deliver converted file.' })
        }
        cleanFiles()
      })
    })
    .on('error', (error) => {
      cleanFiles()
      res.status(500).json({ error: `Conversion failed: ${error.message}` })
    })
    .save(outputPath)
})

app.use((error, _, res, __) => {
  if (error instanceof multer.MulterError) {
    res.status(400).json({ error: error.message })
    return
  }

  res.status(500).json({ error: error.message || 'Unexpected server error' })
})

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`)
})
