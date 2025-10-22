<script lang="ts">
	import { Splide, SplideSlide } from '@splidejs/svelte-splide';
  import '@splidejs/splide/dist/css/themes/splide-default.min.css';

  let imageData: any[] = $state([]);

const getData = async () => {
  const response = await fetch('/api/reddit', { method: 'GET' });

	imageData = await response.json();
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