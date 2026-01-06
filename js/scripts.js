document.addEventListener("DOMContentLoaded", async () => {

  const gallery = document.querySelector("[data-gallery]");
  if(!gallery) return;

  const jsonPath = gallery.dataset.galleryJson;
  const scroller = document.getElementById("galleryScroller");
  const dotsWrap = document.getElementById("galleryDots");
  const prev = document.querySelector("[data-gprev]");
  const next = document.querySelector("[data-gnext]");

  let files = [];

  try{
    const res = await fetch(jsonPath, { cache: "no-store" });
    files = await res.json();
  }catch(e){
    console.error("Gallery JSON error", e);
    return;
  }

  files = files.filter(f => /\.(png|jpg|jpeg|webp|gif)$/i.test(f));

  scroller.innerHTML = "";
  dotsWrap.innerHTML = "";

  files.forEach((file, i) => {
    const fig = document.createElement("figure");
    fig.className = "gallery-item";

    const img = document.createElement("img");
    img.src = `assets/img/gallery/${file}`;
    img.loading = "lazy";

    fig.appendChild(img);
    scroller.appendChild(fig);

    const dot = document.createElement("span");
    dot.className = "gallery-dot" + (i === 0 ? " is-active" : "");
    dot.onclick = () => fig.scrollIntoView({ behavior:"smooth", inline:"center" });
    dotsWrap.appendChild(dot);
  });

  const items = [...scroller.children];

  function updateActive(){
    const center = scroller.scrollLeft + scroller.clientWidth / 2;
    let best = 0, dist = Infinity;

    items.forEach((it, i) => {
      const c = it.offsetLeft + it.offsetWidth / 2;
      const d = Math.abs(center - c);
      if(d < dist){ dist = d; best = i; }
    });

    dotsWrap.querySelectorAll(".gallery-dot").forEach((d,i)=>{
      d.classList.toggle("is-active", i === best);
    });
  }

  scroller.addEventListener("scroll", () => setTimeout(updateActive, 80));

  prev.onclick = () => items[0]?.scrollIntoView({behavior:"smooth"});
  next.onclick = () => items.at(-1)?.scrollIntoView({behavior:"smooth"});
});
