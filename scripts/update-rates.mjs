/**
 * Met à jour data/rates-marche.json à partir de l'API publique de la Banque du Canada
 * (API « Valet »). Exécuté automatiquement par GitHub Actions (voir .github/workflows/update-rates.yml).
 *
 * Aucune clé, aucun compte requis. Node 18+ (fetch intégré).
 */
import { writeFile } from 'node:fs/promises';

const VALET = 'https://www.bankofcanada.ca/valet/observations';
const SERIES = 'V80691311,V80691334,V80691335'; // Préférentiel, Conv. 3 ans, Conv. 5 ans
const BOND = 'BD.CDN.5YR.DQ.YLD';               // Obligation Gouv. Canada 5 ans

async function latest(series) {
  const res = await fetch(`${VALET}/${series}/json?recent=1`, {
    headers: { Accept: 'application/json' }
  });
  if (!res.ok) throw new Error(`Banque du Canada (${series}) : HTTP ${res.status}`);
  const json = await res.json();
  return json.observations?.[0] ?? null;
}

const num = (v) => (v === undefined || v === null || v === '' ? null : Number.parseFloat(v));

try {
  const o = await latest(SERIES);
  const b = await latest(BOND);

  const data = {
    source: 'Banque du Canada',
    date: o?.d ?? null,
    prime: num(o?.V80691311?.v),
    conventionnel_1an: num(o?.V80691333?.v),
    conventionnel_3ans: num(o?.V80691334?.v),
    conventionnel_5ans: num(o?.V80691335?.v),
    obligation_5ans: num(b?.[BOND]?.v),
    genere_le: new Date().toISOString()
  };

  // Sécurité : ne pas écraser avec des valeurs vides si l'API a renvoyé n'importe quoi
  if (data.prime == null && data.conventionnel_5ans == null) {
    throw new Error('Réponse inattendue : aucune valeur de taux trouvée.');
  }

  const out = new URL('../data/rates-marche.json', import.meta.url);
  await writeFile(out, JSON.stringify(data, null, 2) + '\n', 'utf8');
  console.log('✓ rates-marche.json mis à jour :', data);
} catch (err) {
  console.error('✗ Échec de la mise à jour des taux :', err.message);
  process.exit(1); // le workflow ne committera rien
}
