/* SECTION: state */
(function(){
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var nav = document.getElementById('nav');
  var toTop = document.getElementById('toTop');

  /* SECTION: scroll-chrome */
  function onScroll(){
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if(y > 24){ nav.classList.add('solid'); } else { nav.classList.remove('solid'); }
    if(y > 520){ toTop.classList.add('show'); } else { toTop.classList.remove('show'); }
  }
  window.addEventListener('scroll', onScroll, {passive:true});
  onScroll();
  toTop.addEventListener('click', function(){
    window.scrollTo({top:0, behavior: reduce ? 'auto' : 'smooth'});
  });

  /* SECTION: reveal */
  var revealItems = [].slice.call(document.querySelectorAll('[data-reveal]'));
  if(reduce || !('IntersectionObserver' in window)){
    revealItems.forEach(function(el){ el.classList.add('in'); });
  } else {
    var rio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(en.isIntersecting){ en.target.classList.add('in'); rio.unobserve(en.target); }
      });
    }, {rootMargin:'0px 0px -8% 0px', threshold:0.12});
    revealItems.forEach(function(el){ rio.observe(el); });
  }

  /* SECTION: nav-active */
  var links = [].slice.call(document.querySelectorAll('#navLinks a'));
  var secs = links.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  if('IntersectionObserver' in window){
    var nio = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        if(!en.isIntersecting) return;
        var i = secs.indexOf(en.target);
        links.forEach(function(a, j){ a.classList.toggle('active', j === i); });
      });
    }, {rootMargin:'-45% 0px -50% 0px', threshold:0});
    secs.forEach(function(s){ if(s) nio.observe(s); });
  }

  /* SECTION: typewriter */
  var typed = document.getElementById('typed');
  var caret = document.getElementById('caret');
  var phrases = ['让 AI 写代码','把灵感变成页面','先描述，再生成','再调氛围'];
  if(reduce){
    typed.textContent = phrases[0];
    caret.style.display = 'none';
  } else {
    var pi = 0, ci = 0, del = false;
    (function tick(){
      var full = phrases[pi];
      if(!del){
        ci++;
        typed.textContent = full.slice(0, ci);
        if(ci === full.length){ del = true; return setTimeout(tick, 1500); }
        return setTimeout(tick, 130 + Math.random()*90);
      }
      ci--;
      typed.textContent = full.slice(0, ci);
      if(ci === 0){ del = false; pi = (pi + 1) % phrases.length; return setTimeout(tick, 320); }
      return setTimeout(tick, 52);
    })();
  }

  /* SECTION: card-glow */
  var cards = [].slice.call(document.querySelectorAll('.card'));
  cards.forEach(function(card){
    card.addEventListener('pointermove', function(e){
      var r = card.getBoundingClientRect();
      card.style.setProperty('--gx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
      card.style.setProperty('--gy', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
    });
    card.addEventListener('pointerleave', function(){
      card.style.setProperty('--gx', '50%');
      card.style.setProperty('--gy', '0%');
    });
  });

  /* SECTION: drawer */
  var scrim = document.getElementById('scrim');
  var drawer = document.getElementById('drawer');
  var dRole = document.getElementById('dRole');
  var dTitle = document.getElementById('dTitle');
  var dEn = document.getElementById('dEn');
  var dBody = document.getElementById('dBody');
  var dKeys = document.getElementById('dKeys');
  var dFix = document.getElementById('dFix');
  var lastFocus = null;

  function openDrawer(card){
    var d = card.querySelector('.card-detail');
    if(!d) return;
    dRole.textContent = d.dataset.role || '';
    dTitle.textContent = d.dataset.name || '';
    dEn.textContent = d.dataset.en || '';
    var link = document.getElementById('dLink');
    if(d.dataset.url){ link.href = d.dataset.url; link.textContent = d.dataset.url.replace(/^https?:\//,''); link.style.display = ''; }
    else { link.style.display = 'none'; }
    dBody.textContent = d.dataset.body || '';
    dFix.textContent = d.dataset.fix || '';
    dKeys.textContent = '';
    (d.dataset.keys || '').split('|').forEach(function(k){
      if(!k) return;
      var li = document.createElement('li');
      var mk = document.createElement('span');
      mk.className = 'mark';
      mk.textContent = '✓';
      var tx = document.createElement('div');
      tx.textContent = k;
      li.appendChild(mk); li.appendChild(tx);
      dKeys.appendChild(li);
    });
    lastFocus = document.activeElement;
    scrim.classList.add('open');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    document.getElementById('dClose').focus();
  }
  function closeDrawer(){
    scrim.classList.remove('open');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }
  cards.forEach(function(card){
    card.addEventListener('click', function(e){
      if(e.target.closest && e.target.closest('a')) return;
      openDrawer(card);
    });
    card.addEventListener('keydown', function(e){
      if(e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar'){
        e.preventDefault();
        openDrawer(card);
      }
    });
  });
  document.getElementById('dClose').addEventListener('click', closeDrawer);
  scrim.addEventListener('click', closeDrawer);
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && drawer.classList.contains('open')) closeDrawer();
  });

  /* SECTION: composer */
  var gStyle = document.getElementById('gStyle');
  var gModule = document.getElementById('gModule');
  var gMotion = document.getElementById('gMotion');
  var out = document.getElementById('out');
  var countEl = document.getElementById('count');
  var copyBtn = document.getElementById('copyBtn');
  var resetBtn = document.getElementById('resetBtn');
  var DEFAULT_ON = ['glassmorphism','dark mode','gradient','Hero 首屏','滚动渐显','鼠标跟随光晕'];

  function picked(box){
    return [].slice.call(box.querySelectorAll('.opt[aria-pressed="true"]')).map(function(b){ return b.textContent; });
  }
  function build(){
    var s = picked(gStyle), m = picked(gModule), mo = picked(gMotion);
    var parts = [];
    parts.push('【目标】做一个 ' + (m.length ? m.join(' + ') : '整页落地页') + '。');
    parts.push('【风格】' + (s.length ? s.join(' / ') : 'clean, modern') + '；深色底，紫 → 粉 → 青渐变高亮，玻璃拟态卡片 + 1px 半透边框。');
    parts.push('【动效】' + (mo.length ? mo.join('、') : '保持静态') + '；节奏克制，移动端注意性能。');
    parts.push('【组件】优先复用 Uiverse / Aceternity UI / React Bits 的现成组件，不要手写样板代码。');
    parts.push('【参照】版式与配色按 Dribbble 同类案例对齐，我随时贴参考截图。');
    parts.push('【约束】一次只改这一个目标；保持 390px 窄屏可用、对比度与键盘可达；给可直接运行的代码。');
    var text = parts.join('\n');
    out.textContent = text;
    var n = s.length + m.length + mo.length;
    countEl.textContent = '已选 ' + n + ' 项 · ' + text.length + ' 字';
    return text;
  }
  function bindBox(box, single){
    box.addEventListener('click', function(e){
      var btn = e.target.closest ? e.target.closest('.opt') : null;
      if(!btn || !box.contains(btn)) return;
      if(single){
        [].slice.call(box.querySelectorAll('.opt')).forEach(function(b){ b.setAttribute('aria-pressed','false'); });
        btn.setAttribute('aria-pressed','true');
      } else {
        btn.setAttribute('aria-pressed', btn.getAttribute('aria-pressed') === 'true' ? 'false' : 'true');
      }
      build();
    });
  }
  bindBox(gStyle, false);
  bindBox(gModule, true);
  bindBox(gMotion, false);
  [gStyle, gModule, gMotion].forEach(function(box){
    [].slice.call(box.querySelectorAll('.opt')).forEach(function(b){
      b.setAttribute('aria-pressed', DEFAULT_ON.indexOf(b.textContent) > -1 ? 'true' : 'false');
    });
  });
  resetBtn.addEventListener('click', function(){
    [gStyle, gModule, gMotion].forEach(function(box){
      [].slice.call(box.querySelectorAll('.opt')).forEach(function(b){
        b.setAttribute('aria-pressed', DEFAULT_ON.indexOf(b.textContent) > -1 ? 'true' : 'false');
      });
    });
    build();
  });

  /* SECTION: copy */
  function fallbackCopy(text){
    var ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly','');
    ta.style.position = 'fixed';
    ta.style.top = '-1000px';
    document.body.appendChild(ta);
    ta.select();
    var ok = false;
    try { ok = document.execCommand('copy'); } catch(err){ ok = false; }
    document.body.removeChild(ta);
    return ok;
  }
  function flash(ok){
    copyBtn.classList.toggle('copied', ok);
    copyBtn.textContent = ok ? '已复制，去粘给 AI ✓' : '复制失败，请手动选中';
    setTimeout(function(){
      copyBtn.classList.remove('copied');
      copyBtn.textContent = '复制这段提示词';
    }, 2000);
  }
  copyBtn.addEventListener('click', function(){
    var text = build();
    var done = function(){ flash(true); };
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(text).then(done, function(){ flash(fallbackCopy(text)); });
    } else {
      flash(fallbackCopy(text));
    }
  });
  build();
})();