import { DEFAULT_CONNECTION_CONFIG } from '../Defaults/index.js'
import { WAProtoReady } from '../../WAProto/index.js'
import { makeMessageBuilderSocket } from './zervonex-handler.js'

await WAProtoReady

const makeWASocket = (config) => {
    const newConfig = { ...DEFAULT_CONNECTION_CONFIG, ...config }
    if (config.shouldSyncHistoryMessage === undefined) {
        newConfig.shouldSyncHistoryMessage = () => !!newConfig.syncFullHistory
    }
    return makeMessageBuilderSocket(newConfig)
}

export * from './chats.js'
export * from './zervonex-handler.js'
export { makeWASocket }
export default makeWASocket