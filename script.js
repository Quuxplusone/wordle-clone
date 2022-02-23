const targetWords = [
  "snipe",
  "murre",
  "eider",
  "owlet",
  "vireo",
  "mynah",
  "finch",
  "heron",
  "eagle",
  "macaw",
  "goose",
  "crane",
  "swift",
  "booby",
  "raven",
  "grebe",
  "quail",
  "junco",
  "egret",
  "stork",
  "robin",
  "stilt",
]
const dictionary = [
  // Singular bird names
  "drake",
  "crake",
  "scaup",
  "hobby",
  "diver",
  "wader",
  "piper",
  "galah",
  "twite",
  "wonga",
  "hylia",
  "topaz",
  "comet",
  "carib",
  "sylph",
  "cagou",
  "pipit",
  "tesia",
  "babax",
  "monal",
  "stint",
  "sibia",
  "cutia",
  "ouzel",
  "kikau",
  "miner",
  "besra",
  "batis",
  "scops",
  "serin",
  "mango",
  "argus",
  "asity",
  "pitta",
  "vanga",
  "ifrit",
  "prion",
  "shama",
  "potoo",
  "harpy",
  "noddy",
  "fairy",
  "munia",
  "minla",
  "malia",
  "maleo",
  "kamao",
  "kioea",
  "akepa",
  "veery",
  "pewee",
  "brant",
  "brent",
  "squab",
  "capon",
  "poult",
  "biddy",
  "fryer",
  "jenny",

  // Plural names
  "geese",
  "ducks",
  "swans",
  "nenes",
  "doves",
  "hawks",
  "crows",
  "larks",
  "kites",
  "wrens",
  "ruffs",
  "rooks",
  "cocks",
  "terns",
  "gulls",
  "skuas",
  "ernes",
  "coots",
  "rails",
  "rheas",
  "kiwis",
  "dodos",
  "chats",
  "shags",
  "wekas",
  "soras",
  "kakas",
  "loras",
  "pihas",
  "mynas",
  "myzas",
  "rurus",
  "koels",
  "couas",
  "teals",
  "bazas",
  "incas",
  "mamos",
  "guans",
  "omaos",
  "huias",
  "ioras",
  "iiwis",
  "knots",
  "kagus",
  "smews",
  "keets",
  "loons",
  "jakes",
  "peeps",

  // Generic names
  "avian",
  "chick",
  "birds",
  "fowls",
  "ornis",
]

const WORD_LENGTH = 5
const FLIP_ANIMATION_DURATION = 500
const DANCE_ANIMATION_DURATION = 1000
const keyboard = document.querySelector("[data-keyboard]")
const alertContainer = document.querySelector("[data-alert-container]")
const guessGrid = document.querySelector("[data-guess-grid]")
const offsetFromDate = new Date(2022, 0, 1)
const msOffset = Date.now() - offsetFromDate
const dayOffset = msOffset / 1000 / 60 / 60 / 24
const queryParams = new URLSearchParams(window.location.search)
const targetWord = queryParams.has('random') ? targetWords[Math.floor(Math.random() * targetWords.length)]
                                             : targetWords[Math.floor(dayOffset) % targetWords.length]

restoreSettings()
startInteraction()

function startInteraction() {
  document.addEventListener("click", handleMouseClick)
  document.addEventListener("keydown", handleKeyPress)
}

function stopInteraction() {
  document.removeEventListener("click", handleMouseClick)
  document.removeEventListener("keydown", handleKeyPress)
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]")) {
    pressKey(e.target.dataset.key)
  } else if (e.target.matches("[data-enter]")) {
    submitGuess()
  } else if (e.target.matches("[data-delete]")) {
    deleteKey()
  } else if (e.target.matches("#help-button")) {
    document.getElementById("help-modal").hidden = false
  } else if (e.target.matches("#close-help-button")) {
    document.getElementById("help-modal").hidden = true
  } else if (e.target.matches("#settings-button")) {
    document.getElementById("settings-modal").hidden = false
  } else if (e.target.matches("#close-settings-button")) {
    document.getElementById("settings-modal").hidden = true
  } else if (e.target.matches("#dark-theme")) {
    const on = e.target.toggleAttribute("checked")
    document.querySelector("body").classList.toggle("nightmode", on)
    saveSettings()
  } else if (e.target.matches("#color-blind-theme")) {
    const on = e.target.toggleAttribute("checked")
    document.querySelector("body").classList.toggle("colorblind", on)
    saveSettings()
  }
}

function saveSettings() {
  localStorage.setItem("birdle-nightmode", document.querySelector("body").classList.contains("nightmode") ? '1' : '0')
  localStorage.setItem("birdle-colorblind", document.querySelector("body").classList.contains("colorblind") ? '1' : '0')
}

function restoreSettings() {
  const nightmode = parseInt(localStorage.getItem("birdle-nightmode") || '0')
  const colorblind = parseInt(localStorage.getItem("birdle-colorblind") || '0')

  document.querySelector("body").classList.toggle("nightmode", nightmode)
  document.querySelector("body").classList.toggle("colorblind", colorblind)

  document.querySelector("#dark-theme").toggleAttribute("checked", nightmode)
  document.querySelector("#color-blind-theme").toggleAttribute("checked", colorblind)
}

function handleKeyPress(e) {
  if (e.key === "Enter") {
    submitGuess()
    return
  }

  if (e.key === "Backspace" || e.key === "Delete") {
    deleteKey()
    return
  }

  if (e.key.match(/^[a-z]$/)) {
    pressKey(e.key)
    return
  }
}

function pressKey(key) {
  const activeTiles = getActiveTiles()
  if (activeTiles.length >= WORD_LENGTH) return
  const nextTile = guessGrid.querySelector(":not([data-letter])")
  nextTile.dataset.letter = key.toLowerCase()
  nextTile.textContent = key
  nextTile.dataset.state = "active"
}

function deleteKey() {
  const activeTiles = getActiveTiles()
  const lastTile = activeTiles[activeTiles.length - 1]
  if (lastTile == null) return
  lastTile.textContent = ""
  lastTile.dataset.state = "empty"
  delete lastTile.dataset.letter
}

function submitGuess() {
  const activeTiles = [...getActiveTiles()]
  if (activeTiles.length !== WORD_LENGTH) {
    showAlert("Not enough letters")
    shakeTiles(activeTiles)
    return
  }

  const guess = activeTiles.reduce((word, tile) => {
    return word + tile.dataset.letter
  }, "")

  if (!targetWords.includes(guess) && !dictionary.includes(guess)) {
    showAlert("Not in bird list")
    shakeTiles(activeTiles)
    return
  }

  stopInteraction()
  const colors = computeColors(targetWord, guess)
  activeTiles.forEach((tile, index, array) => flipTile(tile, index, array, guess, colors[index]))
}

function computeColors(targetWord, guess) {
  const colors = Array(WORD_LENGTH).fill("absent")
  const outOfPlace = {}
  for (let i = 0; i < WORD_LENGTH; ++i) {
    const letter = targetWord[i]
    if (guess[i] === letter) {
      colors[i] = "correct"
    } else {
      outOfPlace[letter] = (outOfPlace[letter] || 0) + 1
    }
  }
  for (let i = 0; i < WORD_LENGTH; ++i) {
    const letter = guess[i]
    if (targetWord[i] !== letter) {
      if (outOfPlace[letter]) {
        colors[i] = "present"
        outOfPlace[letter] -= 1
      }
    }
  }
  return colors
}

function flipTile(tile, index, array, guess, newColor) {
  const letter = tile.dataset.letter
  const key = keyboard.querySelector(`[data-key="${letter}"i]`)

  setTimeout(() => {
    tile.classList.add("flip")
  }, (index * FLIP_ANIMATION_DURATION) / 2)
  setTimeout(() => {
    key.classList.add(newColor)
  }, FLIP_ANIMATION_DURATION * 3)

  tile.addEventListener(
    "transitionend",
    () => {
      tile.classList.remove("flip")
      tile.dataset.state = newColor
      if (index === array.length - 1) {
        tile.addEventListener(
          "transitionend",
          () => {
            startInteraction()
            checkWinLose(guess, array)
          },
          { once: true }
        )
      }
    },
    { once: true }
  )
}

function getActiveTiles() {
  return guessGrid.querySelectorAll('[data-state="active"]')
}

function showAlert(message, duration = 1000) {
  const alert = document.createElement("div")
  alert.textContent = message
  alert.classList.add("alert")
  alertContainer.prepend(alert)
  if (duration == null) return

  setTimeout(() => {
    alert.classList.add("hide")
    alert.addEventListener("transitionend", () => {
      alert.remove()
    })
  }, duration)
}

function shakeTiles(tiles) {
  tiles.forEach(tile => {
    tile.classList.add("shake-horizontal")
    tile.addEventListener(
      "animationend",
      () => {
        tile.classList.remove("shake-horizontal")
      },
      { once: true }
    )
  })
}

function checkWinLose(guess, tiles) {
  const usedRows = guessGrid.querySelectorAll("[data-letter]").length / WORD_LENGTH
  const remainingRows = guessGrid.querySelectorAll(":not([data-letter])").length / WORD_LENGTH

  if (guess === targetWord) {
    const compliments = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"]
    showAlert(compliments[usedRows - 1], 5000)
    danceTiles(tiles)
    stopInteraction()
    return
  }

  if (remainingRows === 0) {
    showAlert(targetWord.toUpperCase(), null)
    stopInteraction()
  }
}

function danceTiles(tiles) {
  tiles.forEach((tile, index) => {
    setTimeout(() => {
      tile.classList.add("dance")
      tile.addEventListener(
        "animationend",
        () => {
          tile.classList.remove("dance")
        },
        { once: true }
      )
    }, (index * 100))
  })
}
