// shows the user how many characters they have remaining
/* https://stackoverflow.com/questions/14086398/count-textarea-characters */
const textarea = document.getElementById("textarea");
const charCount = document.getElementById("charcount");

textarea.addEventListener("input", (event) => {
    const target = event.currentTarget;
    const max = target.getAttribute("maxlength");
    charCount.innerHTML = max - target.value.length;
});