import { PostStatus } from "@/lib/generated/prisma/client";
import { prisma } from "@/lib/db";
import { todayDhaka } from "@/lib/pipeline";
import { alert, sendPreview } from "@/lib/telegram";

export const maxDuration = 30;

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response("unauthorized", { status: 401 });

  const post = await prisma.post.findUnique({ where: { forDate: todayDhaka() } });
  if (!post) {
    await alert("⚠️ No post was generated today. Check the generate cron logs.");
    return Response.json({ ok: false });
  }
  if (post.status !== PostStatus.READY) return Response.json({ ok: true, skipped: post.status });

  await sendPreview(post);
  await prisma.post.update({ where: { id: post.id }, data: { status: PostStatus.SENT } });
  return Response.json({ ok: true });
}
