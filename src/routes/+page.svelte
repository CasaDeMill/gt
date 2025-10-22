<script lang="ts">
  let imageData: any[] = $state([]);
  let selectedIndex: number = $state(0);
  let selectedSubs: string[] = $state([]);
  let avSubs = $state(['HalfLife']);
  let newSub = $state('');
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
			body: JSON.stringify(selectedSubs),
			headers: {
				'Content-Type': 'application/json'
			} });
    var responseArr = await response.json();
    loading = false;
    shuffle(responseArr);
    imageData = responseArr;
  }

  const incIndex = () => {
    if (selectedIndex < imageData.length - 1) {
      selectedIndex++;
    }
  }

  const decIndex = () => {
    if (selectedIndex >= 1) {
      selectedIndex--;
    }
  }

  const addNew = () => {
    avSubs.push(newSub);
    selectedSubs.push(newSub);
    newSub = "";
  }
</script>

<div class="wrapper">
  {#if imageData.length > 0}
    <div>
      {#if
        imageData[selectedIndex].src.endsWith("jpg")
        || imageData[selectedIndex].src.endsWith("png")
        || imageData[selectedIndex].src.endsWith("jpeg")
        || imageData[selectedIndex].src.endsWith("gif")
      }
        <!-- svelte-ignore a11y_missing_attribute -->
        <img class="image" src={imageData[selectedIndex].src}/>
      {:else if imageData[selectedIndex].src.includes("youtu.be")}
        <!-- svelte-ignore a11y_missing_attribute -->
        <iframe class="yotube" src={`https://www.youtube.com/embed/${imageData[selectedIndex].src.split('/').pop()}`}></iframe>
      {:else}
        <!-- svelte-ignore a11y_media_has_caption -->
        <video class="video" src={imageData[selectedIndex].src} autoplay controls></video>
      {/if}
      <div class="buttonContainer">
        <button onclick={decIndex}>Previous</button>
        <button onclick={incIndex}>Next</button>
      </div>
    </div>
  {:else}
    <div class="setupContainer">
      <h1>Okeeeeej</h1>
      <input bind:value={newSub}>
      <button onclick={addNew}>
        Add
      </button>
      {#each avSubs as sub}
        <label>
          <input
            type="checkbox"
            name="sub"
            value={sub}
            bind:group={selectedSubs}
          />

          {sub}
        </label>
      {/each}
      <button onclick={getData}>
        GO
      </button>
      {#if loading}
        <progress></progress>
      {/if}
    </div>
  {/if}
</div>


<style>
  .wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100dvh;
  }
  .buttonContainer {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
  }
  .setupContainer {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    height: 100dvh;
  }
  .youtube {
    width: 90dvw;
    border-radius: 5px;
  }
  .image {
    width: 90dvw;
    border-radius: 5px;
  }
  .video {
    width: 90dvw;
    border-radius: 5px;
  }
  button,
  button:focus {
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

  button:active {
    user-select: none;
    transform: translate(0, 0);
    border-bottom: 2px solid rgb(50, 50, 50);
  }

  h1 {
    font-family: "Kinkee";
  }

  p {
    width: 75%;
  }

  p,
  span,
  button,
  input,
  div {
    font-family: "Georgia";
    color: #330a47;
  }

  input[type="checkbox"] {
    accent-color: #8634af;
    width: 25px;
    height: 25px;
  }

  input {
    border-radius: 5px;
    font-size: 18px;
    width: 200px;
    margin-top: 10px;
  }

  progress {
    width: 100%;
    accent-color: #330a47;
  }
</style>