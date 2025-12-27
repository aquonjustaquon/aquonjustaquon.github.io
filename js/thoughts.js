const feed = document.getElementById("feed");
const search = document.getElementById("search");
const tagFilter = document.getElementById("tagFilter");

let POSTS = [];

function escapeHTML(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatDate(iso) {
    const d = new Date(iso + "T00:00:00");
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function buildTagOptions() {
    // reset options but keep "all tags"
    tagFilter.innerHTML = `<option value="">all tags</option>`;

    const tags = new Set();
    POSTS.forEach(p => (p.tags || []).forEach(t => tags.add(t)));

    [...tags].sort().forEach(t => {
        const opt = document.createElement("option");
        opt.value = t;
        opt.textContent = `#${t}`;
        tagFilter.appendChild(opt);
    });
}

function render() {
    const q = (search.value || "").trim().toLowerCase();
    const tag = tagFilter.value;

    const filtered = POSTS.filter(p => {
        const matchesText =
            !q ||
            (p.text || "").toLowerCase().includes(q) ||
            (p.tags || []).some(t => t.toLowerCase().includes(q));

        const matchesTag = !tag || (p.tags || []).includes(tag);

        return matchesText && matchesTag;
    });

    feed.innerHTML = "";

    if (filtered.length === 0) {
        const empty = document.createElement("div");
        empty.className = "tweet";
        empty.innerHTML = `<p class="tweet-text">No thoughts match that. Try a different search or tag.</p>`;
        feed.appendChild(empty);
        return;
    }

    filtered.forEach(p => {
        const el = document.createElement("article");
        el.className = "tweet";

        const tags = (p.tags || [])
            .map(t => `<span class="tag">#${escapeHTML(t)}</span>`)
            .join("");

        el.innerHTML = `
      <div class="tweet-top">
        <div class="tweet-name">Aquon McDyess</div>
        <div class="tweet-date">${formatDate(p.date)}</div>
      </div>

      <p class="tweet-text">${escapeHTML(p.text)}</p>

      ${tags ? `<div class="tweet-tags">${tags}</div>` : ""}
    `;

        feed.appendChild(el);
    });

    updateLikesUI();
}

// simple local likes + copy
const likes = JSON.parse(localStorage.getItem("likes") || "{}");

function updateLikesUI() {
    Object.entries(likes).forEach(([id, count]) => {
        const node = document.getElementById(`like-${id}`);
        if (node) node.textContent = String(count);
    });
}

document.addEventListener("click", (e) => {
    const likeBtn = e.target.closest("[data-like]");
    if (likeBtn) {
        const id = likeBtn.getAttribute("data-like");
        likes[id] = (likes[id] || 0) + 1;
        localStorage.setItem("likes", JSON.stringify(likes));
        updateLikesUI();
    }

    const copyBtn = e.target.closest("[data-copy]");
    if (copyBtn) {
        const id = copyBtn.getAttribute("data-copy");
        const post = POSTS.find(p => p.id === id);
        if (!post) return;
        const text = `${post.text} — Aquon McDyess (${post.date})`;
        navigator.clipboard?.writeText(text);
    }
});

search.addEventListener("input", render);
tagFilter.addEventListener("change", render);

// Load JSON then boot
(async function init(){
    try {
        const res = await fetch("./data/thoughts/thoughts.json", { cache: "no-store" });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        POSTS = (data.thoughts || []).slice();

        // newest first
        POSTS.sort((a, b) => new Date(b.date) - new Date(a.date));

        buildTagOptions();
        render();
    } catch (err) {
        console.error("Failed to load thoughts.json:", err);
        feed.innerHTML = `
      <div class="tweet">
        <p class="tweet-text">
          Couldn't load <code>./data/thoughts/thoughts.json</code>.
          If you're testing locally, run a local server (Live Server / python http.server).
        </p>
      </div>
    `;
    }
})();