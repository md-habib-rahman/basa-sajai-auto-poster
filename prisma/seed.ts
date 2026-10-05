import "dotenv/config";
import { prisma } from "../lib/db";

// Your planned topics go first; once these run out, Gemini suggests new ones.
const topics = [
	"ছোট ড্রয়িংরুমে বড় দেখানোর ৫ কৌশল",
	"৫০০ টাকার মধ্যে বারান্দা সাজানো",
	"বেডরুমের ফাঁকা দেয়াল সাজানোর আইডিয়া",
	"আগে vs পরে: পুরনো কোণা নতুন রূপে",
	"উৎসবের আগে ঘর সাজানোর ৩টি টিপস",
	"আপনার পছন্দ কোন লিভিং রুম স্টাইল? (পোল)",
	"এক লাইটেই ঘরের লুক বদলানোর উপায়",
];

async function main() {
	// Imported after env is loaded (import hoisting would run db.ts too early)
	const { prisma } = await import("../lib/db");
	for (const title of topics) {
		await prisma.topic.upsert({ where: { title }, create: { title }, update: {} });
	}
	console.log("seeded", topics.length);
	await prisma.$disconnect();
}

main().catch((e) => {
	console.error(e);
	process.exit(1);
});
