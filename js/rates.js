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
  var SHEET_ID = "1srRVqKfzS5V6Or_WL2On4t5iJ1QUbYSGmYyGe397b08";
  var SHEET_TAB = "Taux";

  var frDate = function (iso) {
    if (!iso) return "";
    // Google Sheets renvoie les cellules de type date sous la forme Date(2026,6,23)
    // (le mois y est compté à partir de 0).
    var g = /^Date\((\d+),(\d+),(\d+)\)$/.exec(String(iso).trim());
    if (g) {
      var gd = new Date(+g[1], +g[2], +g[3]);
      try { return gd.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" }); }
      catch (e) { return g[3] + "/" + (+g[2] + 1) + "/" + g[1]; }
    }
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

      var cellText = function (c) { return c && c.v != null ? String(c.v).trim() : ""; };

      // Repérer la ligne d'en-tête et la position réelle de chaque colonne,
      // pour rester robuste si le tableur contient des colonnes en trop.
      var idx = null, headerRow = -1;
      for (var r = 0; r < rows.length && idx === null; r++) {
        var cells = (rows[r] && rows[r].c) || [];
        var found = {};
        cells.forEach(function (c, n) {
          var h = cellText(c).toLowerCase();
          if (/^terme/.test(h)) found.terme = n;
          else if (/^type/.test(h)) found.type = n;
          else if (/^taux/.test(h)) found.taux = n;
          else if (/^(maj|mise)/.test(h)) found.maj = n;
        });
        if (found.terme !== undefined && found.taux !== undefined) { idx = found; headerRow = r; }
      }
      // Repli : positions classiques si aucun en-tête n'a été trouvé
      if (idx === null) { idx = { terme: 0, type: 1, taux: 2, maj: 3 }; headerRow = -1; }

      // Si la colonne de mise à jour n'a pas d'en-tête, repérer la 1re colonne de type date.
      if (idx.maj === undefined) {
        var cols = (json.table && json.table.cols) || [];
        for (var k = 0; k < cols.length; k++) {
          if (cols[k] && cols[k].type === "date") { idx.maj = k; break; }
        }
      }

      var out = [];
      var maj = "";
      rows.forEach(function (row, i) {
        if (i <= headerRow) return;                   // sauter l'en-tête et ce qui précède
        var c = row.c || [];
        var val = function (n) { return n === undefined ? "" : cellText(c[n]); };
        var terme = val(idx.terme), type = val(idx.type), taux = val(idx.taux), date = val(idx.maj);
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
