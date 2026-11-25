import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js'
import { getWAVersion, WAProtoReady } from '../../WAProto/index.js'
import { makeMessageBuilderSocket } from './zervonex-handler.js'

await WAProtoReady

const makeWASocket = (config) => {
    const version = getWAVersion()
    const newConfig = { ...DEFAULT_CONNECTION_CONFIG, ...config, version }
    if (config.shouldSyncHistoryMessage === undefined) {
        newConfig.shouldSyncHistoryMessage = () => !!newConfig.syncFullHistory
    }
    return makeMessageBuilderSocket(newConfig)
}

export * from './chats.js'
export * from './zervonex-handler.js'
export { makeWASocket }
export default makeWASocket