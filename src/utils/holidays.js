// Cálculo automático de feriados nacionais e datas comemorativas do Brasil para qualquer ano

function getEaster(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day);
}

function addDays(date, days) {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// Retorna o N-ésimo domingo de um mês específico
function getNthSunday(year, monthIndex, n) {
  let count = 0;
  for (let day = 1; day <= 31; day++) {
    const date = new Date(year, monthIndex, day);
    if (date.getMonth() !== monthIndex) break;
    if (date.getDay() === 0) { // Domingo
      count++;
      if (count === n) return date;
    }
  }
  return null;
}

export function getBrazilianHolidays(year) {
  const easter = getEaster(year);
  const goodFriday = addDays(easter, -2);
  const carnival = addDays(easter, -47);
  const corpusChristi = addDays(easter, 60);

  const mothersDay = getNthSunday(year, 4, 2); // 2º Domingo de Maio (Mês index 4)
  const fathersDay = getNthSunday(year, 7, 2);  // 2º Domingo de Agosto (Mês index 7)

  const holidays = [
    // Fixo
    { date: new Date(year, 0, 1), name: 'Ano Novo (Confraternização Universal)' },
    { date: new Date(year, 3, 21), name: 'Dia de Tiradentes' },
    { date: new Date(year, 4, 1), name: 'Dia do Trabalhador' },
    { date: new Date(year, 8, 7), name: 'Independência do Brasil' },
    { date: new Date(year, 9, 12), name: 'Dia de N. Sra. Aparecida / Dia das Crianças' },
    { date: new Date(year, 10, 2), name: 'Dia de Finados' },
    { date: new Date(year, 10, 15), name: 'Proclamação da República' },
    { date: new Date(year, 10, 20), name: 'Dia da Consciência Negra' },
    { date: new Date(year, 11, 25), name: 'Natal' },

    // Móveis religiosos
    { date: carnival, name: 'Carnaval' },
    { date: goodFriday, name: 'Sexta-Feira Santa' },
    { date: easter, name: 'Páscoa' },
    { date: corpusChristi, name: 'Corpus Christi' },
  ];

  if (mothersDay) holidays.push({ date: mothersDay, name: 'Culto de Dia das Mães' });
  if (fathersDay) holidays.push({ date: fathersDay, name: 'Culto de Dia das Pais' });

  return holidays;
}
