document.querySelectorAll("[data-flip]").forEach(card => {
    card.addEventListener("click", () => card.classList.toggle("flipped"));
});