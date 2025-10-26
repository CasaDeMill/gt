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

    if (!element.includes('u/') && !element.includes('r/')){
      if (afters.length > 0)
        await handleFetch(`https://oauth.reddit.com/search.json?q=${element}&count=${count}&after=${afterString}&include_over_18=on`, returnArr, tokenResJson.access_token, element);
      else
        await handleFetch(`https://oauth.reddit.com/search.json?q=${element}&include_over_18=on`, returnArr, tokenResJson.access_token, element);
    }
    else {
      if (qNew) {
        await handleFetch(getUrl('qNew', element, afters, count, afterString), returnArr, tokenResJson.access_token, element);
      }
      if (qBest) {
        await handleFetch(getUrl('qBest', element, afters, count, afterString), returnArr, tokenResJson.access_token, element);
      }
      if (qTopMonth) {
        await handleFetch(getUrl('qTopMonth', element, afters, count, afterString), returnArr, tokenResJson.access_token, element);
      }
      if (qTopAll) {
        await handleFetch(getUrl('qTopAll', element, afters, count, afterString), returnArr, tokenResJson.access_token, element);
      }
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
  const simpleData = jsonResponse.data.children.filter((c: any) => c.kind === "t3").map((c: any) => {
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

const getUrl = (category: string, element: string, afters: any[], count: number, afterString: string) => {
  if (category === "qNew")
  {
    if (element.includes('r/')) {
      if (afters.length > 0)
        return `https://oauth.reddit.com/${element}/new.json?count=${count}&after=${afterString}`;
      else
        return `https://oauth.reddit.com/${element}/new.json`;
    }
    if (element.includes('u/')) {
      if (afters.length > 0)
        return `https://oauth.reddit.com/${element}.json?sort=new&count=${count}&after=${afterString}`;
      else
        return `https://oauth.reddit.com/${element}.json?sort=new`;
    }
  }
  if (category === "qBest")
  {
    if (element.includes('r/')) {
      if (afters.length > 0)
        return `https://oauth.reddit.com/${element}/best.json?count=${count}&after=${afterString}`;
      else
        return `https://oauth.reddit.com/${element}/best.json`;
    }
    if (element.includes('u/')) {
      if (afters.length > 0)
        return `https://oauth.reddit.com/${element}.json?sort=best&count=${count}&after=${afterString}`;
      else
        return `https://oauth.reddit.com/${element}.json?sort=best`;
    }
  }
  if (category === "qTopMonth")
  {
    if (element.includes('r/')) {
      if (afters.length > 0)
        return `https://oauth.reddit.com/${element}/top.json?count=${count}&after=${afterString}`;
      else
        return `https://oauth.reddit.com/${element}/top.json`;
    }
    if (element.includes('u/')) {
      if (afters.length > 0)
        return `https://oauth.reddit.com/${element}.json?sort=top&count=${count}&after=${afterString}`;
      else
        return `https://oauth.reddit.com/${element}.json?sort=top`;
    }
  }
  if (category === "qTopAll")
  {
    if (element.includes('r/')) {
      if (afters.length > 0)
        return `https://oauth.reddit.com/${element}/top.json?t=all&count=${count}&after=${afterString}`;
      else
        return `https://oauth.reddit.com/${element}/top.json&t=month`;
    }
    if (element.includes('u/')) {
      if (afters.length > 0)
        return `https://oauth.reddit.com/${element}.json?sort=top&t=all&count=${count}&after=${afterString}`;
      else
        return `https://oauth.reddit.com/${element}.json?sort=top&t=all`;
    }
  }

  return '';
}
