<script lang="ts">
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
  import '@splidejs/splide/dist/css/themes/splide-default.min.css';

  let imageData: any[] = $state([]);

const getData = () => {
  fetch("https://www.reddit.com/r/HalfLife/new.json")
  .then((response) => response.json())
  .then((x) => {
    var simpleData = x.data.children.map((c: any) => ({
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
    }))
    var media = simpleData.filter((s: any) => s.urls.every((u: any) => !u.endsWith("/")))
    var simplifiedMedia = media.map((x: any) => ({ id: x.id, urls: x.urls.map((u: any) => `${u}`) }))
    console.log(simplifiedMedia)
    imageData = simplifiedMedia;
  })
}
</script>

<div class="wrapper">
  <button onclick={getData}>GO</button>
  <Splide options={{ perPage: 1, gap: "1rem" }}>
    {#each imageData as image}
        {#if image.urls.length > 1}
          <Splide options={{ perPage: 1, gap: "1rem" }}>
            {#each image.urls as url}
              <SplideSlide>
                {#if url.endsWith("jpg") || url.endsWith("png") || url.endsWith("jpeg")}
                  <img width={100} src={url}/>
                  {:else}
                  <video width={100} src={url}/>
                {/if}
              </SplideSlide>
            {/each}
          </Splide>
        {:else}
          <SplideSlide>
            {#if image.urls[0].endsWith("jpg") || image.urls[0].endsWith("png") | image.urls[0].endsWith("jpeg")}
              <img width={100} src={image.urls[0]}/>
            {:else}
              <video width={100} src={image.urls[0]}/>
            {/if}
          </SplideSlide>
        {/if}
    {/each}
  </Splide>
</div>

<style>
  .wrapper {
    max-width: 600px;
    margin: 0 auto;
  }
</style>