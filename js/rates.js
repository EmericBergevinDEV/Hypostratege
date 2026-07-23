/* =========================================================
   Hypostratège — Affichage des taux (100 % statique)
   1) Taux du marché : lus dans data/rates-marche.json
      (régénéré automatiquement par le robot Banque du Canada)
   2) Tes taux : lus en direct dans un Google Sheet
      (modifiable sans code — voir README, section « Taux »)
   Les deux échouent en douceur : si une source est indisponible,
   les valeurs de secours déjà présentes dans le HTML restent affichées.
   ========================================================= */
(function () {
  // ⬇️ COLLE ICI L'IDENTIFIANT DE TON GOOGLE SHEET (voir README). Laisse vide tant que non configuré.
  var SHEET_ID = "";
  var SHEET_TAB = "Taux";

  var frDate = function (iso) {
    if (!iso) return "";
    var d = new Date(iso.length <= 10 ? iso + "T00:00:00" : iso);
    if (isNaN(d)) return "";
    try {
      return d.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" });
    } catch (e) {
      return d.toISOString().slice(0, 10);
    }
  };

  var pct = function (v) {
    if (v === null || v === undefined || v === "" || isNaN(parseFloat(v))) return null;
    return parseFloat(v).toFixed(2).replace(".", ",") + " %";
  };

  /* ---------- 1) Taux du marché (Banque du Canada) ---------- */
  fetch("/data/rates-marche.json", { cache: "no-store" })
    .then(function (r) { if (!r.ok) throw new Error("marché indisponible"); return r.json(); })
    .then(function (data) {
      document.querySelectorAll("[data-marche]").forEach(function (el) {
        var val = pct(data[el.getAttribute("data-marche")]);
        if (val) el.textContent = val;
      });
      var src = document.getElementById("rate-marche-source");
      if (src && data.date) {
        src.textContent = "Taux de référence — Banque du Canada, en date du " + frDate(data.date) + ".";
      }
    })
    .catch(function () { /* on garde les valeurs de secours du HTML */ });

  /* ---------- 2) Tes taux (Google Sheet) ---------- */
  if (!SHEET_ID) return;

  var url = "https://docs.google.com/spreadsheets/d/" + SHEET_ID +
            "/gviz/tq?tqx=out:json&sheet=" + encodeURIComponent(SHEET_TAB);

  fetch(url)
    .then(function (r) { if (!r.ok) throw new Error("sheet indisponible"); return r.text(); })
    .then(function (text) {
      // La réponse gviz est enveloppée : /*O_o*/\ngoogle.visualization.Query.setResponse({...});
      var start = text.indexOf("{");
      var end = text.lastIndexOf("}");
      if (start === -1 || end === -1) throw new Error("format inattendu");
      var json = JSON.parse(text.substring(start, end + 1));
      var rows = (json.table && json.table.rows) || [];

      var out = [];
      var maj = "";
      rows.forEach(function (row, i) {
        var c = row.c || [];
        var val = function (n) { return c[n] && c[n].v != null ? String(c[n].v).trim() : ""; };
        var terme = val(0), type = val(1), taux = val(2), date = val(3);
        if (i === 0 && /terme/i.test(terme)) return; // ignorer une éventuelle ligne d'en-tête
        if (!terme && !type && !taux) return;         // ignorer les lignes vides
        if (date && !maj) maj = date;
        var tapct = pct(taux) || (taux ? taux : "—");
        out.push("<tr><td>" + esc(terme) + "</td><td>" + esc(type) +
                 "</td><td><strong>" + esc(tapct) + "</strong></td></tr>");
      });

      var body = document.getElementById("rates-body");
      if (body && out.length) body.innerHTML = out.join("");

      var src = document.getElementById("rate-taux-source");
      if (src) src.textContent = maj ? "Nos taux — mis à jour le " + majText(maj) + "." : "";
    })
    .catch(function () { /* on garde les valeurs de secours du HTML */ });

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  }
  function majText(v) {
    // Accepte "2026-07-16" ou un texte libre déjà lisible
    var f = frDate(v);
    return f || esc(v);
  }
})();
