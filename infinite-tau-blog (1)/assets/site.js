"use strict";
const search = document.getElementById("search");
if (search) {
  const entries = Array.from(document.querySelectorAll("[data-entry]"));
  search.addEventListener("input", () => {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const entry of entries) {
      const show = (entry.dataset.search || "").toLocaleLowerCase().includes(query);
      entry.hidden = !show;
      if (show) count++;
    }
    document.getElementById("search-status").textContent = query ? `找到 ${count} 篇文章` : "";
  });
}
