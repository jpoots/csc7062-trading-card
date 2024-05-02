// edits the like button on hover
let likeButton = document.getElementById("likebutton");
let likeValue;
let src;

likeButton.addEventListener("mouseover", () => {
    likeValue = likeButton.value;

    if (likeValue == 1) likeButton.src = "/images/liked.png";
    else likeButton.src = "/images/like.png";
});

likeButton.addEventListener("mouseout", () => {
    likeValue = likeButton.value;

    if (likeValue == 1) likeButton.src = "/images/like.png";
    else likeButton.src = "/images/liked.png"
});