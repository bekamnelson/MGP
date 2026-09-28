import { INTERVALLES_DEFAULT, Matiere } from '../context/GradeContext';
import {
  calculerResultats,
  trouverIntervalle,
  trouverIntervalleParMgp,
  versSur20,
} from '../utils/calculator';

const gradeDe = (noteSur20: number) => trouverIntervalle(noteSur20, INTERVALLES_DEFAULT)?.grade;

describe('Barème par défaut', () => {
  it('couvre toutes les notes de 0 à 20 sans chevauchement', () => {
    const tries = [...INTERVALLES_DEFAULT].sort((a, b) => a.min - b.min);
    expect(tries[0].min).toBe(0);
    expect(tries[tries.length - 1].max).toBe(20);
    for (let k = 1; k < tries.length; k++) {
      // Chaque tranche commence juste après la précédente (convention X.99)
      expect(tries[k].min).toBeCloseTo(tries[k - 1].max + 0.01, 5);
    }
  });

  it('donne un grade et une appréciation à chaque tranche', () => {
    INTERVALLES_DEFAULT.forEach((i) => {
      expect(i.grade).toBeTruthy();
      expect(i.appreciation).toBeTruthy();
    });
  });
});

describe('trouverIntervalle', () => {
  it.each([
    [20, 'A+'],
    [18, 'A+'],
    [17.99, 'A'],
    [16, 'A'],
    [15.5, 'B+'],
    [13, 'B'],
    [12.5, 'B-'],
    [11, 'C+'],
    [10, 'C'],
    [9.5, 'C-'],
    [8, 'D'],
    [7, 'E'],
    [6.99, 'F'],
    [0, 'F'],
  ])('%p/20 donne le grade %s', (note, grade) => {
    expect(gradeDe(note)).toBe(grade);
  });

  it('ne laisse aucune note entre deux tranches', () => {
    expect(gradeDe(17.995)).toBe('A');
    expect(gradeDe(9.995)).toBe('C-');
    expect(gradeDe(6.995)).toBe('F');
  });

  it('attribue 0 de MGP en dessous de 7', () => {
    expect(trouverIntervalle(6.99, INTERVALLES_DEFAULT)?.gpa).toBe(0);
    expect(trouverIntervalle(7, INTERVALLES_DEFAULT)?.gpa).toBe(1);
  });

  it('ne trouve rien pour un barème vide', () => {
    expect(trouverIntervalle(15, [])).toBeUndefined();
  });
});

describe('trouverIntervalleParMgp', () => {
  it.each([
    [4, 'A+'],
    [3.7, 'A'],
    [2.85, 'B-'],
    [2.0, 'C'],
    [0.99, 'F'],
    [0, 'F'],
  ])('une MGP de %p donne le grade %s', (mgp, grade) => {
    expect(trouverIntervalleParMgp(mgp, INTERVALLES_DEFAULT)?.grade).toBe(grade);
  });

  it('tolère les erreurs d’arrondi des moyennes', () => {
    // (4×4 + 3.3×3) / 7 vaut 3.7, mais donne 3.6999999999999997 en JavaScript
    const mgp = (4 * 4 + 3.3 * 3) / 7;
    expect(mgp).toBeLessThan(3.7);
    expect(trouverIntervalleParMgp(mgp, INTERVALLES_DEFAULT)?.grade).toBe('A');
  });
});

describe('versSur20', () => {
  it('convertit les notes sur 100 et laisse les notes sur 20 inchangées', () => {
    expect(versSur20(75, 100)).toBe(15);
    expect(versSur20(65, 100)).toBe(13);
    expect(versSur20(15, 20)).toBe(15);
  });

  it('respecte la colonne /100 du barème', () => {
    const gradeSur100 = (note: number) => gradeDe(versSur20(note, 100));
    expect(gradeSur100(100)).toBe('A+');
    expect(gradeSur100(90)).toBe('A+');
    expect(gradeSur100(89.99)).toBe('A');
    expect(gradeSur100(65)).toBe('B');
    expect(gradeSur100(64.99)).toBe('B-');
    expect(gradeSur100(35)).toBe('E');
    expect(gradeSur100(34.99)).toBe('F');
  });
});

describe('calculerResultats', () => {
  const matieres: Matiere[] = [
    { id: 'a', nom: 'Analyse', cr: 4 },
    { id: 'b', nom: 'EPS', cr: 2 },
  ];

  it('renvoie des zéros quand aucune note n’est saisie', () => {
    expect(calculerResultats(matieres, {}, INTERVALLES_DEFAULT)).toEqual({
      moyenne: '0.00',
      mgp: '0.00',
      grade: '-',
      appreciation: '',
    });
  });

  it('calcule la moyenne et la MGP pondérées par les crédits', () => {
    // Moyenne : (15×4 + 6×2) / 6 = 12 ; MGP : (3.3×4 + 0×2) / 6 = 2.2
    expect(calculerResultats(matieres, { a: '15', b: '6' }, INTERVALLES_DEFAULT)).toEqual({
      moyenne: '12.00',
      mgp: '2.20',
      grade: 'C',
      appreciation: 'Passable',
    });
  });

  it('ignore les matières sans note', () => {
    const res = calculerResultats(matieres, { a: '18' }, INTERVALLES_DEFAULT);
    expect(res.moyenne).toBe('18.00');
    expect(res.mgp).toBe('4.00');
    expect(res.grade).toBe('A+');
  });

  it('ignore les notes invalides ou en cours de saisie', () => {
    const res = calculerResultats(matieres, { a: '.', b: '10' }, INTERVALLES_DEFAULT);
    expect(res.moyenne).toBe('10.00');
    expect(res.mgp).toBe('2.00');
  });

  it('ignore les matières sans crédit', () => {
    const res = calculerResultats(
      [...matieres, { id: 'c', nom: 'Bonus', cr: 0 }],
      { a: '12', c: '20' },
      INTERVALLES_DEFAULT
    );
    expect(res.moyenne).toBe('12.00');
  });

  it('donne la même MGP avec des notes sur 100', () => {
    const sur20 = calculerResultats(matieres, { a: '15', b: '6' }, INTERVALLES_DEFAULT, 20);
    const sur100 = calculerResultats(matieres, { a: '75', b: '30' }, INTERVALLES_DEFAULT, 100);
    expect(sur100.moyenne).toBe('60.00');
    expect(sur100.mgp).toBe(sur20.mgp);
    expect(sur100.grade).toBe(sur20.grade);
  });

  it('attribue 0 de MGP sans tranche correspondante', () => {
    const res = calculerResultats(matieres, { a: '15' }, []);
    expect(res.mgp).toBe('0.00');
    expect(res.grade).toBe('-');
  });
});
