const button = document.getElementById("burger");
const navbarfull = document.getElementById("navfull");
let display;

button.addEventListener("click", () => {
    if (navbarfull.style.display === "flex") navbarfull.style.display = "none";
    else navbarfull.style.display = "flex";
});