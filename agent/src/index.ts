import './env.js'
import { createBot } from './bot.js'

const bot = createBot()

process.once('SIGINT', () => bot.stop())
process.once('SIGTERM', () => bot.stop())

console.log('Starting xeref Telegram bot...')
bot.start()
