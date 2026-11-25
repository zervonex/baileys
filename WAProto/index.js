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
    if (!existsSync(PROTO_FILE) || !existsSync(TABLE_FILE)) throw new Error('[WAProto] Proto files missing — reinstall the package')
    if (!isJsonValid()) throw new Error('[WAProto] WAProto.json invalid or corrupt — reinstall the package')
    _reloadProto()
}

boot()

let _versionCache = null

export const WAProtoReady = fetch('https://web.whatsapp.com/sw.js', {
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Referer': 'https://web.whatsapp.com',
        'Sec-Fetch-Dest': 'script',
        'Sec-Fetch-Mode': 'no-cors',
        'Sec-Fetch-Site': 'same-origin',
    }
})
    .then(res => res.text())
    .then(text => {
        const match = text.match(/client_revision[^0-9]*([0-9]+)/)
        if (!match) throw new Error('[WAProto] client_revision not found in sw.js')
        const revision = parseInt(match[1], 10)
        if (isNaN(revision)) throw new Error(`[WAProto] client_revision is NaN: ${match[1]}`)
        _versionCache = [2, 3000, revision]
        logger.info(`[WAProto] WA version: ${_versionCache.join('.')}`)
    })
    .catch(err => {
        logger.warn(`[WAProto] Version fetch failed: ${err.message}`)
    })

export function getWAVersion() {
    if (!_versionCache) throw new Error('[WAProto] WA version unavailable — fetch failed at boot')
    return _versionCache
}

export { proto, codec, _reloadProto } from './WAProtoCompile.js'
export { default } from './WAProtoCompile.js'