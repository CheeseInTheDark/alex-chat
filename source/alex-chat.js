let ioHook = require("iohook")
let say = require("node-speak")
let fs = require("fs")
let wav = require("wav")
let Speaker = require("speaker")
let stream = require("stream")
let keycodeToChar = require("delightful-keycodes")
let playSound = require('justaudio')

let recording = false
let chat = ""

let acceptedCharacters = "abcdefghijklmnopqrstuvwxyz "

ioHook.on("keydown", event => {
    key = getCharacter(event)
    
    if (recording && acceptedCharacters.indexOf(key) !== -1) {
        chat += key
    }

    if (key === "`") {
        if (recording) {
            say(chat, {
                speed: 80,
                callback: data => {
                    console.log("Done converting")
                    let base64Sound = data.substring(24)
                    let soundBuffer = Buffer.from(base64Sound, "base64")
                    let soundStream = new stream.Readable()
                    soundStream._read = () => {}
                    soundStream.push(soundBuffer)
                    play(soundStream)
                }
            })
        }
        recording = !recording
        chat = ""
    }
    
})

function getCharacter(event) {
    return keycodeToChar(event.rawcode)
}

function doFile(data) {
    fs.writeFile("/home/jeff/sound.wav", data.substring(24), "base64", () => {
        fs.readFile("/home/jeff/sound.wav", (err, soundBuffer) => {
            let soundStream = new stream.Readable()
            soundStream._read = () => {}
            soundStream.push(soundBuffer)
            play(soundStream)
        })
    })
}

function play(soundStream) {
    let reader = new wav.Reader()
    reader.on("format", (format) => {
        reader.pipe(new Speaker(format))
    })
    soundStream.pipe(reader)
}

ioHook.start()