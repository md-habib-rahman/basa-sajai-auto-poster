import { put } from "@vercel/blob";
import { PostStatus, type Post } from "./generated/prisma/client";
import { prisma } from "./db";
// import { generateImage, suggestTopic, writeDraft } from "./gemini";
import { generateImage, suggestTopic, writeDraft } from "./cloudflare";
import { addHeadline } from "./overlay";

export const todayDhaka = () =>
	new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Dhaka" }).format(new Date()); // YYYY-MM-DD

export const fullCaption = (p: Pick<Post, "captionBn" | "hashtags">) =>
	`${p.captionBn}\n\n${p.hashtags.map((h) => (h.startsWith("#") ? h : `#${h}`)).join(" ")}`;

async function pickTopic(): Promise<string> {
	const next = await prisma.topic.findFirst({ where: { used: false }, orderBy: { id: "asc" } });
	if (next) {
		await prisma.topic.update({ where: { id: next.id }, data: { used: true } });
		return next.title;
	}
	const recent = await prisma.post.findMany({ orderBy: { id: "desc" }, take: 40, select: { topic: true } });
	return suggestTopic(recent.map((r) => r.topic));
}

/** Generates (or regenerates, when `topic` is passed) the post for a given date. */
export async function generatePost(forDate: string, topic?: string) {
	const t0 = Date.now();
	const lap = (m: string) => console.log(`[generate] ${m}: ${Date.now() - t0}ms`);
	const t = topic ?? (await pickTopic());
	lap("topic");
	const draft = await writeDraft(t);
	lap("text");
	const raw = await generateImage(draft.imagePrompt);
	lap("image");
	const img = await addHeadline(raw, draft.headline);
	lap("overlay");
	const blob = await put(`posts/${forDate}-${Date.now()}.jpg`, img, {
		access: "public",
		contentType: "image/jpeg",
	});
	lap("upload");
	const data = { topic: t, ...draft, imageUrl: blob.url, status: PostStatus.READY, error: null };
	return prisma.post.upsert({ where: { forDate }, create: { forDate, ...data }, update: data });
}
