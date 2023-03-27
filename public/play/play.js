var currentRow = 1;
var currentIndex = 0;

document.querySelectorAll('.keyboard-button').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const letter = btn.innerText.toLowerCase();
        console.log(letter, "was pressed")
        document.querySelector(`#row${currentRow}`).getElementsByClassName("tile")[currentIndex].innerText = letter;

        if (currentIndex == 4) return; // change this later
        currentIndex++;
    })
})

console.log()