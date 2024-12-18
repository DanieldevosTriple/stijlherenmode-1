const selector = ".elixon-fits-in";

// Maak een fallback element met de class col-12
const fallbackParent = document.createElement('div');
fallbackParent.classList.add('col-12');
document.body.appendChild(fallbackParent);

var watchList = Array.from(document.querySelectorAll(selector))
    .map((el) => el.parentNode || fallbackParent);

const resize = function (watchEl) {
    watchEl.querySelectorAll(':scope > ' + selector)
        .forEach(function (el) {
            const parentWidth = el.parentNode.clientWidth;
            const elWidth = el.clientWidth;

            if (elWidth > 0) {
                let scale = parentWidth / elWidth;
                el.style.setProperty("--efiScale", scale);
                el.style.setProperty("--efiHeightDiff", (el.clientHeight * (scale - 1)) + "px");
            } else {
                console.warn("Element width is 0, skipping resize", el);
            }
        });
};

const observer = new ResizeObserver(function (entries) {
    for (let entry of entries) {
        resize(entry.target);
    }
});

watchList.forEach(function (el) {
    if (el) {
        resize(el);
        observer.observe(el);
    } else {
        console.warn("Geen parent element gevonden voor een item, gebruik fallback parent (col-12)");
    }
});
