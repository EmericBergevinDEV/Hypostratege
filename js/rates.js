/* =========================================================
   Hypostratège — Affichage des taux (100 % statique)

   Deux sources, aucune ne demande de toucher au code :
   1) data/rates-marche.json — taux de référence de la Banque du Canada,
      régénéré chaque jour par le robot GitHub Actions.
   2) Un Google Sheet — le tableau comparatif (banque vs PlaniPrêt).
      Modifiable depuis un téléphone, sans git push.

   Astuce : dans la colonne « Taux banque », écrivez « auto » pour que
   la valeur soit tirée automatiquement de la Banque du Canada
   (fonctionne pour 1 an fixe, 3 ans fixe, 5 ans fixe et marge de crédit).

   Si une source est indisponible, les valeurs de secours inscrites
   dans le HTML restent affichées : le tableau n'est jamais brisé.
   ========================================================= */
(function () {
  var SHEET_ID = "1srRVqKfzS5V6Or_WL2On4t5iJ1QUbYSGmYyGe397b08";
  var SHEET_TAB = "Taux";

  /* ---------- Utilitaires ---------- */

  var frDate = function (v) {
    if (!v) return "";
    // Google renvoie les cellules de type date sous la forme Date(2026,6,23)
    // (le mois y est compté à partir de 0).
    var g = /^Date\((\d+),(\d+),(\d+)\)$/.exec(String(v).trim());
    var d = g ? new Date(+g[1], +g[2], +g[3])
              : new Date(String(v).length <= 10 ? v + "T00:00:00" : v);
    if (isNaN(d)) return "";
    try { return d.toLocaleDateString("fr-CA", { day: "numeric", month: "long", year: "numeric" }); }
    catch (e) { return d.toISOString().slice(0, 10); }
  };

  var pct = function (v) {
    if (v === null || v === undefined || v === "") return null;
    var s = String(v).trim();
    // Garde-fou : une cellule que Google a convertie en date (ex. « 4.04 » lu
    // comme le 4 avril) ne doit JAMAIS être affichée comme un taux. On préfère
    // un tiret visible à un chiffre faux sur un site public.
    if (/^Date\(/.test(s)) return null;
    var n = parseFloat(s.replace(",", ".").replace(/[^\d.\-]/g, ""));
    if (isNaN(n) || n < 0 || n > 30) return null;   // hors de toute plage plausible
    return n.toFixed(2).replace(".", ",") + " %";
  };

  var esc = function (s) {
    return String(s).replace(/[&<>"]/g, function (ch) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch];
    });
  };

  var cellText = function (c) { return c && c.v != null ? String(c.v).trim() : ""; };

  /* ---------- 1) Taux de référence (Banque du Canada) ---------- */

  var chargerMarche = function () {
    return fetch("/data/rates-marche.json", { cache: "no-store" })
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
        return data;
      })
      .catch(function () { return null; });
  };

  // Fait correspondre un libellé de ligne à une série de la Banque du Canada.
  var valeurAuto = function (libelle, marche) {
    if (!marche) return null;
    var l = libelle.toLowerCase();
    if (/marge|pr[ée]f[ée]rentiel/.test(l)) return marche.prime;
    if (!/fixe/.test(l)) return null;
    if (/\b1\s*an\b/.test(l)) return marche.conventionnel_1an;
    if (/\b3\s*ans?\b/.test(l)) return marche.conventionnel_3ans;
    if (/\b5\s*ans?\b/.test(l)) return marche.conventionnel_5ans;
    return null;
  };

  /* ---------- 2) Tableau comparatif (Google Sheet) ---------- */

  var chargerSheet = function (marche) {
    if (!SHEET_ID) return;
    var url = "https://docs.google.com/spreadsheets/d/" + SHEET_ID +
              "/gviz/tq?tqx=out:json&sheet=" + encodeURIComponent(SHEET_TAB);

    fetch(url)
      .then(function (r) { if (!r.ok) throw new Error("tableur indisponible"); return r.text(); })
      .then(function (text) {
        var start = text.indexOf("{"), end = text.lastIndexOf("}");
        if (start === -1 || end === -1) throw new Error("format inattendu");
        var json = JSON.parse(text.substring(start, end + 1));
        var rows = (json.table && json.table.rows) || [];

        // Repérer la position réelle de chaque colonne : le tableur peut
        // contenir des colonnes en trop ou dans un autre ordre.
        var idx = null, headerRow = -1;

        // 1) Cas normal : Google a reconnu la ligne de titres et la fournit
        //    comme libellés de colonnes (les données commencent alors à la ligne 0).
        var entetes = {};
        ((json.table && json.table.cols) || []).forEach(function (c, n) {
          var h = String((c && c.label) || "").toLowerCase();
          if (/banque/.test(h)) entetes.banque = n;
          else if (/planipr|notre|hypostrat/.test(h)) entetes.notre = n;
          else if (/type|pr[êe]t|terme/.test(h)) { if (entetes.type === undefined) entetes.type = n; }
          else if (/^(maj|mise)/.test(h)) entetes.maj = n;
        });
        if (entetes.type !== undefined && entetes.notre !== undefined) {
          idx = entetes; headerRow = -1;
        }

        // 2) Sinon : chercher la ligne de titres parmi les données.
        for (var r = 0; r < rows.length && idx === null; r++) {
          var cells = (rows[r] && rows[r].c) || [];
          var found = {};
          cells.forEach(function (c, n) {
            var h = cellText(c).toLowerCase();
            if (/banque/.test(h)) found.banque = n;
            else if (/planipr|notre|hypostrat/.test(h)) found.notre = n;
            else if (/type|pr[êe]t|terme/.test(h)) { if (found.type === undefined) found.type = n; }
            else if (/^(maj|mise)/.test(h)) found.maj = n;
          });
          if (found.type !== undefined && found.notre !== undefined) { idx = found; headerRow = r; }
        }
        // En-têtes introuvables : on garde les valeurs de secours du HTML.
        if (idx === null) return;

        // Colonne de date sans en-tête : prendre la 1re colonne de type date.
        if (idx.maj === undefined) {
          var cols = (json.table && json.table.cols) || [];
          for (var k = 0; k < cols.length; k++) {
            if (cols[k] && cols[k].type === "date") { idx.maj = k; break; }
          }
        }

        var out = [], maj = "";
        rows.forEach(function (row, i) {
          if (i <= headerRow) return;
          var c = row.c || [];
          var val = function (n) { return n === undefined ? "" : cellText(c[n]); };

          var type = val(idx.type), banque = val(idx.banque), notre = val(idx.notre), date = val(idx.maj);
          if (!type && !notre) return;                 // ligne vide
          if (date && !maj) maj = date;

          // « auto » dans la colonne banque : valeur tirée de la Banque du Canada.
          if (/^auto$/i.test(banque)) banque = valeurAuto(type, marche);

          out.push(
            "<tr><td>" + esc(type) + "</td>" +
            '<td class="rate-bank">' + esc(pct(banque) || "—") + "</td>" +
            "<td><strong>" + esc(pct(notre) || "—") + "</strong></td></tr>"
          );
        });

        var body = document.getElementById("rates-body");
        if (body && out.length) body.innerHTML = out.join("");

        var src = document.getElementById("rate-taux-source");
        if (src) src.textContent = maj ? "Nos taux — mis à jour le " + frDate(maj) + "." : "";
      })
      .catch(function () { /* valeurs de secours du HTML conservées */ });
  };

  /* ---------- Enchaînement ---------- */
  // Le marché est chargé en premier : ses valeurs alimentent le mot-clé « auto ».
  chargerMarche().then(chargerSheet);
})();
