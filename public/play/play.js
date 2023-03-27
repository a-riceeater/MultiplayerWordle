var currentRow = 1;
var currentIndex = 0;

document.querySelectorAll('.keyboard-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const letter = btn.innerText.toLowerCase();

        if (letter == "enter") {

        } else if (letter == "del") {

        } else {
            document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[currentIndex].innerText = letter;

            if (currentIndex != 4) currentIndex++;
        }
    })
})

console.log()