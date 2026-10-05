import { prisma } from "@/lib/db";
import { generatePost, todayDhaka } from "@/lib/pipeline";
import { alert } from "@/lib/telegram";

export const maxDuration = 300;

export async function GET(req: Request) {
  if (req.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`)
    return new Response("unauthorized", { status: 401 });

  const forDate = todayDhaka();
  if (await prisma.post.findUnique({ where: { forDate } })) return Response.json({ ok: true, skipped: "exists" });

  try {
    const post = await generatePost(forDate);
    return Response.json({ ok: true, id: post.id });
  } catch (e) {
    await alert(`⚠️ Generation failed for ${forDate}: ${(e as Error).message}`);
    return Response.json({ ok: false }, { status: 500 });
  }
}
