// Dynamische gallery carrousel op home (index.html)
fetch('/api/uploads/recent?limit=20')
  .then(r=>r.json())
  .then(imgs => {
    const track = document.getElementById('galleryPreviewCarousel');
    if (!imgs.length) {
      track.innerHTML = '<div style="color:#f5d300;font-size:1.1em;">Nog geen uploads beschikbaar.</div>';
      return;
    }
    track.innerHTML = imgs.map(img =>
      `<div class='preview-item' style='min-width:220px;max-width:260px;height:200px;overflow:hidden;border-radius:16px;box-shadow:0 2px 16px #0007;background:#181826;'>
        <img src="/uploads/${img.filename}" alt="${img.title||'Upload'}" style='width:100%;height:100%;object-fit:cover;'/>
      </div>`
    ).join('');
    setupCarousel(track, imgs.length);
  });

function setupCarousel(track, total) {
  let pos = 0;
  const visible = Math.max(1, Math.floor(track.offsetWidth/240));
  function update() {
    const offset = pos * 240;
    track.scrollTo({left: offset, behavior:'smooth'});
  }
  document.getElementById('carouselPrev').onclick = () => {
    pos = Math.max(0, pos-1);
    update();
  };
  document.getElementById('carouselNext').onclick = () => {
    pos = Math.min(total-visible, pos+1);
    update();
  };
  // Swipe ondersteuning
  let startX = null;
  track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; });
  track.addEventListener('touchmove', e => {
    if(startX!==null) {
      let dx = e.touches[0].clientX - startX;
      if(dx > 40) { document.getElementById('carouselPrev').click(); startX=null; }
      if(dx < -40) { document.getElementById('carouselNext').click(); startX=null; }
    }
  });
  // Responsief: reset positie bij resize
  window.addEventListener('resize', () => { pos=0; update(); });
  update();
}
