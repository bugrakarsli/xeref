import { Bot } from 'grammy'
import { env } from './env.js'
import { resolveUser, pairUser } from './auth.js'
import { reply, resetChat, ensureChat } from './chat.js'

export function createBot(): Bot {
  const bot = new Bot(env.TELEGRAM_BOT_TOKEN)

  bot.command('start', async (ctx) => {
    const code = ctx.match?.trim()
    const telegramId = ctx.from?.id
    if (!telegramId) return

    if (!code) {
      const existing = await resolveUser(telegramId)
      if (existing) {
        await ctx.reply(`Already linked to ${existing.email ?? 'your xeref account'}. Use /help for commands.`)
      } else {
        await ctx.reply('Generate a pairing code at xeref.ai/settings/telegram, then send /start <code>.')
      }
      return
    }

    const user = await pairUser(telegramId, ctx.from?.username, code)
    if (!user) {
      await ctx.reply('Invalid or expired code. Generate a new one at xeref.ai/settings/telegram.')
      return
    }
    await ctx.reply(`Linked to ${user.email ?? 'your xeref account'} (${user.plan} plan). Say hi!`)
  })

  bot.command('help', async (ctx) => {
    await ctx.reply(
      '/help — show this message\n' +
      '/status — account info\n' +
      '/reset — clear conversation history\n' +
      'Just type to chat with your xeref assistant.'
    )
  })

  bot.command('status', async (ctx) => {
    const telegramId = ctx.from?.id
    if (!telegramId) return

    const user = await resolveUser(telegramId)
    if (!user) {
      await ctx.reply('Not linked. Send /start <code> with a code from xeref.ai/settings/telegram.')
      return
    }
    await ctx.reply(`Account: ${user.email ?? user.userId}\nPlan: ${user.plan}`)
  })

  bot.command('reset', async (ctx) => {
    const telegramId = ctx.from?.id
    if (!telegramId) return

    const user = await resolveUser(telegramId)
    if (!user) {
      await ctx.reply('Not linked. Send /start <code> first.')
      return
    }

    const chatId = await ensureChat(user.userId, ctx.chat.id)
    await resetChat(chatId)
    await ctx.reply('Conversation history cleared.')
  })

  bot.on('message:text', async (ctx) => {
    const telegramId = ctx.from?.id
    if (!telegramId) return

    const user = await resolveUser(telegramId)
    if (!user) {
      await ctx.reply('Link your xeref account first: /start <code>. Get a code at xeref.ai/settings/telegram.')
      return
    }

    await ctx.replyWithChatAction('typing')
    const response = await reply(user.userId, ctx.chat.id, ctx.message.text)
    await ctx.reply(response)
  })

  bot.catch((err) => {
    console.error('Bot error:', err.message)
  })

  return bot
}
