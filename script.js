  
  (function(){
    const canvas = document.getElementById('grid');
    const ctx = canvas.getContext('2d');
    let scale = 1, offset = { x: 0, y: 0 };
    const BASE_STEP = 27;

    function resize(){
      const dpr = devicePixelRatio || 1;
      const r = canvas.getBoundingClientRect();
      canvas.width  = Math.round(r.width  * dpr);
      canvas.height = Math.round(r.height * dpr);
      ctx.setTransform(dpr,0,0,dpr,0,0);
      draw();
    }
    new ResizeObserver(resize).observe(canvas);

    function computeGridStep(){
      const TARGET = 40;
      const s = BASE_STEP * scale;
      const pow = Math.round(Math.log2(TARGET / s));
      return BASE_STEP * Math.pow(2, pow);
    }

    function draw(){
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0,0,width,height);
      ctx.fillStyle = '#fff'; ctx.fillRect(0,0,width,height);

      const stepW = computeGridStep();
      const stepS = stepW * scale;
      const origin = { x: width/2 + offset.x, y: height/2 + offset.y };
      const startX = origin.x % stepS;
      const startY = origin.y % stepS;

      ctx.beginPath(); ctx.lineWidth = 1; ctx.strokeStyle = '#e6e6e6';
      for (let x = startX; x <= width; x += stepS) { ctx.moveTo(x,0); ctx.lineTo(x,height); }
      for (let y = startY; y <= height; y += stepS) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
      ctx.stroke();

      const majorEvery = 5, majorStep = stepS * majorEvery;
      ctx.beginPath(); ctx.lineWidth = 1; ctx.strokeStyle = '#cfcfcf';
      const startXMaj = origin.x % majorStep;
      const startYMaj = origin.y % majorStep;
      for (let x = startXMaj; x <= width; x += majorStep) { ctx.moveTo(x,0); ctx.lineTo(x,height); }
      for (let y = startYMaj; y <= height; y += majorStep) { ctx.moveTo(0,y); ctx.lineTo(width,y); }
      ctx.stroke();
    }

    canvas.addEventListener('wheel', (e)=>{
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const mouse = { x: e.clientX - r.left, y: e.clientY - r.top };
      const worldBefore = { x:(mouse.x - offset.x - r.width/2)/scale, y:(mouse.y - offset.y - r.height/2)/scale };
      const zoom = Math.exp(-e.deltaY * 0.0015);
      scale = Math.max(1e-12, Math.min(1e12, scale * zoom));
      const worldAfterScreen = { x: worldBefore.x*scale + r.width/2 + offset.x, y: worldBefore.y*scale + r.height/2 + offset.y };
      offset.x += mouse.x - worldAfterScreen.x;
      offset.y += mouse.y - worldAfterScreen.y;
      draw();
    }, { passive:false });

    let dragging=false, last={x:0,y:0};
    canvas.addEventListener('pointerdown', e=>{ dragging=true; last.x=e.clientX; last.y=e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener('pointermove', e=>{ if(!dragging) return; offset.x += e.clientX-last.x; offset.y += e.clientY-last.y; last.x=e.clientX; last.y=e.clientY; draw(); });
    canvas.addEventListener('pointerup', ()=>dragging=false);
    canvas.addEventListener('pointercancel', ()=>dragging=false);

    canvas.addEventListener('dblclick', ()=>{ offset.x=0; offset.y=0; draw(); });

    let pinch=null;
    canvas.addEventListener('pointerdown', e=>{ (pinch??=new Map()).set(e.pointerId,{x:e.clientX,y:e.clientY}); });
    canvas.addEventListener('pointermove', e=>{
      if(!pinch || pinch.size!==2) return;
      pinch.set(e.pointerId,{x:e.clientX,y:e.clientY});
      const pts=[...pinch.values()], d=(p,q)=>Math.hypot(p.x-q.x,p.y-q.y), [p0,p1]=pts;
      if(!canvas._prevDist) canvas._prevDist=d(p0,p1);
      const dist=d(p0,p1), zoom=dist/canvas._prevDist; canvas._prevDist=dist;
      const r=canvas.getBoundingClientRect(), center={x:r.width/2,y:r.height/2};
      const worldBefore={x:(center.x-offset.x-r.width/2)/scale,y:(center.y-offset.y-r.height/2)/scale};
      scale=Math.max(1e-12, Math.min(1e12, scale*zoom));
      const worldAfterScreen={x:worldBefore.x*scale+r.width/2+offset.x,y:worldBefore.y*scale+r.height/2+offset.y};
      offset.x += center.x - worldAfterScreen.x; offset.y += center.y - worldAfterScreen.y;
      draw();
    });
    canvas.addEventListener('pointerup', e=>{ if(pinch){ pinch.delete(e.pointerId); if(pinch.size<2) canvas._prevDist=null; } });
    canvas.addEventListener('pointercancel', ()=>{ if(pinch){ pinch.clear(); canvas._prevDist=null; } });

    resize();
  })();
  

  
    const bodyEl         = document.body;
    const aboutLink      = document.getElementById('nav-about');
    const closeAboutBtn  = document.getElementById('btn-close');
    const projectsLink   = document.getElementById('nav-projects');
    const closeProjBtn   = document.getElementById('btn-close-projects');
    const homeLink       = document.getElementById('nav-home');

    // About
    function openAbout(e){
  if(e) e.preventDefault();
  if (window.hideProjectDetails) hideProjectDetails();   // cierra project detail si hubiera
  bodyEl.classList.add('about-open');
  bodyEl.classList.remove('projects-open');
}
function closeAbout(e){ if(e) e.preventDefault(); bodyEl.classList.remove('about-open'); }

    aboutLink.addEventListener('click', openAbout);
    closeAboutBtn.addEventListener('click', closeAbout);

    // Projects
    function openProjects(e){
   if(e) e.preventDefault();
   if (window.hideProjectDetails) hideProjectDetails();   // cierra project detail si hubiera
   bodyEl.classList.add('projects-open');
   bodyEl.classList.remove('about-open');
    }
    function closeProjects(e){ if(e) e.preventDefault(); bodyEl.classList.remove('projects-open'); }

    projectsLink.addEventListener('click', openProjects);
    if (closeProjBtn) closeProjBtn.addEventListener('click', (e)=>{
  if (window.hideProjectDetails) hideProjectDetails();  // asegura que no quede un detail arriba
  closeProjects(e);
   });

    // Home toggle desde el nombre (izquierda)
  function toggleHome(e){
   e.preventDefault();
   if (window.hideProjectDetails) hideProjectDetails();   // cierra project detail si hubiera
   const isAbout = bodyEl.classList.contains('about-open');
   const isProj  = bodyEl.classList.contains('projects-open');
   if (isAbout || isProj){ bodyEl.classList.remove('about-open','projects-open'); }
   else { bodyEl.classList.add('about-open'); }
  }
    homeLink.addEventListener('click', toggleHome);
    homeLink.addEventListener('keydown', (e)=>{ if (e.key==='Enter' || e.key===' ') { e.preventDefault(); toggleHome(e); } });

    // Esc para cerrar overlays
    window.addEventListener('keydown', (e)=>{ if(e.key==='Escape'){ closeAbout(); closeProjects(); } });

    // Invertir colores clickeando el logo
    const homeLogo = document.querySelector('.home-logo');
    if(homeLogo){ homeLogo.addEventListener('click', ()=> bodyEl.classList.toggle('invert')); }
  

// Cursor ejes rojos -->
  
  (function(){
    const root = document.documentElement;
    function move(e){
      root.style.setProperty('--cursor-x', (e.clientX || 0) + 'px');
      root.style.setProperty('--cursor-y', (e.clientY || 0) + 'px');
    }
    window.addEventListener('mousemove', move, { passive: true });
    move({ clientX: innerWidth/2, clientY: innerHeight/2 });
  })();
  

// Hover preview Projects -->
  
    (function(){
    const preview   = document.getElementById('project-preview');
    const imgEl     = document.getElementById('preview-img');
    const titleEl   = document.getElementById('preview-title');
    const yearEl    = document.getElementById('preview-year');

    const leftRows  = document.querySelectorAll('.projects-row.project-item');  // izquierda (con año)
    const rightRows = document.querySelectorAll('.projects-row.asset-item');    // derecha (sin año)

    function showPreview(row, {showYear=true} = {}){
    const title = row.dataset.title || row.textContent.trim();
    const year  = row.dataset.year  || '';
    const src   = row.dataset.thumb || '';

    titleEl.textContent = title;
    yearEl.textContent  = year;
    yearEl.style.display = (showYear && year) ? '' : 'none';

    if (src) imgEl.src = src;
    preview.style.display = 'block';
    }

    function hidePreview(){
    preview.style.display = 'none';
    }

    // Izquierda: con año
    leftRows.forEach(row=>{
    row.addEventListener('mouseenter', ()=> showPreview(row, {showYear:true}));
    row.addEventListener('mouseleave', hidePreview);
    });

    // Derecha: sin año
    rightRows.forEach(row=>{
    row.addEventListener('mouseenter', ()=> showPreview(row, {showYear:false}));
    row.addEventListener('mouseleave', hidePreview);
    });

    // Por si salís del overlay entero
    const projectsOverlay = document.querySelector('.projects');
    if (projectsOverlay){
    projectsOverlay.addEventListener('mouseleave', hidePreview);
    }

    // Cerrar Projects con la X → ocultar preview también
    const closeBtn = document.getElementById('btn-close-projects');
    if (closeBtn){
    closeBtn.addEventListener('click', hidePreview);
    }
    })();



// ====== Open/Close Project Detail ======
(function(){
  const body = document.body;

  function openProject(id){
    // cerrar otros detalles
    document.querySelectorAll('.project-detail').forEach(sec => sec.style.display='none');
    // mostrar el pedido
    const sec = document.getElementById(id);
    if (sec){
      sec.style.display = 'block';
      // Auto-play videos (muted) del proyecto abierto
// Auto-play SOLO si NO es la pestaña de VIDEO
if (sec.id !== 'project-video') {
  sec.querySelectorAll('video').forEach(v=>{
    v.muted = true;
    v.loop = true;
    const tryPlay = () => v.play().catch(()=>{});
    if (v.readyState >= 2) tryPlay(); else v.addEventListener('loadeddata', tryPlay, { once:true });
  });
} else {
  // En #project-video forzamos pausa por si venía reproduciéndose
  sec.querySelectorAll('video').forEach(v=>{
    v.autoplay = false;
    v.removeAttribute('autoplay');
    try { v.pause(); } catch(e){}
  });
}

      body.classList.add('project-open');
      body.classList.remove('about-open');   // solo cerramos About
      body.classList.add('projects-open');   // dejamos Projects abierto
    }
  }

  function closeProjectDetail(){
    // ocultar todos los detalles
    document.querySelectorAll('.project-detail').forEach(sec => sec.style.display='none');
    // seguimos en Projects
    body.classList.remove('project-open');
    body.classList.add('projects-open');
    // Pausar y resetear todos los videos al cerrar detalle
document.querySelectorAll('.project-detail video').forEach(v=>{
  v.pause();
  v.currentTime = 0;
});
  }

  // Click en filas abre detalle
  document.querySelectorAll('.projects-row.project-item').forEach(row=>{
    row.addEventListener('click', ()=>{
      const id = row.dataset.id;
      if (id) openProject(id);
    });
  });

  // Click en filas DERECHA abre detalle (Video / Visualization / Research Lab)
document.querySelectorAll('.projects-row.asset-item').forEach(row=>{
  row.addEventListener('click', ()=>{
    const id = row.dataset.id;
    if (id) openProject(id);
  });
});

  // Botones X dentro de cada proyecto → volver a Projects
  document.querySelectorAll('.btn-close-project').forEach(btn=>{
    btn.addEventListener('click', (e)=>{
      e.preventDefault();
      e.stopPropagation();
      closeProjectDetail();
    });
  });

  // ESC también vuelve a Projects
  window.addEventListener('keydown', (e)=>{ 
    if (e.key === 'Escape') closeProjectDetail(); 
  });
    // --- Exponer helpers globales para que la topbar pueda cerrar detalles ---
  window.hideProjectDetails = function(){
    document.querySelectorAll('.project-detail').forEach(sec => sec.style.display='none');
    document.body.classList.remove('project-open');
  };
  window.closeProjectDetailToProjects = function(){
    document.querySelectorAll('.project-detail').forEach(sec => sec.style.display='none');
    document.body.classList.remove('project-open');
    document.body.classList.add('projects-open');
  };

})();



(function(){
  const mapHashToId = {
    'phoretic': 'project-phoretic',
    'states-of-tension': 'project-states-of-tension',
    '000': 'project-000',
    'flows-of-entropy': 'project-flows-of-entropy',
    'wetmesh-i': 'project-wetmesh-i',
    'wetmesh-ii': 'project-wetmesh-ii',
    'video': 'project-video',
    'visualization': 'project-visualization',
    'research-lab': 'project-research-lab'
  };

  function openFromHash(){
    const h = (location.hash || '').replace('#','').trim().toLowerCase();
    const id = mapHashToId[h];
    if (!id) return;
    // reutiliza tu openProject si está en scope global;
    // si no, hacemos un fallback:
    const sec = document.getElementById(id);
    if (sec){
      document.querySelectorAll('.project-detail').forEach(s => s.style.display='none');
      sec.style.display = 'block';
      document.body.classList.add('project-open','projects-open');
      document.body.classList.remove('about-open');
    }
if (sec.id !== 'project-video') {
  sec.querySelectorAll('video').forEach(v=>{
    v.muted = true;
    v.loop = true;
    v.play().catch(()=>{});
  });
} else {
  sec.querySelectorAll('video').forEach(v=>{
    v.autoplay = false;
    v.removeAttribute('autoplay');
    try { v.pause(); } catch(e){}
  });
}


  }

  // al cargar
  window.addEventListener('DOMContentLoaded', openFromHash);
  // al cambiar hash (p.ej. navegador atrás/adelante)
  window.addEventListener('hashchange', openFromHash);

  // cada vez que clickeás un item, actualizamos hash
  document.querySelectorAll('.projects-row.project-item, .projects-row.asset-item').forEach(row=>{
    row.addEventListener('click', ()=>{
      const id = row.dataset.id;
      if (!id) return;
      const hash = Object.entries(mapHashToId).find(([k,v]) => v === id)?.[0];
      if (hash) history.replaceState(null, '', '#'+hash);
    });
  });

  // cuando cerrás un proyecto, dejamos el hash en #projects
  document.querySelectorAll('.btn-close-project').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      history.replaceState(null, '', '#projects');
    });
  });
})();



/* Mobile: crea barra con SOLO materiales centrados y controla la clase del <body> */
(function(){
  function applyMaterialBars(){
    const isMobile = matchMedia('(max-width: 900px)').matches;
    let extractedSome = false;

    document.querySelectorAll('.project-detail').forEach(sec=>{
      const subbar = sec.querySelector('.project-subbar');
      if (!subbar) return;

      const matEl = subbar.querySelector('.project-materials');
      let mbar = sec.querySelector('.project-subbar-materials');

      if (isMobile){
        const text = (matEl?.textContent || '').trim();
        if (text){
          if (!mbar){
            mbar = document.createElement('div');
            mbar.className = 'project-subbar-materials';
            const span = document.createElement('span');
            span.className = 'materials-text';
            span.textContent = text;        // solo materiales, sin etiqueta
            mbar.appendChild(span);
            subbar.insertAdjacentElement('afterend', mbar);
          } else {
            const span = mbar.querySelector('.materials-text') || mbar.appendChild(document.createElement('span'));
            span.className = 'materials-text';
            span.textContent = text;
          }
          extractedSome = true;
        } else if (mbar){
          mbar.remove();
        }
      } else {
        if (mbar) mbar.remove();
      }
    });

    // Marcar/desmarcar el body: esto habilita el ocultado de la línea original
    document.body.classList.toggle('materials-extracted', extractedSome);
  }

  window.addEventListener('DOMContentLoaded', applyMaterialBars);
  window.addEventListener('resize', applyMaterialBars);
})();



/* Móvil: al tocar un proyecto, ocultar el preview automáticamente */
(function(){
  const preview = document.getElementById('project-preview');
  let timer = null;

function hidePreviewSoon(ms=800){
  if (!preview) return;
  clearTimeout(timer);
  timer = setTimeout(()=>{
    preview.classList.add('_fading');
    setTimeout(()=>{
      preview.style.display = 'none';
      preview.classList.remove('_fading');
    }, 250); // coincide con el transition
  }, ms);
}

  // Solo aplicar en dispositivos sin hover (teléfonos/tablets)
  const isTouch = () => matchMedia('(hover: none)').matches;

  // Al tocar cualquier fila de Projects (izq o der)
  document.querySelectorAll('.projects-row.project-item, .projects-row.asset-item')
    .forEach(row=>{
      row.addEventListener('click', ()=>{
        if (isTouch()) hidePreviewSoon(900);   // ~0.9s y se va
      });
    });

  // Si cambiaste el hash (abrir desde #phoretic, etc.)
  window.addEventListener('hashchange', ()=>{
    if (isTouch()) hidePreviewSoon(900);
  });

  // Tocar fuera del preview también lo oculta por si quedó colgado
  document.addEventListener('touchstart', (e)=>{
    if (!preview) return;
    if (!e.target.closest('#project-preview')) {
      preview.style.display = 'none';
      clearTimeout(timer);
    }
  }, {passive:true});
})();



/* Móvil: mostrar un preview efímero (~0.9s) al tocar un item, sin bloquear el tap */
(function(){
  const isTouch = () => matchMedia('(hover: none)').matches;
  const preview = document.getElementById('project-preview');
  const imgEl   = document.getElementById('preview-img');
  const titleEl = document.getElementById('preview-title');
  const yearEl  = document.getElementById('preview-year');
  let timer = null;

  // mini fade opcional (si no querés fade, eliminá las líneas con _fading y el CSS de abajo)
  function hidePreviewNow(){
    if (!preview) return;
    preview.classList.add('_fading');
    setTimeout(()=>{
      preview.style.display = 'none';
      preview.classList.remove('_fading');
    }, 220);
  }

  function showTransientPreview(row, ms=900){
    if (!preview || !isTouch()) return;

    // cargar contenido desde los data-attrs del item
    const title = row.dataset.title || row.textContent.trim();
    const year  = row.dataset.year  || '';
    const src   = row.dataset.thumb || '';

    titleEl.textContent = title;
    yearEl.textContent  = year;
    yearEl.style.display = year ? '' : 'none';
    if (src) imgEl.src = src;

    // mostrar y autohide
    clearTimeout(timer);
    preview.style.display = 'block';
    preview.classList.remove('_fading');
    timer = setTimeout(hidePreviewNow, ms);
  }

  // Escuchar taps/clicks en las filas (izq y der)
  document.querySelectorAll('.projects-row.project-item, .projects-row.asset-item')
    .forEach(row=>{
      row.addEventListener('touchstart', ()=> showTransientPreview(row), {passive:true});
      row.addEventListener('click',      ()=> showTransientPreview(row));
    });

  // Si cambia el hash al abrir por #anchor, escondé por si quedó
  window.addEventListener('hashchange', hidePreviewNow);

  // Tocar fuera del preview también lo cierra
  document.addEventListener('touchstart', (e)=>{
    if (!preview) return;
    if (!e.target.closest('#project-preview')) {
      clearTimeout(timer);
      hidePreviewNow();
    }
  }, {passive:true});
})();



/* Marca como 'lead-mobile' la figura que contiene Phoretic-1.jpg */
(function(){
  function markLeadPhoretic(){
    const sec = document.getElementById('project-phoretic');
    if (!sec) return;
    // buscar la <figure> que tenga un <img> con src que contenga 'Phoretic-1.jpg'
    const fig = sec.querySelector('.project-fig img[src*="Phoretic-1.jpg"]')?.closest('.project-fig');
    if (fig) fig.classList.add('lead-mobile');
  }
  window.addEventListener('DOMContentLoaded', markLeadPhoretic);
})();




(function(){
  function markLead000(){
    const sec = document.getElementById('project-000');
    if (!sec) return;
    const lead = sec.querySelector('.project-fig img[src*="000.jpg"]')?.closest('.project-fig');
    if (lead) lead.classList.add('lead-mobile');
  }
  window.addEventListener('DOMContentLoaded', markLead000);
})();



/* FoE móvil: marcar Flows-3 como 'lead' y Flows-2 como 'secondary' */
(function(){
  function tagFoE(){
    const sec = document.getElementById('project-flows-of-entropy');
    if (!sec) return;

    const leadFig = sec.querySelector('.project-fig img[src*="Flows-3.jpg"]')?.closest('.project-fig');
    if (leadFig) leadFig.classList.add('lead-mobile');

    const secondFig = sec.querySelector('.project-fig img[src*="Flows-2.jpg"]')?.closest('.project-fig');
    if (secondFig) secondFig.classList.add('secondary-mobile');
  }
  window.addEventListener('DOMContentLoaded', tagFoE);
})();



(function(){
  const isMobile = () => matchMedia('(max-width: 900px)').matches;

  // Flexibles: acepta ids que empiecen con "project-wetmesh" (wetmeshi, wetmesh-1, etc.)
  const sec = document.querySelector('[id^="project-wetmesh"]');
  if (!sec) return;

  // contenedor principal (usa .project-layout si existe; si no, la propia sección)
  const layout = sec.querySelector('.project-layout') || sec;

  // 1) localizar el VIDEO Wetmesh.mp4 y su contenedor "wrapper" (figure / .project-media / .project-fig / etc.)
  function findLeadVideoWrapper(){
    // puede ser <video src> o <source src> dentro de <video>
    const srcNodes = layout.querySelectorAll('video[src], video source[src]');
    let video = null;
    srcNodes.forEach(n=>{
      const s = n.getAttribute('src') || '';
      if (/wetmesh\.mp4/i.test(s)){
        video = n.tagName.toLowerCase()==='video' ? n : n.closest('video');
      }
    });
    if (!video) return null;
    return video.closest('figure, .project-media, .project-fig, .fig, .media') || video;
  }

  // 2) localizar el bloque de texto (probamos varias clases comunes)
  function findTextBlock(){
    return layout.querySelector('.project-text, .project-text-col, .text, .description, .desc, article, .copy');
  }

  // Reordenar respetando el orden original del resto
  function reorderForMobile(){
    if (!isMobile()) return;

    const lead = findLeadVideoWrapper();
    const text = findTextBlock();
    if (!lead || !text) return;

    // Tomamos todos los hijos elementales del layout (solo elementos, no textos)
    const children = Array.from(layout.children).filter(el => el.nodeType === 1);

    // Queremos: 1) lead, 2) text, 3) todos los demás en su orden original
    const rest = children.filter(el => el !== lead && el !== text);

    // Re-apendea en el orden deseado (mover un nodo existente no lo duplica, solo lo recoloca)
    layout.appendChild(lead);
    layout.appendChild(text);
    rest.forEach(el => layout.appendChild(el));
  }

  // Volver a poner todo en orden DOM original si se vuelve a desktop (opcional):
  // Guardamos índice original para poder restaurar
  const originalOrder = Array.from((layout.children));
  function restoreDesktop(){
    if (isMobile()) return;
    originalOrder.forEach(el => layout.appendChild(el));
  }

  // run
  document.addEventListener('DOMContentLoaded', ()=>{ reorderForMobile(); restoreDesktop(); });
  window.addEventListener('resize', ()=>{ reorderForMobile(); restoreDesktop(); });
})();



(function(){
  function markWetmeshIILead(){
    // soporta ids: project-wetmeshii o project-wetmesh-ii
    const sec = document.querySelector('[id^="project-wetmeshii"], [id^="project-wetmesh-ii"]');
    if (!sec) return;

    const layout = sec.querySelector('.project-layout') || sec;

    // Busca cualquier <img> cuyo src contenga "wetmeshi-4" (case-insensitive)
    const imgs = layout.querySelectorAll('img[src]');
    let leadFig = null;
    imgs.forEach(img=>{
      const s = img.getAttribute('src');
      if (/wetmeshi-4/i.test(s)) {
        const wrapper = img.closest('figure, .project-fig, .project-media') || img;
        if (!leadFig) leadFig = wrapper; // el primero que encuentre
      }
    });

    if (leadFig) leadFig.classList.add('lead-mobile');
  }

  window.addEventListener('DOMContentLoaded', markWetmeshIILead);
})();




window.addEventListener('DOMContentLoaded', ()=>{
  const wetmesh = document.querySelector('#project-video video[src*="Wetmesh"]');
  if (wetmesh){
    wetmesh.autoplay = false;
    wetmesh.removeAttribute('autoplay');
    try{ wetmesh.pause(); }catch(e){}
  }
});



/* VIDEO: usar botón de play propio y mostrar controles solo al reproducir */
(function(){
  const wrap = document.querySelector('#project-video .custom-play-wrap');
  if (!wrap) return;

  const video = wrap.querySelector('video');
  const btn   = wrap.querySelector('.custom-play');

  // Asegurar estado inicial
  video.removeAttribute('controls');
  video.autoplay = false;
  try{ video.pause(); }catch(e){}

  function startPlayback(){
    // mostrar controles a partir de ahora
    video.setAttribute('controls', '');
    wrap.classList.add('is-playing');

    // ocultar overlay
    if (btn) btn.style.display = 'none';

    // reproducir
    video.play().catch(()=>{ /* si el navegador bloquea, al menos quedan controles visibles */ });
  }

  // Click en el overlay
  if (btn){
    btn.addEventListener('click', startPlayback);
  }

  // Por accesibilidad: Enter/Espacio sobre el video también inicia
  video.addEventListener('click', (e)=>{
    if (!wrap.classList.contains('is-playing')) {
      e.preventDefault();
      startPlayback();
    }
  }, { once:false });

  // Si el usuario pausa, dejamos los controles (ya que los querías solo “antes de play” ocultos).
})();



/* VIDEO tab: overlay PLAY y controles solo al reproducir */
(function(){
  const scope = document.getElementById('project-video');
  if (!scope) return;

  const wraps = scope.querySelectorAll('.custom-play-wrap');
  wraps.forEach(wrap=>{
    const video = wrap.querySelector('video');
    const btn   = wrap.querySelector('.custom-play');
    if (!video) return;

    // Estado inicial: sin controles y en pausa
    video.removeAttribute('controls');
    video.autoplay = false;
    try{ video.pause(); }catch(e){}

    // Arrancar: mostrar controles y reproducir
    const start = ()=>{
      if (wrap.classList.contains('is-playing')) return;
      video.setAttribute('controls', '');
      wrap.classList.add('is-playing');
      if (btn) btn.style.display = 'none';
      video.play().catch(()=>{ /* si el navegador requiere interacción extra */ });
    };

    // Click en el botón
    if (btn) btn.addEventListener('click', start);

    // Redundancia útil: click en cualquier lugar del bloque arranca si aún no arrancó
    wrap.addEventListener('click', (e)=>{
      // si ya está jugando o el click fue en los controles nativos, no forzar
      if (wrap.classList.contains('is-playing')) return;
      // evitá que el click pase al video (que podría intentar play/pause y confundir)
      e.stopPropagation();
      start();
    });

    // Si el usuario pausa, dejamos los controles visibles (esperable).
  });
})();
