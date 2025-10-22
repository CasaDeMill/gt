<script lang="ts">
  import { Tween } from "svelte/motion";
  import { cubicOut } from "svelte/easing";
  import { fade } from "svelte/transition";
  import { onMount } from "svelte";

  enum GoalType {
    Touches,
    Time,
    Surprise,
  }

  enum Task {
    Touch,
    Hold,
  }

  enum GameState {
    Setup,
    Run,
    End,
  }

  let click: HTMLAudioElement;
  let metronome1: HTMLAudioElement;
  let metronome2: HTMLAudioElement;
  let bell: HTMLAudioElement;
  let bad: HTMLAudioElement;

  onMount(() => {
    click = new Audio("/sounds/clicker.wav");
    metronome1 = new Audio("/sounds/metronome1.wav");
    metronome2 = new Audio("/sounds/metronome2.wav");
    bell = new Audio("/sounds/bell.wav");
    bad = new Audio("/sounds/bad.wav");
  });

  let goalType: GoalType = $state(GoalType.Touches);
  let minTime: number = $state(30);
  let maxTime: number = $state(120);
  let minTouch: number = $state(5);
  let maxTouch: number = $state(50);
  let holdChance: number = $state(25);
  let minHoldTime: number = $state(1);
  let maxHoldTime: number = $state(30);
  let punish: boolean = $state(false);
  let punishThreshhold: number = $state(5);
  let puppyGirl: boolean = $state(false);

  let touches: number = $state(0);
  let time: number = $state(0);
  let setTouches: number = $state(0);
  let setTime: number = $state(0);
  let setHoldTime: number = $state(0);
  let currentTask: Task = $state(Task.Touch);
  let gameState: GameState = $state(GameState.Setup);

  let currentHoldTime: number = $state(0);
  let tweenedHoldTime = new Tween(0, {
    duration: 200,
    easing: cubicOut,
  });
  let timerInterval: number = $state(0);
  let elapsedInterval: number = $state(0);
  let longestHold: number = $state(0);
  let punishCounter: number = $state(0);
  let lastTouch: number = $state(0);
  let punishing: boolean = $state(false);
  let setPunishTouch: number = $state(0);
  let setPunishTime: number = $state(0);
  let grace: number = $state(0);
  let ogGoal: number = $state(0);

  function getRndInteger(min: number, max: number) {
    const maxInc = max + 1;
    return Math.floor(Math.random() * (maxInc - min)) + min;
  }

  function startCounting() {
    grace = punishThreshhold;
    elapsedInterval = setInterval(function () {
      time++;
      punishing = false;
      grace++;
      if (
        time - lastTouch >= punishThreshhold &&
        grace >= punishThreshhold &&
        punish
      ) {
        bad.play();
        grace = 0;
        punishCounter++;
        punishing = true;
        if (goalType === GoalType.Touches) {
          const toAddTouch = getRndInteger(1, 5);
          setPunishTouch = toAddTouch;
          setTouches += toAddTouch;
        } else {
          const toAddTime = getRndInteger(1, 10);
          setPunishTime = toAddTime;
          setTime += toAddTime;
        }
      }

      if (time >= setTime && goalType === GoalType.Time) {
        bell.play();
        end();
      }
    }, 1000);
  }

  function end() {
    clearInterval(elapsedInterval);
    gameState = GameState.End;
  }

  function start() {
    if (goalType === GoalType.Surprise) {
      const randGoal = getRndInteger(0, 1);
      const randPunish = getRndInteger(0, 1);
      const randHoldChance = getRndInteger(5, 25);
      const randPunishThreshold = getRndInteger(5, 15);

      if (randPunish === 1) punish = true;

      punishThreshhold = randPunishThreshold;

      holdChance = randHoldChance;

      minTime = 30;
      maxTime = 240;
      minTouch = 5;
      maxTouch = 50;
      minHoldTime = 3;
      maxHoldTime = 20;
      goalType = randGoal;

      const randTouch = getRndInteger(5, 50);
      const randTime = getRndInteger(30, 240);

      setTouches = randTouch;
      setTime = randTime;

      ogGoal = randGoal === GoalType.Time ? randTime : randTouch;
      setHoldTime = getRndInteger(3, 20);
    } else {
      const randTouch = getRndInteger(minTouch, maxTouch);
      const randTime = getRndInteger(minTime, maxTime);

      setTouches = randTouch;
      setTime = randTime;

      ogGoal = goalType === GoalType.Time ? randTime : randTouch;
      setHoldTime = getRndInteger(minHoldTime, maxHoldTime);
    }

    getNextTask();
    startCounting();
    gameState = GameState.Run;
  }

  function getNextTask() {
    const holdRoll = Math.random();
    let cumRoll: number = 0;
    for (let index = 0; index < 2; index++) {
      cumRoll += index === 0 ? (100 - holdChance) / 100 : holdChance / 100;
      if (holdRoll < cumRoll) {
        if (index === 1) setHoldTime = getRndInteger(minHoldTime, maxHoldTime);

        currentTask = index === 0 ? Task.Touch : Task.Hold;
        break;
      }
    }
  }

  function increment() {
    touches++;

    lastTouch = time;
    getNextTask();
    if (touches >= setTouches && goalType === GoalType.Touches) {
      bell.play();
      end();
    } else {
      if (puppyGirl) click.play();
      else metronome2.play();
    }
  }

  function incrementHoldTime() {
    timerInterval = setInterval(function () {
      lastTouch = time;
      currentHoldTime++;
      if (currentHoldTime >= setHoldTime) {
        if (puppyGirl) click.play();
        else metronome2.play();
      } else {
        metronome1.play();
      }
      tweenedHoldTime.target = currentHoldTime;
    }, 1000);
  }

  function clearHoldTime() {
    clearInterval(timerInterval);

    if (currentHoldTime > longestHold) longestHold = currentHoldTime;

    if (currentHoldTime >= setHoldTime) {
      currentHoldTime = 0;
      tweenedHoldTime.target = 0;
      touches++;
      getNextTask();

      if (touches >= setTouches && goalType === GoalType.Touches) {
        bell.play();
        end();
      }
    } else {
      currentHoldTime = 0;
      tweenedHoldTime.target = 0;
    }
  }

  function restart() {
    goalType = GoalType.Touches;
    minTime = 30;
    maxTime = 120;
    minTouch = 5;
    maxTouch = 50;
    holdChance = 25;
    minHoldTime = 1;
    maxHoldTime = 30;
    punish = false;
    punishThreshhold = 5;
    setTouches = 0;
    setTime = 0;
    setHoldTime = 0;
    touches = 0;
    time = 0;
    longestHold = 0;
    punishCounter = 0;
    clearInterval(timerInterval);
    clearInterval(elapsedInterval);
    currentHoldTime = 0;
    lastTouch = 0;
    punishing = false;
    setPunishTouch = 0;
    setPunishTime = 0;
    puppyGirl = false;
    grace = 0;
    ogGoal = 0;
    tweenedHoldTime.target = 0;
    gameState = GameState.Setup;
  }
</script>

{#if gameState === GameState.Setup}
  <form id="setupForm" onsubmit={start} action="#" method="POST">
    <div class="formContainer">
      <h1>Deep trainer</h1>
      <div class="radios">
        <label>
          <input
            id="goalTouches"
            type="radio"
            name="goalType"
            value={GoalType.Touches}
            bind:group={goalType}
          />
          Touches
        </label>
        <label>
          <input
            id="goalTime"
            type="radio"
            name="goalType"
            value={GoalType.Time}
            bind:group={goalType}
          />
          Time
        </label>
        <label>
          <input
            id="goalSurprise"
            type="radio"
            name="goalType"
            value={GoalType.Surprise}
            bind:group={goalType}
          />
          Surprise me!
        </label>
      </div>

      <div class="settings">
        <div>
          {#if goalType === GoalType.Touches}
            <div in:fade>
              <label>
                <input
                  required
                  id="minTouch"
                  type="number"
                  name="minTouch"
                  min="1"
                  bind:value={minTouch}
                />
                Minimum touches
              </label>
              <br />
              <label>
                <input
                  required
                  id="maxTouch"
                  type="number"
                  name="maxTouch"
                  min="1"
                  bind:value={maxTouch}
                />
                Maximum touches
              </label>
              <br />
            </div>
          {:else if goalType === GoalType.Time}
            <div in:fade>
              <label>
                <input
                  required
                  id="minTime"
                  type="number"
                  name="minTime"
                  min="1"
                  bind:value={minTime}
                />
                Minimum time (seconds)
              </label>
              <br />
              <label>
                <input
                  required
                  id="maxTime"
                  type="number"
                  name="maxTime"
                  min="1"
                  bind:value={maxTime}
                />
                Maximum time (seconds)
              </label>
              <br />
            </div>
          {:else}
            <div in:fade>
              <br />
              <span>All goal settings will be randomised 😈</span>
            </div>
          {/if}
        </div>

        {#if goalType !== GoalType.Surprise}
          <div in:fade>
            <label>
              <input
                required
                id="holdChance"
                type="number"
                name="holdChance"
                min="0"
                max="100"
                bind:value={holdChance}
              />
              Hold chance (%)
            </label>
            <br />
            <label>
              <input
                required
                id="minHoldTime"
                type="number"
                name="minHoldTime"
                min="1"
                bind:value={minHoldTime}
              />
              Minimum hold time (seconds)
            </label>
            <br />
            <label>
              <input
                required
                id="maxHoldTime"
                type="number"
                name="maxHoldTime"
                min="1"
                bind:value={maxHoldTime}
              />
              Maximum hold time (seconds)
            </label>
            <br />
          </div>

          <div in:fade>
            <label>
              <input id="punish" type="checkbox" bind:checked={punish} />
              Punish me when I fail
            </label>
            <br />
            <label>
              <input
                required
                id="punishThreshhold"
                type="number"
                name="punishThreshhold"
                min="1"
                bind:value={punishThreshhold}
              />
              Punish threshold (seconds)
            </label>
            <br />
          </div>
        {/if}
        <div>
          <label>
            <input id="puppyGirl" type="checkbox" bind:checked={puppyGirl} />
            Puppy girl 🐕‍🦺
          </label>
        </div>
      </div>
    </div>
    <div class="inputButtonContainer">
      <input class="inputButton" id="submit" type="submit" value="START" />
    </div>
  </form>
{:else if gameState === GameState.Run}
  <div>
    <div class="actionContent">
      {#if punishing}
        <h2>HURRY <span class="slut">BITCH</span>!</h2>
        <h2>
          Punished with {goalType === GoalType.Touches
            ? `${setPunishTouch} ${setPunishTouch > 1 ? "touches" : "touch"}!`
            : `${setPunishTime} ${setPunishTime > 1 ? "seconds" : "second"}!`}
        </h2>
      {:else}
        <h2>Touches: {touches}</h2>
        <h2>Elapsed time: {time} {time > 1 ? "seconds" : "second"}</h2>
      {/if}
      {#if currentTask === Task.Hold}
        <progress max={setHoldTime} value={tweenedHoldTime.current}></progress>
      {/if}
    </div>
    {#if currentTask === Task.Touch}
      <button class="toucher" onclick={increment}>TOUCH</button>
    {:else}
      <button
        class="toucherHold"
        ontouchstart={incrementHoldTime}
        ontouchend={clearHoldTime}
        ontouchcancel={clearHoldTime}
        onmousedown={incrementHoldTime}
        onmouseup={clearHoldTime}>HOLD</button
      >
    {/if}
  </div>
{:else}
  <div in:fade>
    <div class="congrats">
      <h1>Good girl!</h1>
      <p>
        Goal was {`${ogGoal} ${goalType === GoalType.Time ? (ogGoal > 1 ? "seconds" : "second") : ogGoal > 1 ? "touches" : "touch"}.`}
        <br />
        <br />
        You did {touches}
        {touches > 1 ? "touches" : "touch"}.
        <br />
        <br />
        You trained for {time}
        {time > 1 ? "seconds" : "second"}.
        <br />
        <br />
        Your longest hold was {longestHold}
        {longestHold > 1 ? "seconds" : "second"}.
        <br />
        <br />
        {#if punishCounter > 0}
          You were punished {punishCounter}
          {punishCounter > 1 ? "times" : "time"}. Do better!
          <br />
          <br />
        {/if}
        Screenshot and send to your owner.
      </p>
    </div>
    <div class="congratsButton">
      <button onclick={restart}>Go again</button>
    </div>
  </div>
{/if}

<style>
  .formContainer {
    flex-direction: column;
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 80dvh;
  }

  .settings {
    height: 60%;
  }

  .settings input {
    border-radius: 5px;
    font-size: 18px;
    width: 75px;
    margin-top: 10px;
  }

  .settings input[type="checkbox"] {
    accent-color: #8634af;
    width: 25px;
    height: 25px;
  }

  .radios {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  }

  .radios input[type="radio"] {
    accent-color: #8634af;
    width: 25px;
    height: 25px;
  }

  .congrats {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: space-around;
    height: 50dvh;
    margin-top: 10dvh;
    margin-bottom: 10dvh;
  }

  .congratsButton {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .inputButtonContainer {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .inputButton,
  .inputButton:focus {
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

  .inputButton:active {
    user-select: none;
    transform: translate(0, 0);
    border-bottom: 2px solid rgb(50, 50, 50);
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

  h1,
  .slut {
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

  .toucher {
    width: 100%;
    height: 80dvh;
  }

  progress {
    width: 100%;
    accent-color: #330a47;
  }

  .actionContent {
    height: 15dvh;
  }

  .toucherHold,
  .toucherHold:focus {
    user-select: none;
    width: 100%;
    height: 80dvh;
    font-size: 17px;
    padding: 10px 25px;
    border-radius: 0.7rem;
    background-image: linear-gradient(rgb(254, 202, 202), rgb(254, 129, 129));
    border: 2px solid rgb(50, 50, 50);
    border-bottom: 5px solid rgb(50, 50, 50);
    box-shadow: 0px 1px 6px 0px rgb(158, 129, 254);
    transform: translate(0, -3px);
    cursor: pointer;
    transition: 0.2s;
    transition-timing-function: linear;
  }

  .toucherHold,
  .toucherHold:active {
    user-select: none;
    transform: translate(0, 0);
    border-bottom: 2px solid rgb(50, 50, 50);
  }
</style>
