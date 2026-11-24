import { fetch, Agent } from 'undici'
import { readFileSync, writeFileSync, existsSync, createWriteStream, unlinkSync } from 'fs'
import { pipeline } from 'stream/promises'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const CACHE_FILE = join(__dirname, '.cache.json')
const PROTO_FILE = join(__dirname, 'WAProto.proto')
const BUNDLE_TMP = join(__dirname, 'WAProto.bundle.tmp')
const GITHUB_RAW = 'https://raw.githubusercontent.com/zervonex/baileys/wa-cache'

const agent = new Agent({ connect: { family: 4, timeout: 60000 } })

// ── Cache helpers ─────────────────────────────────────────────────────────────

const readCache = () => { try { return existsSync(CACHE_FILE) ? JSON.parse(readFileSync(CACHE_FILE, 'utf8')) : {} } catch { return {} } }
const writeCache = (data) => writeFileSync(CACHE_FILE, JSON.stringify(data, null, 2), 'utf8')
const isCacheValid = (cache) => !!(cache.version && cache.hash && existsSync(PROTO_FILE))
const hasLocal = (cache) => !!(cache.version && existsSync(PROTO_FILE))
const removeTmp = () => { try { if (existsSync(BUNDLE_TMP)) unlinkSync(BUNDLE_TMP) } catch { } }

// ── GitHub fetch ──────────────────────────────────────────────────────────────

async function fetchJSON(file) {
    const res = await fetch(`${GITHUB_RAW}/${file}`, { dispatcher: agent })
    if (!res.ok) throw new Error(`[WAProto] fetch failed for ${file}: ${res.status}`)
    return res.json()
}

async function fetchBundle() {
    const res = await fetch(`${GITHUB_RAW}/WAProto.bundle.js`, { dispatcher: agent })
    if (!res.ok) throw new Error(`[WAProto] fetch failed for WAProto.bundle.js: ${res.status}`)
    await pipeline(res.body, createWriteStream(BUNDLE_TMP))
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function fetchProtoBundle() {
    const cache = readCache()
    if (isCacheValid(cache)) return { changed: false, version: cache.version }
    try {
        const { version, hash } = await fetchJSON('wa-version.json')
        if (!version || !hash) throw new Error('[WAProto] wa-version.json missing version or hash field')
        if (cache.version === String(version) && cache.hash === hash && existsSync(PROTO_FILE)) {
            writeCache({ version: String(version), hash })
            return { changed: false, version: String(version) }
        }
        await fetchBundle()
        writeCache({ version: String(version), hash })
        return { changed: true, bundlePath: BUNDLE_TMP, version: String(version) }
    } catch (err) {
        removeTmp()
        if (hasLocal(cache)) return { changed: false, version: cache.version }
        throw new Error(`[WAProto] fetch failed and no local files available: ${err.message}`)
    }
}

export async function getWAVersion() {
    const cache = readCache()
    if (isCacheValid(cache)) return [2, 3000, parseInt(cache.version)]
    try {
        const { version } = await fetchJSON('wa-version.json')
        return [2, 3000, parseInt(String(version))]
    } catch {
        return [2, 3000, parseInt(cache.version || '0')]
    }
}