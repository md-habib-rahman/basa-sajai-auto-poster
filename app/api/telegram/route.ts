import { after } from "next/server";
import { PostStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { publishPhoto } from "@/lib/facebook";
import { fullCaption, generatePost } from "@/lib/pipeline";
import { alert, answerCallback, sendPreview } from "@/lib/telegram";

export const maxDuration = 300;

const ACTIONABLE = [PostStatus.READY, PostStatus.SENT, PostStatus.FAILED];

export async function POST(req: Request) {
  if (req.headers.get("x-telegram-bot-api-secret-token") !== process.env.TELEGRAM_WEBHOOK_SECRET)
    return new Response("unauthorized", { status: 401 });

  const cb = (await req.json()).callback_query;
  if (!cb || String(cb.from.id) !== process.env.TELEGRAM_OWNER_ID) return Response.json({ ok: true });

  const [action, idStr] = String(cb.data).split(":");
  const id = Number(idStr);

  // Atomic claim: a double tap (or Telegram retry) can never publish twice.
  const claim = await prisma.post.updateMany({
    where: { id, status: { in: ACTIONABLE } },
    data: { status: PostStatus.PUBLISHING },
  });
  if (claim.count === 0) {
    await answerCallback(cb.id, "Already handled");
    return Response.json({ ok: true });
  }
  await answerCallback(cb.id, action === "p" ? "Posting…" : action === "r" ? "Regenerating…" : "Skipped");

  after(async () => {
    const post = await prisma.post.findUniqueOrThrow({ where: { id } });
    try {
      if (action === "p") {
        const fbId = await publishPhoto(post.imageUrl, fullCaption(post));
        await prisma.post.update({
          where: { id },
          data: { status: PostStatus.PUBLISHED, fbPostId: fbId, publishedAt: new Date(), error: null },
        });
        await alert(`✅ Published: https://www.facebook.com/${fbId}`);
      } else if (action === "r") {
        const fresh = await generatePost(post.forDate, post.topic);
        await sendPreview(fresh);
        await prisma.post.update({ where: { id }, data: { status: PostStatus.SENT } });
      } else {
        await prisma.post.update({ where: { id }, data: { status: PostStatus.SKIPPED } });
        await alert("⏭ Skipped today's post.");
      }
    } catch (e) {
      await prisma.post.update({ where: { id }, data: { status: PostStatus.FAILED, error: (e as Error).message } });
      await alert(`❌ Failed (${action}): ${(e as Error).message}\nTap the button again to retry.`);
    }
  });

  return Response.json({ ok: true });
}
