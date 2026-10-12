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
// 点击时散开苍月草色的花瓣
(() => {
  const motion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );
  const ns = "http://www.w3.org/2000/svg";
  let sequence = 0;

  function make(tag, attrs) {
    const el = document.createElementNS(ns, tag);
    for (const [key, value] of Object.entries(attrs)) {
      el.setAttribute(key, value);
    }
    return el;
  }

  document.addEventListener("click", (event) => {
    if (motion.matches || event.detail === 0) return;

    for (let i = 0; i < 15; i++) {
      const particle = document.createElement("span");
      particle.className = "moon-petal-flight";
      particle.setAttribute("aria-hidden", "true");

      const width = 10 + Math.random() * 11;
      const angle = (2 * Math.PI * i) / 15 + Math.random() * 0.4;
      const distance = 40 + Math.random() * 100;
      const duration = 1100 + Math.random() * 500;

      Object.assign(particle.style, {
        left: `${event.clientX}px`,
        top: `${event.clientY}px`,
        width: `${width}px`,
        height: `${width * 1.6}px`
      });

      particle.style.setProperty("--duration", `${duration}ms`);
      particle.style.setProperty(
        "--dx", `${Math.cos(angle) * distance}px`
      );
      particle.style.setProperty(
        "--dy", `${Math.sin(angle) * distance + 65}px`
      );
      particle.style.setProperty(
        "--start", `${Math.random() * 360}deg`
      );
      particle.style.setProperty(
        "--spin", `${Math.random() * 540 - 270}deg`
      );

      const svg = make("svg", {
        viewBox: "0 0 40 64",
        class: "moon-petal"
      });

      const defs = make("defs", {});
      const id = `moon-petal-blue-${sequence++}`;
      const gradient = make("linearGradient", {
        id,
        x1: "0%",
        y1: "100%",
        x2: "80%",
        y2: "0%"
      });

      for (const [offset, color] of [
        ["0%", "#dceeff"],
        ["45%", "#92bdf3"],
        ["100%", "#577ed1"]
      ]) {
        gradient.append(make("stop", {
          offset,
          "stop-color": color
        }));
      }

      defs.append(gradient);
      svg.append(defs);

      svg.append(make("path", {
        d: "M20 61 C12 48 1 32 5 17 C7 7 14 2 20 5 C26 2 33 7 35 17 C39 32 28 48 20 61Z",
        fill: `url(#${id})`
      }));

      svg.append(make("path", {
        d: "M20 56 C17 40 16 24 20 10",
        fill: "none",
        stroke: "#e7f3ff",
        "stroke-width": "1.2",
        opacity: "0.45"
      }));

      particle.append(svg);
      document.body.append(particle);

      setTimeout(() => particle.remove(), duration + 100);
    }
  });
})();
