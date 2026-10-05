/** Publishes a photo post to the Page. Returns the Facebook post id ("<pageId>_<postId>"). */
import env from "dotenv";
env.config();
export async function publishPhoto(imageUrl: string, message: string): Promise<string> {
  const res = await fetch(
    `https://graph.facebook.com/${process.env.FB_API_VERSION}/${process.env.FB_PAGE_ID}/photos`,
    {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ url: imageUrl, message, access_token: process.env.FB_PAGE_TOKEN! }),
    }
  );
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json.error ?? json));
  return json.post_id ?? json.id;
}
