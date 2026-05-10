import { useEffect, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { AnimatePresence, motion } from 'framer-motion'
import axios from 'axios'
import {
  AudioLines,
  Bot,
  CheckCircle2,
  CloudUpload,
  Download,
  LoaderCircle,
  MoonStar,
  Sparkles,
  SunMedium,
  Zap,
} from 'lucide-react'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000'

const bytesToMb = (bytes) => `${(bytes / (1024 * 1024)).toFixed(2)} MB`

function App() {
  const [theme, setTheme] = useState('dark')
  const [file, setFile] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [phase, setPhase] = useState('idle')
  const [downloadUrl, setDownloadUrl] = useState('')
  const [statusText, setStatusText] = useState('Waiting for media input...')
  const [isBusy, setIsBusy] = useState(false)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const onDrop = (acceptedFiles) => {
    const picked = acceptedFiles?.[0]
    if (!picked) return
    setFile(picked)
    setUploadProgress(0)
    setDownloadUrl('')
    setStatusText('MP4 loaded. Ready for conversion.')
    setPhase('ready')
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'video/mp4': ['.mp4'] },
    maxFiles: 1,
  })

  const convertToMp3 = async () => {
    if (!file) return
    setPhase('uploading')
    setStatusText('Uploading and preparing cinematic conversion pipeline...')
    setIsBusy(true)
    const formData = new FormData()
    formData.append('video', file)

    try {
      const response = await axios.post(`${API_BASE}/api/convert`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        responseType: 'blob',
        onUploadProgress: (event) => {
          const progress = Math.round((event.loaded * 100) / (event.total || 1))
          setUploadProgress(progress)
          if (progress >= 100) {
            setPhase('converting')
            setStatusText('Generating high-fidelity MP3 output...')
          }
        },
      })

      const blobUrl = URL.createObjectURL(new Blob([response.data], { type: 'audio/mpeg' }))
      setDownloadUrl(blobUrl)
      setPhase('done')
      setStatusText('Conversion complete. Download unlocked.')
    } catch (error) {
      setPhase('error')
      setStatusText(error?.response?.data?.error || 'Conversion failed. Try another file.')
    } finally {
      setIsBusy(false)
    }
  }

  const bars = new Array(24).fill(0)

  return (
    <div className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-70">
        <div className="absolute -left-20 top-8 h-80 w-80 rounded-full bg-cyan-400/20 blur-3xl" />
        <div className="absolute right-0 top-10 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />
      </div>

      <header className="glass-panel mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 p-2 text-slate-950 shadow-lg shadow-cyan-500/40">
            <AudioLines size={18} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-cyan-400">Neural Audio Lab</p>
            <h1 className="text-sm font-semibold sm:text-base">MP4 to MP3 Hyper Converter</h1>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="glass-panel rounded-xl p-2 text-cyan-400 transition hover:scale-105"
        >
          {theme === 'dark' ? <SunMedium size={18} /> : <MoonStar size={18} />}
        </button>
      </header>

      <main className="mx-auto mt-6 grid max-w-6xl gap-6 lg:grid-cols-[2.2fr_1fr]">
        <motion.section layout className="glass-panel rounded-3xl p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-violet-400">Futuristic Utility Node</p>
              <h2 className="text-xl font-semibold sm:text-2xl">Drop a video to synthesize audio</h2>
            </div>
            <span className="rounded-full border border-cyan-400/40 px-3 py-1 text-xs text-cyan-300">
              AI status: online
            </span>
          </div>

          <div
            {...getRootProps()}
            className={`relative cursor-pointer rounded-2xl border border-dashed p-8 text-center transition ${
              isDragActive
                ? 'border-cyan-300 bg-cyan-500/10 shadow-[0_0_45px_-10px_rgba(56,189,248,0.75)]'
                : 'border-cyan-500/40 bg-slate-950/30 hover:border-violet-400 hover:shadow-[0_0_45px_-10px_rgba(168,85,247,0.8)]'
            }`}
          >
            <input {...getInputProps()} />
            <motion.div
              animate={{ y: [0, -8, 0], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 2.2, repeat: Infinity }}
              className="mx-auto mb-4 w-fit rounded-2xl bg-gradient-to-r from-cyan-400 to-purple-500 p-3 text-slate-900"
            >
              <CloudUpload size={30} />
            </motion.div>
            <p className="text-lg font-medium">{isDragActive ? 'Release to upload' : 'Drag & drop MP4 file'}</p>
            <p className="mt-1 text-sm text-[color:var(--text-muted)]">or click to browse your local media</p>
          </div>

          <AnimatePresence mode="wait">
            {file && (
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 14 }}
                className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-4"
              >
                <div>
                  <p className="font-medium text-cyan-300">{file.name}</p>
                  <p className="text-sm text-[color:var(--text-muted)]">File size: {bytesToMb(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={convertToMp3}
                  disabled={isBusy}
                  className="rounded-xl bg-gradient-to-r from-cyan-400 to-violet-500 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:scale-105 disabled:opacity-65"
                >
                  {isBusy ? 'Processing...' : 'Convert to MP3'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_1.4fr]">
            <div className="glass-panel rounded-2xl p-4">
              <div className="flex items-center justify-between text-sm">
                <span>Upload progress</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="mt-3 h-2 rounded-full bg-slate-500/20">
                <motion.div
                  className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-violet-500"
                  animate={{ width: `${uploadProgress}%` }}
                />
              </div>
              <div className="mt-4 flex justify-center">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 4, ease: 'linear' }}
                  className="relative h-28 w-28"
                >
                  <div className="absolute inset-0 rounded-full border-2 border-cyan-400/20" />
                  <svg className="absolute inset-0 h-full w-full -rotate-90">
                    <circle cx="56" cy="56" r="50" stroke="url(#ring)" strokeWidth="6" fill="none" strokeDasharray="314" strokeDashoffset={314 - (314 * uploadProgress) / 100} />
                    <defs>
                      <linearGradient id="ring" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#22d3ee" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 grid place-items-center text-sm font-semibold">{uploadProgress}%</div>
                </motion.div>
              </div>
            </div>

            <div className="glass-panel rounded-2xl p-4">
              <div className="mb-3 flex items-center justify-between text-sm">
                <span>Live waveform simulation</span>
                <span className="flex items-center gap-1 text-cyan-300"><Zap size={14} /> realtime</span>
              </div>
              <div className="flex h-28 items-end gap-1 overflow-hidden rounded-xl bg-slate-950/50 p-3">
                {bars.map((_, idx) => (
                  <motion.span
                    key={idx}
                    className="w-2 rounded-t-md bg-gradient-to-b from-cyan-300 to-violet-500"
                    animate={{ height: phase === 'converting' || phase === 'uploading' ? [14, 62, 25, 78, 34] : [8, 16, 12] }}
                    transition={{ duration: 1.2, repeat: Infinity, delay: idx * 0.04 }}
                  />
                ))}
              </div>
            </div>
          </div>
        </motion.section>

        <aside className="space-y-6">
          <div className="glass-panel rounded-3xl p-5">
            <div className="mb-3 flex items-center gap-2 text-cyan-300">
              <Bot size={16} />
              <p className="text-sm font-semibold uppercase tracking-widest">AI Assistant</p>
            </div>
            <p className="text-sm text-[color:var(--text-muted)]">{statusText}</p>
            <div className="mt-4 flex items-center gap-2 text-sm">
              {phase === 'done' ? <CheckCircle2 size={16} className="text-emerald-400" /> : <LoaderCircle size={16} className={`${isBusy ? 'animate-spin text-cyan-400' : 'text-slate-400'}`} />}
              <span>Conversion status: {phase}</span>
            </div>

            {downloadUrl && (
              <motion.a
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                href={downloadUrl}
                download={`${file?.name?.replace(/\.mp4$/i, '') || 'converted'}.mp3`}
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-500/90 px-4 py-2 text-sm font-semibold text-slate-900"
              >
                <Download size={16} /> Download MP3
              </motion.a>
            )}
          </div>

          <div className="glass-panel rounded-3xl p-5">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-violet-300">Pipeline nodes</p>
            {['Upload ingest', 'FFmpeg transcoder', 'Neural waveform monitor', 'Secure delivery'].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 2.5, repeat: Infinity, delay: i * 0.35 }}
                className="mb-2 rounded-xl border border-white/10 px-3 py-2 text-sm"
              >
                <Sparkles size={12} className="mr-2 inline text-cyan-300" />
                {item}
              </motion.div>
            ))}
          </div>
        </aside>
      </main>
    </div>
  )
}

export default App
