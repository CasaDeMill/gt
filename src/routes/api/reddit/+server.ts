import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({request}) => {
  const subReddits: string[] = await request.json();
  const returnArr: any[] = [];

  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(import.meta.env.VITE_USERNAME + ":" + import.meta.env.VITE_PASSWORD)
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'device_id': import.meta.env.VITE_CLIENT
      })
    }
  );

  const tokenResJson = await tokenRes.json();

  for (let index = 0; index < subReddits.length; index++) {
    const element = subReddits[index];
    const result = await fetch(`https://oauth.reddit.com/r/${element}/new.json`,
      {
        headers: {
          'Authorization': `bearer ${tokenResJson.access_token}`
        }
      }
    );

    const jsonResponse = await result.json();
    const simpleData = jsonResponse.data.children.map((c: any) => ({
        redditUrl: c.data.url,
        title: c.data.title,
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
            src: url,
            title: element.title,
            redditUrl: element.redditUrl
          });
        });
      }
      else {
        returnArr.push({
          id: element.id,
          src: element.urls[0],
          title: element.title,
          redditUrl: element.redditUrl
        });
      }
    });
  }
  return json(returnArr);
};