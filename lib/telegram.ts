import type { Post } from "./generated/prisma/client";
import { fullCaption } from "./pipeline";

const call = (method: string, body: unknown) =>
  fetch(`https://api.telegram.org/bot${process.env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }).then((r) => r.json());

const chat = () => process.env.TELEGRAM_OWNER_ID!;

export async function alert(text: string) {
  return call("sendMessage", { chat_id: chat(), text });
}

export const answerCallback = (id: string, text: string) =>
  call("answerCallbackQuery", { callback_query_id: id, text });

// Telegram photo captions are capped at 1024 chars, so: photo first, full caption + buttons as a message.
export async function sendPreview(post: Post) {
  await call("sendPhoto", { chat_id: chat(), photo: post.imageUrl, caption: `📅 আজকের পোস্ট — ${post.topic}` });
  return call("sendMessage", {
    chat_id: chat(),
    text: fullCaption(post),
    reply_markup: {
      inline_keyboard: [
        [{ text: "✅ Post now", callback_data: `p:${post.id}` }],
        [
          { text: "🔄 Regenerate", callback_data: `r:${post.id}` },
          { text: "⏭ Skip today", callback_data: `s:${post.id}` },
        ],
      ],
    },
  });
}
