export type Draft = {
	hook: string;
	headline: string;
	captionBn: string;
	hashtags: string[];
	imagePrompt: string;
};

const SYSTEM = `You write Facebook posts in natural, warm, conversational Bengali (Bangladesh) for "বাসা সাজাই", a home decor page.
Return ONLY valid JSON, no markdown fences, with exactly these keys: hook, headline, captionBn, hashtags (array of strings), imagePrompt.
Rules:
- captionBn structure: (1) a curiosity/question HOOK line, (2) one short intro line, (3) 4-5 numbered tips with one emoji each and a short reason, (4) a comment CTA asking readers to reply with a number or choice, (5) a "save this post" line, (6) a line inviting people to follow বাসা সাজাই. No hashtags inside captionBn.
- headline: max 7 Bengali words, punchy, shown on top of the image.
- hashtags: 5 to 6 Bengali/English hashtags, always including #বাসাসাজাই.
- imagePrompt: English. Photorealistic, 1:1, South Asian home setting, bright natural light, clean composition, empty space in the top third, no people, no text, no watermark.
- Practical for typical Bangladeshi apartments and budgets. Never invent prices.`;

async function run(model: string, body: unknown) {
	const url = `https://api.cloudflare.com/client/v4/accounts/${process.env.CF_ACCOUNT_ID}/ai/run/${model}`;
	const res = await fetch(url, {
		method: "POST",
		headers: { Authorization: `Bearer ${process.env.CF_API_TOKEN}`, "content-type": "application/json" },
		body: JSON.stringify(body),
	});
	const json = await res.json();
	if (!res.ok || json.success === false) throw new Error(`Cloudflare AI: ${JSON.stringify(json.errors ?? json)}`);
	return json.result;
}

async function chat(system: string, user: string): Promise<string> {
	const r = await run(process.env.CF_TEXT_MODEL!, {
		messages: [{ role: "system", content: system }, { role: "user", content: user }],
		max_tokens: 2048,
	});
	const out = r.response ?? r.choices?.[0]?.message?.content;
	return (typeof out === "string" ? out : JSON.stringify(out)).trim();
}

function parseDraft(text: string): Draft {
	const m = text.match(/\{[\s\S]*\}/);
	if (!m) throw new Error("No JSON in model reply");
	const d = JSON.parse(m[0]);
	if (!d.captionBn || !d.headline || !d.imagePrompt || !Array.isArray(d.hashtags))
		throw new Error("Incomplete draft from model");
	return { hook: d.hook ?? "", headline: d.headline, captionBn: d.captionBn, hashtags: d.hashtags, imagePrompt: d.imagePrompt };
}

export async function writeDraft(topic: string): Promise<Draft> {
	try {
		return parseDraft(await chat(SYSTEM, `Topic: ${topic}`));
	} catch {
		return parseDraft(await chat(SYSTEM, `Topic: ${topic}`)); // one retry on bad JSON
	}
}

export async function suggestTopic(recent: string[]): Promise<string> {
	return chat(
		"You suggest home decor post topics for a Bangladeshi audience. Reply with only the topic, in Bengali, one line.",
		`Suggest ONE new topic (small flats, budget-friendly, seasonal where relevant), clearly different from:\n${recent.join("\n") || "(none)"}`
	);
}

export async function generateImage(prompt: string): Promise<Buffer> {
	const r = await run(process.env.CF_IMAGE_MODEL!, { prompt: prompt.slice(0, 2000), steps: 6 });
	if (!r?.image) throw new Error("Cloudflare returned no image");
	return Buffer.from(r.image, "base64");
}