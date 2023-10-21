const dictionary = [
  // Singular bird names
  "buteo",
  "eyass",
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
let gameOver = false

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

function acceptGameInput() {
  return (document.getElementById("help-modal").hidden && document.getElementById("settings-modal").hidden && !window.gameOver)
}

function handleMouseClick(e) {
  if (e.target.matches("[data-key]") && acceptGameInput()) {
    pressKey(e.target.dataset.key)
  } else if (e.target.matches("[data-enter]") && acceptGameInput()) {
    submitGuess()
  } else if (e.target.matches("[data-delete]") && acceptGameInput()) {
    deleteKey()
  } else if (e.target.matches("#help-button")) {
    document.getElementById("help-modal").hidden = false
  } else if (e.target.matches("#settings-button")) {
    document.getElementById("settings-modal").hidden = false
  } else if (e.target.matches(".close-modal-button") || e.target.matches(".overlay")) {
    document.getElementById("help-modal").hidden = true
    document.getElementById("settings-modal").hidden = true
  } else if (e.target.matches("#dark-theme")) {
    const on = e.target.toggleAttribute("checked")
    document.querySelector("body").classList.toggle("nightmode", on)
    saveSettings()
  } else if (e.target.matches("#color-blind-theme")) {
    const on = e.target.toggleAttribute("checked")
    document.querySelector("body").classList.toggle("colorblind", on)
    saveSettings()
  } else if (e.target.matches("#share-button")) {
    if (navigator.clipboard.writeText) {
      navigator.clipboard.writeText(createUnicodeGameTranscript()).then(function() {
        showAlert("Copied to clipboard")
      }, function (err) {
        showAlert("Copying failed: " + e)
      })
    } else {
      showAlert("Copying failed: navigator.clipboard.writeText is not supported")
    }
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
  if (e.key === "Escape") {
    document.getElementById("help-modal").hidden = true
    document.getElementById("settings-modal").hidden = true
  } else if ((e.key === "Enter") && acceptGameInput()) {
    submitGuess()
  } else if ((e.key === "Backspace" || e.key === "Delete") && acceptGameInput()) {
    deleteKey()
  } else if (e.key.match(/^[a-z]$/) && acceptGameInput()) {
    pressKey(e.key)
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

function createUnicodeGameTranscript() {
  console.assert(window.gameOver)
  const usedRows = guessGrid.querySelectorAll("[data-letter]").length / WORD_LENGTH

  let transcript = ""
  let accumulator = []
  const greenSquare = document.querySelector("body").classList.contains("colorblind") ? "\u{1F7E7}" : "\u{1F7E9}"
  const yellowSquare = document.querySelector("body").classList.contains("colorblind") ? "\u{1F7E6}" : "\u{1F7E8}"
  const whiteSquare = document.querySelector("body").classList.contains("nightmode") ? "\u{2B1B}" : "\u{2B1C}"
  for (let e of guessGrid.querySelectorAll("[data-letter]")) {
    accumulator.push(e.dataset.state == "correct" ? greenSquare :
                     e.dataset.state == "present" ? yellowSquare : whiteSquare)
    if (accumulator.length === WORD_LENGTH) {
      transcript += "\n" + accumulator.join("")
      accumulator = []
    }
  }
  console.assert(accumulator.length === 0)

  if (transcript.endsWith(greenSquare+greenSquare+greenSquare+greenSquare+greenSquare)) {
    return "Birdle #" + (targetWords.indexOf(targetWord) + 1) + " " + usedRows + "/6\n" + transcript
  } else {
    return "Birdle #" + (targetWords.indexOf(targetWord) + 1) + " X/6\n" + transcript
  }
}

function checkWinLose(guess, tiles) {
  const usedRows = guessGrid.querySelectorAll("[data-letter]").length / WORD_LENGTH
  const remainingRows = guessGrid.querySelectorAll(":not([data-letter])").length / WORD_LENGTH

  if (guess === targetWord) {
    stopInteraction()
    const compliments = ["Genius", "Magnificent", "Impressive", "Splendid", "Great", "Phew"]
    showAlert(compliments[usedRows - 1], 5000)
    danceTiles(tiles)
  } else if (remainingRows === 0) {
    stopInteraction()
    showAlert(targetWord.toUpperCase(), null)
  } else {
    return
  }

  let e = document.querySelector("#share-button")
  e.classList.toggle("disabled-button", false)
  window.gameOver = true
  startInteraction()
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
