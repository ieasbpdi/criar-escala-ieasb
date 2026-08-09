export const DEFAULT_MEMBERS = [
  'Pastor Valter',
  'Missionária Maria',
  'Diácono Regivaldo',
  'Diácono José Yago',
  'Diácono ERIVÂNIO',
  'Diácono NOELCIO',
  'Diácono Josué',
  'Auxiliar Kauã',
  'Auxiliar Diego',
  'Auxiliar Benedito',
  'Irmã Clévia',
  'Irmã Simone',
  'Irmã Verônica',
  'Irmã Maria José',
  'Irmã Keila',
  'Irmã Edilma',
  'Irmã Josefa',
  'Irmã Thayllane',
  'Irmã Vanessa',
  'Irmão Daniel',
  'Irmã Vitória',
  'Irmã Khauany',
  'Irmã Sofia',
  'Irmão Vinícius',
  'Irmão Maxswell',
  'Irmão Melqui Samuel',
  'Irmã Júlia',
  'Irmão Tharlyson'
];

function getCategoryOrder(name) {
  const lower = name.toLowerCase();
  if (lower.startsWith('pastor')) return 1;
  if (lower.startsWith('missionária') || lower.startsWith('missionaria')) return 2;
  if (lower.startsWith('diácono') || lower.startsWith('diacono') || lower.startsWith('diáconos')) return 3;
  if (lower.startsWith('auxiliar')) return 4;
  return 5; // Irmã, Irmão e demais
}

function getCleanNameForSort(name) {
  return name
    .replace(/^(pastor|missionária|missionaria|diácono|diacono|auxiliar|irmã|irma|irmão|irmao)\s+/i, '')
    .trim();
}

export function sortMembers(members) {
  // Remove duplicadas mantendo uniques
  const uniqueMembers = Array.from(new Set(members));

  return uniqueMembers.sort((a, b) => {
    const catA = getCategoryOrder(a);
    const catB = getCategoryOrder(b);

    if (catA !== catB) {
      return catA - catB;
    }

    // Mesmo grupo: ordenar por nome alfabético
    const nameA = getCleanNameForSort(a);
    const nameB = getCleanNameForSort(b);
    return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
  });
}
