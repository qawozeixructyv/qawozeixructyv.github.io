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
const dialog = document.getElementById("lightbox");
if (dialog && typeof dialog.showModal === "function") {
  const items = Array.from(document.querySelectorAll("[data-gallery]"));
  let current = 0;
  function show(index) {
    current = (index + items.length) % items.length;
    const item = items[current];
    const image = document.getElementById("lightbox-image");
    image.src = item.dataset.src;
    image.alt = item.dataset.caption;
    document.getElementById("lightbox-caption").textContent = `${item.dataset.caption} · ${current+1} / ${items.length}`;
  }
  items.forEach((item,index) => item.addEventListener("click",() => {show(index);dialog.showModal();}));
  dialog.querySelector(".lightbox-close").addEventListener("click",()=>dialog.close());
  dialog.querySelector(".lightbox-prev").addEventListener("click",()=>show(current-1));
  dialog.querySelector(".lightbox-next").addEventListener("click",()=>show(current+1));
  dialog.addEventListener("keydown",e => {if(e.key==="ArrowLeft"){e.preventDefault();show(current-1);}if(e.key==="ArrowRight"){e.preventDefault();show(current+1);}});
  dialog.addEventListener("click",e=>{if(e.target===dialog){const rect=dialog.getBoundingClientRect();if(e.clientX<rect.left||e.clientX>rect.right||e.clientY<rect.top||e.clientY>rect.bottom)dialog.close();}});
} else if (dialog) {
  document.querySelectorAll("[data-gallery]").forEach(item=>item.addEventListener("click",()=>window.open(item.dataset.src,"_blank","noopener")));
}
