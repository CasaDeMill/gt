import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { env } from '$env/dynamic/private';

export const POST: RequestHandler = async ({request}) => {
  const requestObj = await request.json();
  const subReddits: string[] = requestObj.selected;
  const qNew: boolean = requestObj.qNew;
  const qBest: boolean = requestObj.qBest;
  const qTopMonth: boolean = requestObj.qTopMonth;
  const qTopAll: boolean = requestObj.qTopAll;
  const afters: any[] = requestObj.afters;
  const count: number = requestObj.count;
  const returnArr: any[] = [];

  const tokenRes = await fetch('https://www.reddit.com/api/v1/access_token',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': 'Basic ' + btoa(env.REDDIT_USERNAME + ":" + env.REDDIT_PASSWORD)
      },
      body: new URLSearchParams({
        'grant_type': 'client_credentials',
        'device_id': env.CLIENT_ID
      })
    }
  );

  const tokenResJson = await tokenRes.json();

  for (let index = 0; index < subReddits.length; index++) {
    const element = subReddits[index];
    const afterString = afters[afters.findLastIndex(x => x.subReddit === element)]?.after;
    if (qNew) {
      if (afters.length > 0)
        await handleFetch(`https://oauth.reddit.com/r/${element}/new.json?count=${count}&after=${afterString}`, returnArr, tokenResJson.access_token, element);
      else
        await handleFetch(`https://oauth.reddit.com/r/${element}/new.json`, returnArr, tokenResJson.access_token, element);
    }
    if (qBest) {
      if (afters.length > 0)
        await handleFetch(`https://oauth.reddit.com/r/${element}/best.json?count=${count}&after=${afterString}`, returnArr, tokenResJson.access_token, element);
      else
        await handleFetch(`https://oauth.reddit.com/r/${element}/best.json`, returnArr, tokenResJson.access_token, element);
    }
    if (qTopMonth) {
      if (afters.length > 0)
        await handleFetch(`https://oauth.reddit.com/r/${element}/top.json?t=month&count=${count}&after=${afterString}`, returnArr, tokenResJson.access_token, element);
      else
        await handleFetch(`https://oauth.reddit.com/r/${element}/top.json?t=month`, returnArr, tokenResJson.access_token, element);
    }
    if (qTopAll) {
      if (afters.length > 0)
        await handleFetch(`https://oauth.reddit.com/r/${element}/top.json?t=all&count=${count}&after=${afterString}`, returnArr, tokenResJson.access_token, element);
      else
        await handleFetch(`https://oauth.reddit.com/r/${element}/top.json?t=all`, returnArr, tokenResJson.access_token, element);
    }
  }
  return json(returnArr);
};

const handleFetch = async (url: string, returnArr: any[], accessToken: string, subReddit: string) => {
  const result = await fetch(url,
    {
      headers: {
        'Authorization': `bearer ${accessToken}`
      }
    }
  );

  const jsonResponse = await result.json();
  const simpleData = jsonResponse.data.children.map((c: any) => {
    const dataObj = c.data.crosspost_parent_list?.length > 0 && c.data.url?.toLowerCase().includes('gallery') ? c.data.crosspost_parent_list[0] : c.data;
    return {
      redditUrl: `https://reddit.com${c.data.permalink}`,
      subReddit: subReddit, 
      after: jsonResponse.data.after,
      title: c.data.title,
      id: c.data.id,
      gallery: dataObj.is_gallery,
      video: dataObj.is_video,
      spoiler: dataObj.spoiler,
      over18: dataObj.over_18,
      urls: dataObj.is_video
        ? [dataObj.secure_media.reddit_video.fallback_url]
        : dataObj.is_gallery
          ? Object.keys(dataObj.media_metadata).map(
              (m) =>
                `https://i.redd.it/${m}.${dataObj.media_metadata[m].m.split("/")[1]}`,
            )
          : dataObj.spoiler
            ? [dataObj.url]
            : [dataObj.url],
  }});

  const media = simpleData.filter((s: any) => s.urls.every((u: any) => !u.endsWith("/")));

  media.forEach((element: any) => {
    if (element.urls.length > 1) {
      element.urls.forEach((url: any) => {
        returnArr.push({
          id: element.id,
          src: url,
          title: element.title,
          redditUrl: element.redditUrl,
          after: element.after,
          subReddit: element.subReddit,
        });
      });
    }
    else {
      returnArr.push({
        id: element.id,
        src: element.urls[0],
        title: element.title,
        redditUrl: element.redditUrl,
        after: element.after,
        subReddit: element.subReddit,
      });
    }
  });
}
