import { existsSync, readFileSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import logger from '../lib/Utils/logger.js'
import { _reloadProto } from './WAProtoCompile.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const PROTO_FILE = join(__dirname, 'WAProto.proto')
const TABLE_FILE = join(__dirname, 'WAProto.json')

const isJsonValid = () => {
    try {
        const { m, t } = JSON.parse(readFileSync(TABLE_FILE, 'utf8'))
        return Array.isArray(m) && m.length > 0 && typeof t === 'object' && Object.keys(t).length > 0
    } catch { return false }
}

function boot() {
    if (!existsSync(PROTO_FILE) || !existsSync(TABLE_FILE)) {
        throw new Error('[WAProto] WAProto files missing — please reinstall the package')
    }
    if (!isJsonValid()) {
        throw new Error('[WAProto] WAProto.json is invalid or corrupt — please reinstall the package')
    }
    _reloadProto()
    logger.info('[WAProto] Loaded successfully')
}

boot()

// ─── WA Version ───────────────────────────────────────────────────────────────

let _versionCache = null

const _fetchVersion = async () => {
    const res = await fetch('https://web.whatsapp.com/sw.js', {
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
            'Referer': 'https://web.whatsapp.com',
            'Sec-Fetch-Dest': 'script',
            'Sec-Fetch-Mode': 'no-cors',
            'Sec-Fetch-Site': 'same-origin',
        }
    })
    const text = await res.text()
    const match = text.match(/client_revision[^0-9]*([0-9]+)/)
    if (!match) throw new Error('[WAProto] Could not find client_revision in sw.js')
    return [2, 3000, parseInt(match[1])]
}

export const WAProtoReady = _fetchVersion()
    .then(v => { _versionCache = v })
    .catch(e => { logger.warn(`[WAProto] getWAVersion failed: ${e.message}`) })

export async function getWAVersion() {
    if (_versionCache) return _versionCache
    await WAProtoReady
    return _versionCache
}

export { proto, codec, _reloadProto } from './WAProtoCompile.js'
export { default } from './WAProtoCompile.js'