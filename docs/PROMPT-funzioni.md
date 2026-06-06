# Prompt pronto per Claude — implementare 2 funzioni

> **Come si usa:** apri una nuova chat con Claude (o Claude Code) dentro il progetto in cui
> vuoi le funzioni e incolla **tutto** il contenuto qui sotto. È scritto come istruzione +
> spec + codice di riferimento, così Claude può adattarlo al tuo codebase.

---

## CONTESTO (da dare a Claude)

Sto lavorando a un **generatore di menù in formato A4** (210×297 mm) fatto in **React senza
build** (caricato via `@babel/standalone`) e con **CSS basato su variabili (custom properties)**.

Struttura rilevante:
- Lo stato del menù è un oggetto `menu` (`{ name, category, price, date, seats, chef, chefNote,
  dishes:[{name,desc,price,allergens,...}], layout:{} }`) salvato in `localStorage`.
- L'anteprima è un nodo `.page-A4` dentro `.sheet`, scalata con `transform: scale(zoom)` su un
  contenitore `.sheet-stack`.
- I colori del foglio usano **token semantici**: `--cream` (sfondo carta), `--ink` (testo),
  `--gold` (accento), `--warm-grey`, `--line-soft`, più i font `--f-serif/--f-body/--f-mono/--f-display`.

Voglio implementare **due funzioni**: (A) sistema multi-cliente "consulenza" + un tema "il baretto",
(B) modalità "Canva" con drag & drop e guide di allineamento sulla copertina.

---

# FUNZIONE A — Multi-cliente ("consulenza") + tema "il baretto"

**Obiettivo:** lo stesso generatore serve più clienti, ognuno con il proprio "vestito" (logo,
palette, font, decori); la logica resta identica, cambia solo il tema via `data-client`.

## A1. Registro clienti (`clients.js`)
```js
const CLIENTS = {
  dalentini: {
    id:"dalentini", name:"DaLentini", kind:"Home Restaurant", place:"Messina",
    stamp:"Home Restaurant · Messina", stampInline:"DaLentini · Home Restaurant",
    role:"chef-patron",
    logo:{ type:"wordmark", text:"DaLentini" },   // oppure { type:"image", src, alt }
    decor:null, fonts:null,                        // fonts = URL Google Fonts del cliente
    presets:[ {key:"radici",num:"04",name:"Radici",tag:"tematico"}, /*...*/ ],
    defaultPreset:"radici"
  },
  baretto: {
    id:"baretto", name:"il baretto", kind:"Cocktail & Wine Bar", place:"Messina",
    stamp:"Cocktail & Wine Bar · Messina", stampInline:"il baretto · Cocktail & Wine Bar",
    role:"patron",
    logo:{ type:"image", src: BARETTO_LOGO_DATAURL, alt:"il baretto" },
    decor:"coast",
    fonts:"https://fonts.googleapis.com/css2?family=Bebas+Neue&family=GFS+Didot&family=Jost:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@400;500;600;700&display=swap",
    presets:[ {key:"barettoSignature",num:"01",name:"Signature",tag:"cocktail"}, /*...*/ ],
    defaultPreset:"barettoSignature"
  }
};
const DEFAULT_CLIENT = "dalentini";
const getClient = id => CLIENTS[id] || CLIENTS[DEFAULT_CLIENT];

// inietta i font del cliente (idempotente)
function applyClientFonts(client){
  const id="client-fonts"; let link=document.getElementById(id);
  if(!client||!client.fonts){ if(link) link.remove(); return; }
  if(!link){ link=document.createElement("link"); link.id=id; link.rel="stylesheet"; document.head.appendChild(link); }
  if(link.href!==client.fonts) link.href=client.fonts;
}
```
> Il logo immagine va **incorporato come data-URL** (`BARETTO_LOGO_DATAURL`) così funziona anche
> nei file esportati. Il cliente attivo si legge da `?client=ID` e si salva in `localStorage`.

## A2. Rendering client-aware
- Ogni foglio mette `data-client={client.id}` sul nodo radice `.sheet`.
- Componente marchio:
```jsx
const Brand = ({ client }) =>
  client.logo?.type==="image"
    ? <img className="brand-logo" src={client.logo.src} alt={client.logo.alt||client.name}/>
    : <span className="brand-word">{client.logo?.text||client.name}</span>;
```
- All'avvio e al cambio cliente: `applyClientFonts(client)` + aggiorna `?client=` con `history.replaceState`.

## A3. Theming via remapping dei token (CSS)
Il foglio usa i token base; per ogni cliente si **rimappano** sotto `.sheet[data-client="X"]`.
Esempio "il baretto" (palette mare/agrumi, titoli Bebas):
```css
.sheet[data-client="baretto"]{
  --bt-cobalt:#1268A9; --bt-navy:#21477F; --bt-ink:#0E2E54;
  --bt-sky:#EAF3FB; --bt-orange:#F2972E; --bt-lime:#C9DC54;
  /* mappa i ruoli sui colori del brand */
  --cream:var(--bt-sky); --ink:var(--bt-navy); --gold:var(--bt-orange);
  --warm-grey:#5E7CA6;
  /* font: titoli condensati, corpo pulito */
  --f-serif:'Bebas Neue', Impact, sans-serif;     /* nomi voci + titoli grandi */
  --f-body:'Jost', system-ui, sans-serif;
  --f-mono:'Montserrat', system-ui, sans-serif;
}
/* titoli grandi → Bebas maiuscolo (eco del poster), corpo alto per "presenza" */
.sheet[data-client="baretto"] .cover-name,
.sheet[data-client="baretto"] .tab-name{
  font-family:var(--f-serif); text-transform:uppercase; letter-spacing:.012em;
  line-height:.86; overflow-wrap:break-word;   /* nomi lunghi vanno a capo, non tagliati */
}
.sheet[data-client="baretto"] .dish-price{ color:var(--bt-orange); }
```
> Il foglio resta automaticamente coerente perché tutto il CSS usa i token semantici.

## A4. Decori "mare/agrumi" (solo se `client.decor==="coast"`)
Onda SVG come divisore + fetta d'agrume d'angolo + prezzo voce stile bar `NOME | 8.00 €`:
```jsx
const CoastWave = () => (
  <div className="coast-wave" aria-hidden="true"><svg viewBox="0 0 240 12" preserveAspectRatio="none">
    <path d="M0,6 C10,0 20,0 30,6 C40,12 50,12 60,6 C70,0 80,0 90,6 C100,12 110,12 120,6 C130,0 140,0 150,6 C160,12 170,12 180,6 C190,0 200,0 210,6 C220,12 230,12 240,6 L240,12 L0,12 Z"/>
  </svg></div>
);
const DishPrice = ({ value }) => (value==null||value==="") ? null :
  <span className="dish-price"><i className="dish-price-sep">|</i>{Number(value).toFixed(2)} €</span>;
```

## A5. Canvas scuro a schermo / chiaro in stampa (opzionale ma consigliato)
- `.sheet` definisce i token **chiari** di default (carta chiara, anche in stampa).
- Tema scuro SOLO a schermo, attivato da `data-theme="dark"` sull'`<html>`:
```css
@media screen{
  :root[data-theme="dark"] .sheet{ --cream:#1C1B16; --ink:#F2ECDA; --gold:#D8BE7E; --warm-grey:#A49C8A; }
  :root[data-theme="dark"] .sheet[data-client="baretto"]{ --cream:var(--bt-ink); --ink:var(--bt-sky); --gold:var(--bt-orange); }
}
/* @media print NON tocca .sheet → in stampa il foglio resta chiaro */
```
- La **chrome** dell'editor (sidebar/toolbar/desk) può stare su tonalità **antracite** fisse
  (es. `--desk:#17191B`, pannelli `#212427`, testo `#ECEAE3`) per far risaltare il foglio.

## A6. Pagina "consulenza"
Una sezione con card-cliente (logo + nome + descrizione) che linkano al generatore con `?client=ID`.

---

# FUNZIONE B — Modalità "Canva": drag & drop con guide di allineamento

**Obiettivo:** trascinare liberamente gli elementi della **copertina** (logo, titolo, sottotitolo,
dati) mostrando **guide di allineamento** (rispetto alla cornice del foglio e agli altri elementi)
con **snap**, e **salvando** le posizioni (valide anche in stampa/PDF/export).

## B1. Modello dati
Offset (in px non scalati) per variante ed elemento, dentro il menù:
```
menu.layout = { [variante]: { [idElemento]: { x, y } } }   // default {} = nessuno spostamento
```
Va incluso in `EMPTY_MENU.layout = {}` e preservato nella normalizzazione del menù.

## B2. Context + componente `Draggable` (codice completo, React)
> Usa `cloneElement` per **non** aggiungere nodi DOM (layout invariato). Durante il drag manipola
> direttamente `style.transform` (fluido, niente re-render) e committa l'offset solo al rilascio.
```jsx
const { useRef, useContext } = React;
const DragCtx = React.createContext(null); // value: { editable, zoom, onCommit(id, {x,y}) }

function Draggable({ id, offset, children }){
  const ctx = useContext(DragCtx);
  const ref = useRef(null);
  const off = offset || { x:0, y:0 };
  const child = React.Children.only(children);
  const transform = (off.x||off.y) ? `translate(${off.x}px, ${off.y}px)` : null;
  const baseStyle = child.props.style || {};

  // statico (stampa/export o nessun provider): applica solo l'offset
  if(!ctx || !ctx.editable){
    return React.cloneElement(child, { "data-drag-id":id, style: transform?{...baseStyle,transform}:baseStyle });
  }
  const { zoom, onCommit } = ctx;

  const onPointerDown = (e) => {
    if(e.button!=null && e.button!==0) return;
    const el = ref.current, page = el && el.closest(".page-A4");
    if(!page) return;
    e.preventDefault(); e.stopPropagation();
    try{ el.setPointerCapture(e.pointerId); }catch(_){}
    el.classList.add("dragging");

    const start={x:e.clientX,y:e.clientY}, base={x:off.x,y:off.y};
    const pageRect=page.getBoundingClientRect();
    const z=(zoom&&zoom>0)?zoom:1, TH=6;                 // soglia snap (px schermo)

    // bersagli di allineamento (coord. schermo): cornice + altri .draggable
    const vx=[pageRect.left, pageRect.left+pageRect.width/2, pageRect.right];
    const hy=[pageRect.top,  pageRect.top+pageRect.height/2, pageRect.bottom];
    page.querySelectorAll(".draggable").forEach(d=>{ if(d===el) return;
      const r=d.getBoundingClientRect();
      vx.push(r.left,r.left+r.width/2,r.right); hy.push(r.top,r.top+r.height/2,r.bottom);
    });

    const layer=document.getElementById("dragGuideLayer");
    const clear=()=>{ if(layer) layer.innerHTML=""; };
    const draw=(orient,pos)=>{ if(!layer) return; const l=document.createElement("div");
      l.className="drag-guide "+orient;
      if(orient==="v"){ l.style.left=pos+"px"; l.style.top=pageRect.top+"px"; l.style.height=pageRect.height+"px"; }
      else{ l.style.top=pos+"px"; l.style.left=pageRect.left+"px"; l.style.width=pageRect.width+"px"; }
      layer.appendChild(l);
    };

    let cur={...base};
    const onMove=(ev)=>{
      let nx=base.x+(ev.clientX-start.x)/z, ny=base.y+(ev.clientY-start.y)/z;
      el.style.transform=`translate(${nx}px,${ny}px)`;           // tentativo per misurare
      const r=el.getBoundingClientRect(); clear();
      // snap orizzontale (x): bordi/centro elemento vs bersagli
      let bx=null; [r.left,r.left+r.width/2,r.right].forEach(p=>vx.forEach(L=>{const d=L-p;
        if(Math.abs(d)<=TH && (bx===null||Math.abs(d)<Math.abs(bx.d))) bx={d,L};}));
      if(bx){ nx+=bx.d/z; draw("v",bx.L); }
      let by=null; [r.top,r.top+r.height/2,r.bottom].forEach(p=>hy.forEach(L=>{const d=L-p;
        if(Math.abs(d)<=TH && (by===null||Math.abs(d)<Math.abs(by.d))) by={d,L};}));
      if(by){ ny+=by.d/z; draw("h",by.L); }
      el.style.transform=`translate(${nx}px,${ny}px)`;
      cur={x:Math.round(nx), y:Math.round(ny)};
    };
    const onUp=()=>{ window.removeEventListener("pointermove",onMove);
      window.removeEventListener("pointerup",onUp);
      el.classList.remove("dragging"); clear(); onCommit(id,cur); };
    window.addEventListener("pointermove",onMove);
    window.addEventListener("pointerup",onUp);
  };

  return React.cloneElement(child, {
    ref, "data-drag-id":id,
    className:((child.props.className||"")+" draggable editable").trim(),
    style: transform?{...baseStyle,transform}:baseStyle,
    onPointerDown, title:"Trascina per riposizionare"
  });
}
```

## B3. Overlay guide + CSS
```css
.draggable.editable{ cursor:grab; }
.draggable.editable:hover{ outline:1px dashed color-mix(in srgb, var(--gold) 75%, transparent); outline-offset:4px; }
.draggable.dragging{ cursor:grabbing; outline:1px solid var(--gold); }
.drag-guide-layer{ position:fixed; inset:0; pointer-events:none; z-index:60; }
.drag-guide{ position:fixed; background:#E8528A; }
.drag-guide.v{ width:1px; } .drag-guide.h{ height:1px; }
@media print{ .draggable.editable{ cursor:default; outline:none!important; } .drag-guide-layer{ display:none!important; } }
```
E un nodo unico nell'app: `<div id="dragGuideLayer" class="drag-guide-layer" aria-hidden="true"></div>`.

## B4. Wiring nell'app
```jsx
// nello stato/azioni dell'app:
const setLayoutOffset = useCallback((id, off)=> setMenu(m=>{
  const layout={...(m.layout||{})}; const cur={...(layout[variant]||{})};
  if(!off||(off.x===0&&off.y===0)) delete cur[id]; else cur[id]=off;
  layout[variant]=cur; return {...m, layout};
}), [variant]);
const resetLayout = ()=> setMenu(m=>{ const l={...(m.layout||{})}; delete l[variant]; return {...m,layout:l}; });

// attorno al foglio in anteprima:
<DragCtx.Provider value={{ editable:true, zoom, onCommit:setLayoutOffset }}>
  <SheetComponent menu={menu} client={client} />
</DragCtx.Provider>
// + pulsante "reimposta posizioni" che chiama resetLayout()
```

## B5. Avvolgere gli elementi della copertina
Nel componente del foglio, leggi gli offset e avvolgi gli elementi (host element singolo):
```jsx
const L = (menu.layout && menu.layout["classico"]) || {};
<Draggable id="logo"     offset={L.logo}><div className="cover-wm"><Brand client={C}/></div></Draggable>
<Draggable id="title"    offset={L.title}><h1 className="cover-name">{menu.name||"—"}</h1></Draggable>
<Draggable id="subtitle" offset={L.subtitle}><div className="cover-stamp">{C.stamp}</div></Draggable>
<Draggable id="stats"    offset={L.stats}><div className="cover-stats">…</div></Draggable>
```

## Note importanti
- Gli offset sono **trasformazioni inline**: si applicano anche in **stampa/PDF/export** (in export
  non c'è il provider → il `Draggable` applica solo l'offset, statico). Così l'utente impagina e poi stampa.
- Le guide sono in **coordinate schermo** (da `getBoundingClientRect`), perciò funzionano anche con
  l'anteprima scalata: il delta del puntatore si divide per `zoom` per ottenere l'offset reale.
- Snap sia alla **cornice** (bordi + centro) sia agli **altri elementi** (loro bordi + centro).
- Su touch, aggiungi `touch-action:none` agli elementi `.draggable` per non far scrollare durante il drag.

---

### Checklist di accettazione
- [ ] Cambiando `?client=ID` cambiano logo, palette, font, decori e preset; la logica resta identica.
- [ ] Tema "il baretto": titoli Bebas maiuscoli, palette navy/azzurro/arancio, onde + agrume, prezzi `| 8.00 €`.
- [ ] Toggle tema scuro: menù scuro a schermo, **chiaro in stampa**.
- [ ] Trascinando logo/titolo/dati compaiono guide magenta con snap a cornice e altri elementi.
- [ ] Le posizioni si salvano e restano dopo reload e in PDF; pulsante reset funzionante.
