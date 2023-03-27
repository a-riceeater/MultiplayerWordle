var currentRow = 1;
var currentIndex = 0;

const socket = io();

const str = document.URL;
const n = str.lastIndexOf('/');
const room = str.substring(n + 1);

var csDots = ".";

const csDotsI = setInterval(() => {
    if (csDots.length == 3) csDots = "."
    else csDots += "."
    document.getElementById("cs-dots").innerText = csDots;
}, 500)

socket.emit("joinGame", { user: "guest", room: room })

socket.on("gameJoined", (data) => {
    setTimeout(() => data.started ? document.getElementById("cs-dots-title").innerText = "Game starting" : document.getElementById("cs-dots-title").innerText = "Waiting for players...", 500);
})

document.querySelectorAll('.keyboard-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const letter = btn.innerText.toLowerCase();

        if (letter == "enter") {

        } else if (letter == "del") {
            document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[currentIndex - 1].innerText = "";
            currentIndex === 0 ? currentIndex = 0 : currentIndex--;
        } else {
            document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[currentIndex].innerText = letter;

            if (currentIndex != 4) currentIndex++;
        }
    })
})