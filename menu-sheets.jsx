// ============================================================
// DaLentini · Menu sheet components — 5 varianti grafiche
// Tutte renderizzano in formato A4 reale (210mm × 297mm)
// ============================================================

const { useState, useEffect, useRef, useMemo } = React;

// ---- Utility ----
const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso + "T00:00:00");
  if (isNaN(d)) return iso;
  const months = ["gennaio","febbraio","marzo","aprile","maggio","giugno",
                  "luglio","agosto","settembre","ottobre","novembre","dicembre"];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
};

const formatPrice = (p) => {
  if (!p && p !== 0) return "";
  return `€ ${Number(p).toLocaleString("it-IT")}`;
};

const courseNumber = (i) => String(i + 1).padStart(2, "0");

const AllergensInline = ({ list }) => {
  if (!list || list.length === 0) return null;
  return (
    <span className="dish-allergens">
      ({list.sort((a,b)=>a-b).join(" · ")})
    </span>
  );
};

const AllergensLegend = ({ className = "" }) => (
  <span className={"allergens-flat " + className}>
    <b>Allergeni · Reg. UE 1169/2011 ·&nbsp;</b>
    {ALLERGENI.map((a, i) => (
      <span key={a.n}>
        <b>{a.n}</b>&nbsp;{a.label}{i < ALLERGENI.length - 1 ? "  ·  " : ""}
      </span>
    ))}
  </span>
);

// Image with striped fallback
const DishImage = ({ src, ratio = "4 / 5", caption = "Foto piatto", className = "" }) => {
  if (src){
    return (
      <div className={"dish-image " + className} style={{ aspectRatio: ratio }}>
        <img src={src} alt="" />
      </div>
    );
  }
  return (
    <div className={"dish-image dish-image-placeholder " + className} style={{ aspectRatio: ratio }}>
      <span className="ph-caption">{caption}</span>
    </div>
  );
};

// ============================================================
// I — MENU CLASSICO  (centered, symmetric, gold ornament)
// ============================================================
function MenuClassico({ menu }) {
  const portate = menu.dishes.length;
  return (
    <div className="sheet sheet-classico" data-screen-label="Menu Classico">
      <div className="page-A4 cover-page-c">
        <div className="cover-chef-c">chef-patron · {menu.chef}</div>

        <div className="cover-center-c">
          <div className="cover-stamp-c">Home Restaurant · Messina</div>
          <div className="cover-wm-c">DaLentini</div>
          <div className="cover-ornament-c">
            <span className="orn-rule"></span>
            <span className="orn-dot">·</span>
            <span className="orn-rule"></span>
          </div>
          <div className="cover-menu-name-c">{menu.name || "—"}</div>
          <div className="cover-meta-c">
            {menu.category && <span className="cover-cat-c">menu {menu.category}</span>}
          </div>
          <div className="cover-portate-c">
            {courseNumber(portate-1)} portate <span className="dot-sep">·</span> {formatPrice(menu.price)}
          </div>
          {menu.chefNote && (
            <p className="cover-note-c">{menu.chefNote}</p>
          )}
        </div>

        <div className="cover-footer-c">
          <span>{formatDate(menu.date)}</span>
          <span className="cover-seats-c">{menu.seats} posti · su prenotazione</span>
        </div>
      </div>

      <div className="page-A4 inner-page-c">
        <div className="inner-head-c">
          <div className="inner-wm-c">DaLentini</div>
          <div className="inner-menu-name-c">— {menu.name} —</div>
        </div>

        <div className="dishes-c">
          {menu.dishes.map((d, i) => (
            <div className="dish-c" key={i}>
              <div className="dish-num-c">{courseNumber(i)}</div>
              <h3 className="dish-name-c">
                {d.name || <span className="placeholder-c">Nome del piatto</span>}
                <AllergensInline list={d.allergens} />
              </h3>
              {d.desc && <p className="dish-desc-c">{d.desc}</p>}
              {i < menu.dishes.length - 1 && (
                <div className="dish-sep-c">
                  <span></span><em>·</em><span></span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="inner-footer-c">
          <div className="allergens-legend-c">
            <div className="legend-title-c">— Allergeni —</div>
            <div className="legend-list-c">
              {ALLERGENI.map(a => (
                <span key={a.n} className="legend-item-c">
                  <span className="legend-n">{a.n}</span> {a.label}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// II — MENU CONTEMPORANEO  (left-aligned, editorial)
// ============================================================
function MenuContemporaneo({ menu }) {
  const portate = menu.dishes.length;
  return (
    <div className="sheet sheet-contemporaneo" data-screen-label="Menu Contemporaneo">
      <div className="page-A4 cover-page-m">
        <div className="cover-top-m">
          <span className="cover-stamp-m">DaLentini · Home Restaurant</span>
          <span className="cover-date-m">{formatDate(menu.date)}</span>
        </div>

        <div className="cover-body-m">
          <div className="cover-cat-m">— menu {menu.category} —</div>
          <h1 className="cover-name-m">{menu.name || "—"}</h1>
          <div className="cover-rule-m"></div>
          <div className="cover-stats-m">
            <div className="stat-m">
              <span className="stat-label-m">Portate</span>
              <span className="stat-val-m">{courseNumber(portate - 1)}</span>
            </div>
            <div className="stat-m">
              <span className="stat-label-m">Prezzo</span>
              <span className="stat-val-m">{formatPrice(menu.price)}</span>
            </div>
            <div className="stat-m">
              <span className="stat-label-m">Coperti</span>
              <span className="stat-val-m">{String(menu.seats).padStart(2,"0")}</span>
            </div>
          </div>
          {menu.chefNote && (
            <p className="cover-note-m">«&nbsp;{menu.chefNote}&nbsp;»</p>
          )}
        </div>

        <div className="cover-foot-m">
          <span className="cover-chef-m">— {menu.chef}, chef-patron</span>
          <span className="cover-folio-m">I</span>
        </div>
      </div>

      <div className="page-A4 inner-page-m">
        <div className="inner-top-m">
          <span className="inner-wm-m">DaLentini</span>
          <span className="inner-name-m">{menu.name} · {courseNumber(portate-1)} portate</span>
        </div>

        <div className="dishes-m">
          {menu.dishes.map((d, i) => (
            <div className="dish-m" key={i}>
              <div className="dish-left-m">
                <div className="dish-num-m">{courseNumber(i)}</div>
              </div>
              <div className="dish-body-m">
                <h3 className="dish-name-m">
                  {d.name || <span className="placeholder-m">Nome del piatto</span>}
                  <AllergensInline list={d.allergens} />
                </h3>
                {d.desc && <p className="dish-desc-m">{d.desc}</p>}
              </div>
            </div>
          ))}
        </div>

        <div className="inner-foot-m">
          <div className="legend-m">
            <AllergensLegend />
          </div>
          <div className="folio-m">II</div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// III — MENU TABULA  (ultra-minimal, single page)
// ============================================================
function MenuTabula({ menu }) {
  const portate = menu.dishes.length;
  return (
    <div className="sheet sheet-tabula" data-screen-label="Menu Tabula">
      <div className="page-A4 tabula-page">
        <div className="tab-head">
          <div className="tab-wm">DaLentini</div>
          <div className="tab-meta">
            <span>— menu {menu.category} —</span>
            <span>{formatDate(menu.date)}</span>
          </div>
        </div>

        <div className="tab-title">
          <h1 className="tab-name">{menu.name || "—"}</h1>
          <div className="tab-rule"></div>
          <div className="tab-stats">
            <span>{courseNumber(portate-1)} portate</span>
            <span className="dot-sep">·</span>
            <span>{formatPrice(menu.price)}</span>
            <span className="dot-sep">·</span>
            <span>{menu.seats} posti</span>
          </div>
        </div>

        <div className="tab-dishes">
          {menu.dishes.map((d, i) => (
            <div className="tab-dish" key={i}>
              <h3 className="tab-dish-name">
                {d.name || <span className="placeholder-m">Nome del piatto</span>}
                <AllergensInline list={d.allergens} />
              </h3>
              {d.desc && <div className="tab-dish-desc">{d.desc}</div>}
              {i < menu.dishes.length - 1 && <div className="tab-sep"></div>}
            </div>
          ))}
        </div>

        <div className="tab-foot">
          <AllergensLegend className="tab-legend" />
        </div>
      </div>
    </div>
  );
}

// ============================================================
// IV — MENU EDITORIALE  (with photos + story per dish)
// Cover + dishes in horizontal half-page slots, image left, story right
// ============================================================
function MenuEditoriale({ menu }) {
  const portate = menu.dishes.length;
  // Group dishes 2 per inner page
  const pages = [];
  for (let i = 0; i < menu.dishes.length; i += 2){
    pages.push(menu.dishes.slice(i, i + 2));
  }

  // Find a hero image (first dish with image, otherwise null → placeholder)
  const heroSrc = menu.dishes.find(d => d.image)?.image || null;

  return (
    <div className="sheet sheet-editoriale" data-screen-label="Menu Editoriale">
      {/* COVER */}
      <div className="page-A4 ed-cover">
        <DishImage
          src={heroSrc}
          ratio="3 / 4"
          caption="Hero · foto della serata"
          className="ed-hero"
        />
        <div className="ed-cover-overlay">
          <div className="ed-cover-top">
            <span className="ed-stamp">DaLentini</span>
            <span className="ed-date">{formatDate(menu.date)}</span>
          </div>
          <div className="ed-cover-body">
            <div className="ed-cat">— menu {menu.category} —</div>
            <h1 className="ed-name">{menu.name || "—"}</h1>
            <div className="ed-cover-stats">
              <span>{courseNumber(portate-1)} portate</span>
              <span className="dot-sep">·</span>
              <span>{formatPrice(menu.price)}</span>
            </div>
            {menu.chefNote && <p className="ed-cover-note">«&nbsp;{menu.chefNote}&nbsp;»</p>}
          </div>
          <div className="ed-cover-foot">
            <span>— {menu.chef}, chef-patron</span>
            <span>{menu.seats} posti · su prenotazione</span>
          </div>
        </div>
      </div>

      {/* INNER PAGES — 2 dishes per page */}
      {pages.map((group, pIdx) => (
        <div className="page-A4 ed-page" key={pIdx}>
          <div className="ed-page-head">
            <span className="ed-page-wm">DaLentini</span>
            <span className="ed-page-name">{menu.name} · {courseNumber(portate-1)} portate</span>
            <span className="ed-page-folio">{romanize(pIdx + 2)}</span>
          </div>

          <div className="ed-page-body">
            {group.map((d, idx) => {
              const i = pIdx * 2 + idx;
              return (
                <article className="ed-dish" key={i}>
                  <DishImage
                    src={d.image}
                    ratio="4 / 5"
                    caption={`Foto · ${d.name || "piatto " + courseNumber(i)}`}
                    className="ed-dish-img"
                  />
                  <div className="ed-dish-text">
                    <div className="ed-dish-num">{courseNumber(i)}</div>
                    <h3 className="ed-dish-name">
                      {d.name || <span className="placeholder-m">Nome del piatto</span>}
                    </h3>
                    {d.desc && <p className="ed-dish-desc">{d.desc}</p>}
                    {d.story && (
                      <>
                        <div className="ed-story-rule"></div>
                        <p className="ed-dish-story">{d.story}</p>
                      </>
                    )}
                    {d.allergens && d.allergens.length > 0 && (
                      <div className="ed-dish-allergens">
                        <span className="ed-allg-label">Allergeni</span>
                        <span className="ed-allg-list">{d.allergens.sort((a,b)=>a-b).join(" · ")}</span>
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {pIdx === pages.length - 1 && (
            <div className="ed-page-foot">
              <AllergensLegend />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ============================================================
// V — MENU DIARIO  (narrative without photos)
// Cover + journal-style entries with story per dish
// ============================================================
function MenuDiario({ menu }) {
  const portate = menu.dishes.length;
  // Group dishes 3 per inner page (varies based on story length, but 3 fits)
  const perPage = 3;
  const pages = [];
  for (let i = 0; i < menu.dishes.length; i += perPage){
    pages.push(menu.dishes.slice(i, i + perPage));
  }

  return (
    <div className="sheet sheet-diario" data-screen-label="Menu Diario">
      {/* COVER */}
      <div className="page-A4 dr-cover">
        <div className="dr-top">
          <span className="dr-stamp">— Diario di sera —</span>
          <span className="dr-date">{formatDate(menu.date)}</span>
        </div>

        <div className="dr-cover-body">
          <div className="dr-cover-wm">DaLentini</div>
          <div className="dr-cat">menu {menu.category}</div>
          <h1 className="dr-name">«&nbsp;{menu.name || "—"}&nbsp;»</h1>
          {menu.chefNote && (
            <p className="dr-note">{menu.chefNote}</p>
          )}
          <div className="dr-rule"></div>
          <div className="dr-cover-stats">
            <div className="dr-stat"><span className="dr-stat-lbl">portate</span><span className="dr-stat-val">{courseNumber(portate-1)}</span></div>
            <div className="dr-stat"><span className="dr-stat-lbl">prezzo</span><span className="dr-stat-val">{formatPrice(menu.price)}</span></div>
            <div className="dr-stat"><span className="dr-stat-lbl">coperti</span><span className="dr-stat-val">{String(menu.seats).padStart(2,"0")}</span></div>
          </div>
        </div>

        <div className="dr-cover-foot">
          <span className="dr-chef">scritto da {menu.chef}, chef-patron</span>
        </div>
      </div>

      {/* INNER PAGES */}
      {pages.map((group, pIdx) => (
        <div className="page-A4 dr-page" key={pIdx}>
          <div className="dr-page-head">
            <span className="dr-page-wm">DaLentini</span>
            <span className="dr-page-meta">{menu.name} · {courseNumber(portate-1)} portate</span>
            <span className="dr-page-folio">{romanize(pIdx + 2)}</span>
          </div>

          <div className="dr-entries">
            {group.map((d, idx) => {
              const i = pIdx * perPage + idx;
              return (
                <article className="dr-entry" key={i}>
                  <div className="dr-entry-num">{courseNumber(i)}</div>
                  <div className="dr-entry-body">
                    <h3 className="dr-entry-name">
                      {d.name || <span className="placeholder-m">Nome del piatto</span>}
                      <AllergensInline list={d.allergens} />
                    </h3>
                    {d.desc && <p className="dr-entry-desc">{d.desc}</p>}
                    {d.story && <p className="dr-entry-story">{d.story}</p>}
                  </div>
                </article>
              );
            })}
          </div>

          {pIdx === pages.length - 1 && (
            <div className="dr-page-foot">
              <AllergensLegend />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ---- Helpers ----
function romanize(n){
  const map = [
    [1000,"M"],[900,"CM"],[500,"D"],[400,"CD"],[100,"C"],[90,"XC"],
    [50,"L"],[40,"XL"],[10,"X"],[9,"IX"],[5,"V"],[4,"IV"],[1,"I"]
  ];
  let r = "";
  for (const [v, s] of map){ while(n >= v){ r += s; n -= v;} }
  return r;
}

Object.assign(window, {
  MenuClassico, MenuContemporaneo, MenuTabula, MenuEditoriale, MenuDiario,
  formatDate, formatPrice, ALLERGENI
});
