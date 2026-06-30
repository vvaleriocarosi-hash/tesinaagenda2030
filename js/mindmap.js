/* ===========================================================
   Mappa concettuale interattiva — homepage
   Canvas virtuale più ampio della finestra visibile: i nodi
   hanno spazio per non sovrapporsi, la mappa si trascina (pan)
   per esplorare i rami. SVG e nodi si muovono insieme (stesso
   elemento "stage" trasformato).
   =========================================================== */

(function () {
  const DATA = {
    label: "Agenda 2030",
    sub: "Percorso multidisciplinare",
    children: [
      {
        id: "storia", label: "Storia", color: "#0B3D63", href: "storia-biennio-rosso.html",
        children: [
          { label: "Biennio Rosso e fascismo", href: "storia-biennio-rosso.html" },
          { label: "Leggi Fascistissime", href: "storia-leggi-fascistissime.html" },
          { label: "Nazismo e guerra mondiale", href: "storia-nazismo.html" },
          { label: "Resistenza e Costituente", href: "storia-resistenza.html" }
        ]
      },
      {
        id: "italiano", label: "Italiano", color: "#8C2F1B", href: "italiano-decadentismo.html",
        children: [
          { label: "Decadentismo e Pascoli", href: "italiano-decadentismo.html" },
          { label: "Ungaretti ed Ermetismo", href: "italiano-ungaretti.html" },
          { label: "Montale e Pirandello", href: "italiano-montale.html" },
          { label: "Calvino e la Resistenza", href: "italiano-calvino.html" }
        ]
      },
      {
        id: "diritto", label: "Diritto", color: "#14507F", href: "diritto-costituzione.html",
        children: [
          { label: "Costituzione e Saragat", href: "diritto-costituzione.html" },
          { label: "Il lavoro in Costituzione", href: "diritto-lavoro.html" },
          { label: "Lavoro e SDG 8-10", href: "diritto-sdg.html" }
        ]
      },
      {
        id: "tecniche", label: "Tecniche Professionali", color: "#B23A22", href: "tecniche-modello.html",
        children: [
          { label: "Avventure nel Mondo", href: "tecniche-modello.html" },
          { label: "Sostenibilità e competitor", href: "tecniche-sdg.html" },
          { label: "SWOT", href: "tecniche-swot.html" },
          { label: "Bilancio e BEP", href: "tecniche-bilancio.html" }
        ]
      },
      {
        id: "inglese", label: "Inglese", color: "#072A45", href: "inglese-tourism.html",
        children: [
          { label: "Sustainable tourism", href: "inglese-tourism.html" },
          { label: "Venice & Florence", href: "inglese-italy.html" },
          { label: "US & Constitution", href: "inglese-usa.html" }
        ]
      },
      {
        id: "conclusioni", label: "Conclusioni", color: "#6B2414", href: "conclusioni-saragat.html",
        children: [
          { label: "Il discorso di Saragat", href: "conclusioni-saragat.html" },
          { label: "Dal colonialismo all'Agenda 2030", href: "conclusioni-riflessione.html" }
        ]
      }
    ]
  };

  const VW = 2000, VH = 1500; // virtual canvas — più grande della finestra visibile
  const CX = VW / 2, CY = VH / 2;
  const R1 = 280;   // distanza centro -> ramo
  const R2 = 250;   // distanza ramo -> foglia (base)

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    const wrap = document.getElementById("mindmap-wrap");
    const stage = document.getElementById("mindmap-stage");
    if (!wrap || !stage) return;

    stage.style.width = VW + "px";
    stage.style.height = VH + "px";

    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", VW);
    svg.setAttribute("height", VH);
    svg.id = "mindmap-lines";
    svg.style.position = "absolute";
    svg.style.top = "0"; svg.style.left = "0";
    svg.style.pointerEvents = "none";
    stage.appendChild(svg);

    const nodeLayer = document.createElement("div");
    nodeLayer.style.position = "absolute";
    nodeLayer.style.top = "0"; nodeLayer.style.left = "0";
    nodeLayer.style.width = VW + "px"; nodeLayer.style.height = VH + "px";
    stage.appendChild(nodeLayer);

    // root
    makeNode(nodeLayer, "root", DATA.label, DATA.sub, CX, CY, null);

    const n = DATA.children.length;
    DATA.children.forEach((branch, i) => {
      const angle = (-90 + (360 / n) * i) * (Math.PI / 180);
      const bx = CX + R1 * Math.cos(angle);
      const by = CY + R1 * Math.sin(angle);

      makeLine(svg, CX, CY, bx, by, "branch-line");
      const el = makeNode(nodeLayer, "branch", branch.label, null, bx, by, branch.color, branch.href);

      let expanded = false;
      const toggle = document.createElement("div");
      toggle.className = "mm-toggle";
      toggle.textContent = "+";
      el.appendChild(toggle);

      const kids = branch.children || [];
      const kCount = kids.length;
      const numSlots = Math.ceil(kCount / 2);
      const slotStep = 32; // degrees between slot centers — small, stays within this branch's wedge
      const leafEls = [];

      kids.forEach((leaf, j) => {
        const slot = Math.floor(j / 2);
        const tier = j % 2; // 0 = near, 1 = far
        const slotOffset = (slot - (numSlots - 1) / 2) * slotStep;
        const fineOffset = tier === 0 ? -5 : 5;
        const kAngle = angle + (slotOffset + fineOffset) * (Math.PI / 180);
        const radius = tier === 0 ? R2 : R2 * 1.62;
        const lx = bx + radius * Math.cos(kAngle);
        const ly = by + radius * Math.sin(kAngle);
        const lline = makeLine(svg, bx, by, lx, ly, "leaf-line", true);
        const lel = makeNode(nodeLayer, "leaf", leaf.label, null, lx, ly, branch.color, leaf.href);
        leafEls.push({ el: lel, line: lline });
      });

      function setExpanded(val) {
        expanded = val;
        toggle.textContent = expanded ? "\u2212" : "+";
        leafEls.forEach(o => {
          o.el.classList.toggle("visible", expanded);
          o.line.classList.toggle("visible", expanded);
        });
      }
      toggle.addEventListener("click", function (e) {
        e.preventDefault(); e.stopPropagation();
        setExpanded(!expanded);
      });
    });

    // --- Center the root under the visible viewport on load ---
    let baseX = 0, baseY = 0; // current applied translation
    function centerView(animate) {
      const ww = wrap.clientWidth, wh = wrap.clientHeight;
      baseX = ww / 2 - CX;
      baseY = wh / 2 - CY;
      stage.style.transition = animate ? "transform .4s ease" : "none";
      stage.style.transform = "translate(" + baseX + "px," + baseY + "px)";
      if (animate) setTimeout(() => { stage.style.transition = "none"; }, 420);
    }
    centerView(false);
    window.addEventListener("resize", () => centerView(false));

    // --- Pan (drag) ---
    let dragging = false, startX = 0, startY = 0;
    stage.addEventListener("mousedown", function (e) {
      dragging = true; stage.classList.add("dragging");
      startX = e.clientX; startY = e.clientY;
    });
    window.addEventListener("mousemove", function (e) {
      if (!dragging) return;
      const dx = e.clientX - startX, dy = e.clientY - startY;
      stage.style.transform = "translate(" + (baseX + dx) + "px," + (baseY + dy) + "px)";
    });
    window.addEventListener("mouseup", function (e) {
      if (!dragging) return;
      dragging = false; stage.classList.remove("dragging");
      baseX += e.clientX - startX; baseY += e.clientY - startY;
    });
    // touch support
    stage.addEventListener("touchstart", function (e) {
      dragging = true;
      startX = e.touches[0].clientX; startY = e.touches[0].clientY;
    });
    stage.addEventListener("touchmove", function (e) {
      if (!dragging) return;
      const dx = e.touches[0].clientX - startX, dy = e.touches[0].clientY - startY;
      stage.style.transform = "translate(" + (baseX + dx) + "px," + (baseY + dy) + "px)";
    });
    stage.addEventListener("touchend", function (e) {
      dragging = false;
    });

    // recenter button
    const btn = document.getElementById("mindmap-recenter");
    if (btn) btn.addEventListener("click", () => centerView(true));
  }

  function makeNode(parent, kind, label, sub, x, y, color, href) {
    const wrapEl = document.createElement("div");
    wrapEl.className = "mm-node " + kind;
    wrapEl.style.left = x + "px";
    wrapEl.style.top = y + "px";
    if (color) wrapEl.style.setProperty("--branch-color", color);

    const bubble = document.createElement(href ? "a" : "div");
    bubble.className = "mm-bubble";
    bubble.textContent = label;
    if (href) bubble.setAttribute("href", href);
    wrapEl.appendChild(bubble);

    if (sub) {
      const subEl = document.createElement("div");
      subEl.style.color = "#CFE0EC";
      subEl.style.fontSize = ".72rem";
      subEl.textContent = sub;
      wrapEl.appendChild(subEl);
    }
    parent.appendChild(wrapEl);
    return wrapEl;
  }

  function makeLine(svg, x1, y1, x2, y2, cls) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1); line.setAttribute("y1", y1);
    line.setAttribute("x2", x2); line.setAttribute("y2", y2);
    line.setAttribute("class", "mm-line " + cls);
    svg.appendChild(line);
    return line;
  }
})();
