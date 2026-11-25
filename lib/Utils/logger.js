import P from 'pino';
const logger = P({ timestamp: () => `,"time":"${new Date().toJSON()}"` });
export { logger };
export default logger;