const UNITS = [
  '', 'un', 'deux', 'trois', 'quatre', 'cinq', 'six', 'sept', 'huit', 'neuf',
  'dix', 'onze', 'douze', 'treize', 'quatorze', 'quinze', 'seize', 'dix-sept', 'dix-huit', 'dix-neuf',
];
const TENS = ['', '', 'vingt', 'trente', 'quarante', 'cinquante', 'soixante', 'soixante-dix', 'quatre-vingt', 'quatre-vingt-dix'];

function deuxChiffres(n: number): string {
  if (n < 20) {
    return UNITS[n];
  }
  const dizaine = Math.floor(n / 10);
  const unite = n % 10;
  if (dizaine === 7 || dizaine === 9) {
    const base = dizaine === 7 ? 'soixante' : 'quatre-vingt';
    return `${base}-${UNITS[10 + unite]}`;
  }
  if (dizaine === 8) {
    return unite === 0 ? 'quatre-vingts' : `quatre-vingt-${UNITS[unite]}`;
  }
  if (unite === 0) {
    return TENS[dizaine];
  }
  if (unite === 1) {
    return `${TENS[dizaine]}-et-un`;
  }
  return `${TENS[dizaine]}-${UNITS[unite]}`;
}

function troisChiffres(n: number): string {
  const centaines = Math.floor(n / 100);
  const reste = n % 100;
  let texte = '';
  if (centaines > 0) {
    texte += centaines === 1 ? 'cent' : `${UNITS[centaines]} cent`;
    if (centaines > 1 && reste === 0) {
      texte += 's';
    }
    if (reste > 0) {
      texte += ' ';
    }
  }
  if (reste > 0) {
    texte += deuxChiffres(reste);
  }
  return texte;
}

/** Conversion d'un entier positif en toutes lettres françaises (ex: 203900 -> "deux cent trois mille neuf cents"). */
export function nombreEnLettres(valeur: number): string {
  const n = Math.round(Math.abs(valeur));
  if (n === 0) {
    return 'zéro';
  }

  const milliards = Math.floor(n / 1_000_000_000);
  const millions = Math.floor((n % 1_000_000_000) / 1_000_000);
  const milliers = Math.floor((n % 1_000_000) / 1000);
  const reste = n % 1000;

  const parts: string[] = [];
  if (milliards > 0) {
    parts.push(milliards === 1 ? 'un milliard' : `${troisChiffres(milliards)} milliards`);
  }
  if (millions > 0) {
    parts.push(millions === 1 ? 'un million' : `${troisChiffres(millions)} millions`);
  }
  if (milliers > 0) {
    parts.push(milliers === 1 ? 'mille' : `${troisChiffres(milliers)} mille`);
  }
  if (reste > 0) {
    parts.push(troisChiffres(reste));
  }
  return parts.join(' ');
}

/** Ex: 20000 -> "Vingt mille francs guinéens (GNF)". */
export function montantEnLettres(valeur: number): string {
  const mots = nombreEnLettres(valeur);
  const capitalise = mots.charAt(0).toUpperCase() + mots.slice(1);
  return `${capitalise} francs guinéens (GNF)`;
}
