/**
 * L'API ne renvoie jamais d'unité monétaire (juste un BigDecimal). Le package du backend
 * (gn.projet.cotisation) et son domaine (tontines villageoises) situent le projet en Guinée :
 * on affiche donc les montants en Franc Guinéen (GNF), purement pour la présentation.
 */
export function formatMontant(value: number | null | undefined): string {
  if (value === null || value === undefined) {
    return '—';
  }
  return `${new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 0 }).format(value)} GNF`;
}

export function formatDate(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso.length === 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' }).format(date);
}

export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) {
    return '—';
  }
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) {
    return '—';
  }
  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

/** Pour un <input type="datetime-local"> : "2026-10-03T18:00" (sans timezone, comme LocalDateTime). */
export function toDateTimeLocalInput(iso: string | null | undefined): string {
  if (!iso) {
    return '';
  }
  return iso.slice(0, 16);
}
