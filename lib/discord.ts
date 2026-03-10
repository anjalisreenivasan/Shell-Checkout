const BOT_TOKEN = process.env.DISCORD_BOT_TOKEN
const CHANNEL_ID = process.env.DISCORD_CHANNEL_ID
const OPS_USER_ID = process.env.DISCORD_OPS_USER_ID
const OPS_NAME = process.env.DISCORD_OPS_NAME ?? 'Director of Ops'
const OPS_HANDLE = process.env.DISCORD_OPS_HANDLE ?? ''

const DISCORD_API = 'https://discord.com/api/v10'

async function discordFetch(endpoint: string, body: Record<string, unknown>) {
  if (!BOT_TOKEN) {
    console.warn('Discord bot token not configured, skipping notification')
    return null
  }

  const res = await fetch(`${DISCORD_API}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bot ${BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.text()
    console.error('Discord API error:', err)
    return null
  }
  return res.json()
}

async function sendChannelMessage(content: string) {
  if (!CHANNEL_ID) return null
  return discordFetch(`/channels/${CHANNEL_ID}/messages`, { content })
}

async function sendDM(discordUserId: string, content: string) {
  const channel = await discordFetch('/users/@me/channels', { recipient_id: discordUserId })
  if (!channel?.id) return null
  return discordFetch(`/channels/${channel.id}/messages`, { content })
}

export async function notifyNewRequest(
  shellerName: string,
  shellerDiscord: string | null,
  itemName: string,
  returnDate: string,
  returnTime: string,
  boardUrl: string,
) {
  const discordLine = shellerDiscord ? ` (@${shellerDiscord})` : ''
  const message = [
    `📋 **New Checkout Request**`,
    ``,
    `**Sheller:** ${shellerName}${discordLine}`,
    `**Item:** ${itemName}`,
    `**Return:** ${returnDate} at ${returnTime}`,
    ``,
    `<@${OPS_USER_ID}> — [Review on Shell Checkout](${boardUrl})`,
  ].join('\n')

  return sendChannelMessage(message)
}

export async function notifyApproved(
  discordUserId: string | null,
  itemName: string,
) {
  if (!discordUserId) return null

  const message = [
    `✅ Your **${itemName}** request has been approved!`,
    ``,
    `Please coordinate with **${OPS_NAME}** (@${OPS_HANDLE}) to pick up your item.`,
  ].join('\n')

  return sendDM(discordUserId, message)
}

export async function notifyDenied(
  discordUserId: string | null,
  itemName: string,
) {
  if (!discordUserId) return null

  const message = [
    `❌ Your **${itemName}** request was denied.`,
    ``,
    `Please reach out to **${OPS_NAME}** (@${OPS_HANDLE}) for more details or to arrange alternative dates.`,
  ].join('\n')

  return sendDM(discordUserId, message)
}
