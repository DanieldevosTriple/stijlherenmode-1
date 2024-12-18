const selector = ".elixon-fits-in";
var watchList = Array.from(document.querySelectorAll(selector))
    .map((el) => el.parentNode);

const resize = function (watchEl) {
    watchEl.querySelectorAll(':scope > ' + selector)
        .forEach(function (el) {
            const parentWidth = el.parentNode.clientWidth;
            const elWidth = el.clientWidth;

            if (elWidth > 0) { // Zorg ervoor dat elWidth geldig is
                let scale = parentWidth / elWidth;

                el.style.setProperty("--efiScale", scale);
                el.style.setProperty("--efiHeightDiff", el.clientHeight * (scale - 1) + "px");
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
        console.warn("Parent element not found for a watched item");
    }
});