export const DEFAULT_MEMBERS = [];

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
  if (!members || !Array.isArray(members)) return [];
  const uniqueMembers = Array.from(new Set(members));

  return uniqueMembers.sort((a, b) => {
    const catA = getCategoryOrder(a);
    const catB = getCategoryOrder(b);

    if (catA !== catB) {
      return catA - catB;
    }

    const nameA = getCleanNameForSort(a);
    const nameB = getCleanNameForSort(b);
    return nameA.localeCompare(nameB, 'pt-BR', { sensitivity: 'base' });
  });
}
