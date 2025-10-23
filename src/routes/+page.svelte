<script lang="ts">
  import MultiSelect from 'svelte-multiselect'

  let qNew: boolean = $state(true);
  let qBest: boolean = $state(false);
  let qTopMonth: boolean = $state(false);
  let qTopAll: boolean = $state(false);
  let imageData: any[] = $state([]);
  let selected: string[] = $state([]);
  let avSubs = $state([
    'throatpussy',
    'cumonclothes',
    'luckypierre',
    'Lillijunexx',
    'Rubbersissies',
    'Miso_paradise',
    'Slave_humiliation',
    'Trulybrokengirls',
    'Forceorgasm2',
    'Facefuck',
    'Cumsluts'
  ]);
  let loading = $state(false);

  const shuffle = (array: any[]) => {
    let currentIndex = array.length;

    while (currentIndex != 0) {

      let randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
  }

  const getData = async () => {
    loading = true;
    const response = await fetch('/api/reddit', { method: 'POST',
			body: JSON.stringify({selected, qNew, qBest, qTopMonth, qTopAll}),
			headers: {
				'Content-Type': 'application/json'
			} });
    var responseArr = await response.json();
    loading = false;
    shuffle(responseArr);
    imageData = responseArr;
  }
</script>

{#if imageData.length > 0}
  <div class="swiper">
    {#each imageData as image}
      {#if
        image.src.endsWith("jpg")
        || image.src.endsWith("png")
        || image.src.endsWith("jpeg")
        || image.src.endsWith("gif")
      }
        <div>
          <a href={image.redditUrl} target="_blank">
            <button class="linkButton">
              {image.title}
            </button>
          </a>
          <!-- svelte-ignore a11y_missing_attribute -->
          <img loading="lazy" class="image" src={image.src}/>
        </div>
      {:else if image.src.includes("redgifs.com")}
        <div>
          <a href={image.redditUrl} target="_blank">
            <button class="linkButton">
              {image.title}
            </button>
          </a>
          <!-- svelte-ignore a11y_missing_attribute -->
          <iframe loading="lazy" scrolling="no" class="iframer" src={`https://www.redgifs.com/ifr/${image.src.split('/').pop()}`}></iframe>
        </div>
      {:else if image.src.includes("youtu.be")}
        <div>
          <a href={image.redditUrl} target="_blank">
            <button class="linkButton">
              {image.title}
            </button>
          </a>
          <!-- svelte-ignore a11y_missing_attribute -->
          <iframe loading="lazy" scrolling="no" class="iframer" src={`https://www.youtube.com/embed/${image.src.split('/').pop()}`}></iframe>
        </div>
      {:else if image.src.includes("youtube.com")}
        <div>
          <a href={image.redditUrl} target="_blank">
            <button class="linkButton">
              {image.title}
            </button>
          </a>
          <!-- svelte-ignore a11y_missing_attribute -->
          <iframe loading="lazy" scrolling="no" class="iframer" src={`https://www.youtube.com/embed/${image.src.split('v=').pop()}`}></iframe>
        </div>
      {:else}
        <div>
          <a href={image.redditUrl} target="_blank">
            <button class="linkButton">
              {image.title}
            </button>
          </a>
          <!-- svelte-ignore a11y_media_has_caption -->
          <video class="video" src={image.src} controls muted={false}></video>
        </div>
      {/if}
    {/each}
  </div>
{:else}
  <div class="setupContainer">
    <h1>Okeeeeej</h1>
    <MultiSelect bind:selected options={avSubs} allowUserOptions='append' />
    <div class="settingsWrapper">
      <label>
        <input id="punish" type="checkbox" bind:checked={qNew} />
        New
      </label>
      <label>
        <input id="punish" type="checkbox" bind:checked={qBest} />
        Best
      </label>
      <label>
        <input id="punish" type="checkbox" bind:checked={qTopMonth} />
        Top this month
      </label>
      <label>
        <input id="punish" type="checkbox" bind:checked={qTopAll} />
        Top all time
      </label>
    </div>
    <button class="goButton" onclick={getData}>
      GO
    </button>
    {#if loading}
      <progress></progress>
    {/if}
  </div>
{/if}

<style>
  .settingsWrapper {
    display: flex;
    flex-direction: column;
    margin-top: 20dvh;
  }
  .setupContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-start;
    height: 100dvh;
  }
  .iframer {
    height: 90dvh;
    width: auto;
    border-radius: 5px;
  }
  .image {
    max-height:90dvh;
    max-width:90dvw;
    height:auto;
    width:auto;
    border-radius: 5px;
  }
  .video {
    max-height:90dvh;
    max-width:90dvw;
    height:auto;
    width:auto;
    border-radius: 5px;
  }

  .goButton {
    font-family: "Georgia";
    color: #330a47;
    margin-top: auto;
    margin-bottom: 100px;
    user-select: none;
    font-size: 17px;
    padding: 10px 25px;
    border-radius: 0.7rem;
    background-image: linear-gradient(rgb(214, 202, 254), rgb(158, 129, 254));
    border: 2px solid rgb(50, 50, 50);
    border-bottom: 5px solid rgb(50, 50, 50);
    box-shadow: 0px 1px 6px 0px rgb(158, 129, 254);
    transform: translate(0, -3px);
    cursor: pointer;
    transition: 0.2s;
    transition-timing-function: linear;
  }

  .goButton:active {
    user-select: none;
    transform: translate(0, 0);
    border-bottom: 2px solid rgb(50, 50, 50);
  }

  h1 {
    font-family: "Kinkee";
  }

  div {
    font-family: "Georgia";
    color: #330a47;
  }

  .linkButton {
    font-family: "Georgia";
    color: #330a47;
    user-select: none;
    width: 100%;
    font-size: 12px;
    padding: 10px 25px;
    border-radius: 0.7rem;
    background-image: linear-gradient(rgb(214, 202, 254), rgb(158, 129, 254));
    border: 2px solid rgb(50, 50, 50);
    border-bottom: 5px solid rgb(50, 50, 50);
    box-shadow: 0px 1px 6px 0px rgb(158, 129, 254);
    transform: translate(0, -3px);
    cursor: pointer;
    transition: 0.2s;
    transition-timing-function: linear;
  }

  .linkButton:active {
    user-select: none;
    transform: translate(0, 0);
    border-bottom: 2px solid rgb(50, 50, 50);
  }

  input[type="checkbox"] {
    accent-color: #8634af;
    width: 25px;
    height: 25px;
  }

  progress {
    margin-bottom: 100px;
    width: 100%;
    accent-color: #330a47;
  }

  .swiper {
		display: flex;
		overflow-y: scroll;
		scrollbar-width: none;
		overscroll-behavior-x: none;
    align-items: center;
    height: 100dvh;
		scroll-snap-type: x mandatory;
	}
	.swiper::-webkit-scrollbar {
		display: none;
	}
	.swiper > :global(*) {
    scroll-snap-stop: always;
		scroll-snap-align: center;
    margin-left: 5dvw;
    margin-right: 5dvw;
	}
</style>
