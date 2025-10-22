import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  const result = await fetch("https://www.reddit.com/r/HalfLife/new.json");
  const jsonResponse = await result.json();
  const simpleData = jsonResponse.data.children.map((c: any) => ({
      id: c.data.id,
      gallery: c.data.is_gallery,
      video: c.data.is_video,
      spoiler: c.data.spoiler,
      over18: c.data.over_18,
      urls: c.data.is_video
        ? [c.data.secure_media.reddit_video.fallback_url]
        : c.data.is_gallery
          ? Object.keys(c.data.media_metadata).map(
              (m) =>
                `https://i.redd.it/${m}.${c.data.media_metadata[m].m.split("/")[1]}`,
            )
          : c.data.spoiler
            ? [c.data.url]
            : [c.data.url],
    }));

  return json(simpleData.filter((s: any) => s.urls.every((u: any) => !u.endsWith("/"))));
};