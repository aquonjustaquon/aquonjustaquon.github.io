(function () {
    const path = location.pathname.split("/").pop() || "index.html";
    const map = {
        "index.html": "about.html", // treat index as about
    };
    const active = map[path] || path;

    document.querySelectorAll('a[data-nav]').forEach(a => {
        const href = a.getAttribute("href");
        if (href === active) a.setAttribute("aria-current", "page");
    });
})();

(function () {
    const toggle = document.getElementById("navToggle");
    const dropdown = document.getElementById("navDropdown");

    if (!toggle || !dropdown) return;

    function closeMenu(){
        dropdown.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
    }

    toggle.addEventListener("click", () => {
        const open = dropdown.classList.toggle("open");
        toggle.setAttribute("aria-expanded", open ? "true" : "false");
    });

    // Close when clicking outside
    document.addEventListener("click", (e) => {
        if (!dropdown.contains(e.target) && !toggle.contains(e.target)) closeMenu();
    });

    // Close on Escape
    document.addEventListener("keydown", (e) => {
        if (e.key === "Escape") closeMenu();
    });

    // Close after clicking a link (mobile UX)
    dropdown.querySelectorAll("a").forEach(a => {
        a.addEventListener("click", closeMenu);
    });
})();