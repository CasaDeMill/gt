import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({request}) => {
  const subReddits: string[] = await request.json();
  const returnArr: any[] = [];
  for (let index = 0; index < subReddits.length; index++) {
    const element = subReddits[index];
    const result = await fetch(`https://www.reddit.com/r/${element}/new.json`, { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:144.0) Gecko/20100101 Firefox/144.0' } });
    console.log("result:", result);
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

    const media = simpleData.filter((s: any) => s.urls.every((u: any) => !u.endsWith("/")));

    media.forEach((element: any) => {
      if (element.urls.length > 1) {
        element.urls.forEach((url: any) => {
          returnArr.push({
            id: element.id,
            src: url
          });
        });
      }
      else {
        returnArr.push({
          id: element.id,
          src: element.urls[0]
        });
      }
    });
  }
  console.log("ReturnArr:", returnArr);
  return json(returnArr);
};