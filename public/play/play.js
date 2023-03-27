var currentRow = 1;
var currentIndex = 0;

const socket = io();

const str = document.URL;
const n = str.lastIndexOf('/');
const room = str.substring(n + 1);

var csDots = ".";
var started = false;

const csDotsI = setInterval(() => {
    if (csDots.length == 3) csDots = "."
    else csDots += "."
    document.getElementById("cs-dots").innerText = csDots;
}, 500)

socket.emit("joinGame", { user: "guest", room: room })

socket.on("gameJoined", (data) => {
    setTimeout(() => {
        document.getElementById("pc-status").innerText = "Connected..."
        setTimeout(() => document.getElementById("pc-status").style.opacity = 0, 500)
    }, 500);
})

socket.on("startGame", (data) => {
    started = true;
    clearInterval(csDotsI)
    document.getElementById("cs-dots-title").innerText = "Game started!"
    document.getElementById("cs-dots").innerText = ""
    setTimeout(() => {
        document.getElementById("connectingScreen").style.display = "none"
    }, 1000)
})

socket.on("invalidWord", (data) => {
    var i = 0;

    const inter = setInterval(() => {
        console.log(i)
        const tile = document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[i]
        tile.classList.add("status-wrong");
        animateCSS(tile, "flipInX");

        if (i == 4) {
            clearInterval(inter);
            currentIndex = 0;
            currentRow++;
            return;
        }

        i++;
    }, 300)
})

socket.on("correctWord", (data) => {
    var i = 0;

    const inter = setInterval(() => {
        console.log(i)
        const tile = document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[i]
        tile.classList.add("status-correct");
        animateCSS(tile, "flipInX");

        if (i == 4) {
            clearInterval(inter);
            currentIndex = 0;
            currentRow = 1;
            return;
        }

        i++;
    }, 300)
})

socket.on("wordNotExist", (data) => {
    const pcs = document.getElementById("pc-status");
    pcs.innerText = "Word not in word list!"
    pcs.style.opacity = 1;
    setTimeout(() => pcs.style.opacity = 0, 1000)
})

socket.on("wordStatus", (data) => {
    console.log(data.result)

    var i = 0;

    const inter = setInterval(() => {
        const tile = document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[i]
        const status = data.result[i]

        if (status == "0") tile.classList.add("status-wrong");
        else if (status == "1") tile.classList.add("status-wrongSpot");
        if (status == "2") tile.classList.add("status-correct");

        animateCSS(tile, "flipInX");

        if (i == 4) {
            clearInterval(inter);
            currentIndex = 0;
            currentRow++;
            return;
        }

        i++;
    }, 300)
})

document.querySelectorAll('.keyboard-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const letter = btn.innerText.toLowerCase();

        if (letter == "enter") {
            let word = '';
            const words = document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")

            for (let i = 0; i < words.length; i++) {
                word += words[i].innerText;
            }
            console.log(word);
            if (!word) return
            if (word.length != 5) return;
            socket.emit("verifyWord", { user: "guest", word: word })

        } else if (letter == "del") {
            document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[currentIndex].innerText = "";

            currentIndex === 0 ? currentIndex = 0 : currentIndex--;
        } else {
            document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[currentIndex].innerText = letter;

            if (currentIndex != 4) currentIndex++;
        }
    })
})

document.addEventListener("keydown", (e) => {
    if (e.key == "Backspace") {
        e.preventDefault();

        // i tried using currentIndex - 1 (and checking if four and stuff) but it wouldn't work right, so I had to do this 🤷‍♂️
        if (currentIndex == 4) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[4].innerText = "";
        else if (currentIndex == 3) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[3].innerText = "";
        else if (currentIndex == 2) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[2].innerText = "";
        else if (currentIndex == 1) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[1].innerText = "";
        else if (currentIndex == 0) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[0].innerText = "";

        currentIndex === 0 ? currentIndex = 0 : currentIndex--;
        return;
    }

    if (e.key == "Enter") {
        e.preventDefault();
        let word = '';
        const words = document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")

        for (let i = 0; i < words.length; i++) {
            word += words[i].innerText;
        }
        console.log(word);
        if (!word) return
        if (word.length != 5) return;
        socket.emit("verifyWord", { user: "guest", word: word })
        return;
    }

    if (e.key == " " || e.key == "Space" || e.key == "Backspace" || e.altKey) return;

    if (e.shiftKey || e.key == "Escape" || e.key == "Esc" || e.ctrlKey || e.key.includes("arrow")) return;

    if (e.key.length > 1) return;

    e.preventDefault();

    document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[currentIndex].innerText = e.key;


    if (currentIndex == 4) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[4].animateCSS("bounceIn");
    else if (currentIndex == 3) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[3].animateCSS("bounceIn");
    else if (currentIndex == 2) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[2].animateCSS("bounceIn");
    else if (currentIndex == 1) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[1].animateCSS("bounceIn");
    else if (currentIndex == 0) document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[0].animateCSS("bounceIn");
    // animateCSS(document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[currentIndex - 1], "bounceIn")
    
    if (currentIndex != 4) currentIndex++;
})

const animateCSS = (element, animation, prefix = "animate__") =>
    new Promise((resolve, reject) => {
        const animationName = `${prefix}${animation}`;
        const node = element;

        node.classList.add(`${prefix}animated`, animationName);
        console.log(animationName)

        function handleAnimationEnd(event) {
            event.stopPropagation();
            node.classList.remove(`${prefix}animated`, animationName);
            resolve("Animation ended");
        }

        node.addEventListener("animationend", handleAnimationEnd, { once: true });
    });

Object.prototype.animateCSS = function (animation, prefix = "animate__") {
    return animateCSS(this, animation);
}