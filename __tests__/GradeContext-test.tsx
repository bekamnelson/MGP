import AsyncStorage from '@react-native-async-storage/async-storage';
import { act, renderHook } from '@testing-library/react-native';
import React, { ReactNode, useContext } from 'react';

import { GradeContext, GradeProvider, INTERVALLES_DEFAULT } from '../context/GradeContext';

const wrapper = ({ children }: { children: ReactNode }) => <GradeProvider>{children}</GradeProvider>;

const rendreContexte = () => renderHook(() => useContext(GradeContext), { wrapper });

const lireStockage = async (cle: string) => JSON.parse((await AsyncStorage.getItem(cle)) ?? 'null');

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('GradeProvider', () => {
  it('charge les valeurs par défaut au premier lancement', async () => {
    const { result } = await rendreContexte();

    expect(result.current.matieres.length).toBeGreaterThan(0);
    expect(result.current.intervalles).toEqual(INTERVALLES_DEFAULT);
    expect(result.current.notes).toEqual({});
    expect(result.current.systeme).toBe(20);
  });

  it('recharge les données sauvegardées', async () => {
    await AsyncStorage.multiSet([
      ['@matieres', JSON.stringify([{ id: 'x', nom: 'Chimie', cr: 3 }])],
      ['@notes', JSON.stringify({ x: '14' })],
      ['@systeme', '100'],
    ]);

    const { result } = await rendreContexte();

    expect(result.current.matieres).toEqual([{ id: 'x', nom: 'Chimie', cr: 3 }]);
    expect(result.current.notes).toEqual({ x: '14' });
    expect(result.current.systeme).toBe(100);
  });

  it('revient aux valeurs par défaut si les données sont illisibles', async () => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
    await AsyncStorage.setItem('@matieres', '{pas du json');

    const { result } = await rendreContexte();

    expect(result.current.matieres.length).toBeGreaterThan(0);
    expect(result.current.intervalles).toEqual(INTERVALLES_DEFAULT);
  });

  it('sauvegarde les notes', async () => {
    const { result } = await rendreContexte();

    await act(() => result.current.sauvegarderNotes({ '1': '12.5' }));

    expect(result.current.notes).toEqual({ '1': '12.5' });
    expect(await lireStockage('@notes')).toEqual({ '1': '12.5' });
  });

  it('efface la note d’une matière supprimée', async () => {
    const { result } = await rendreContexte();
    await act(() => result.current.sauvegarderNotes({ '1': '12', '2': '15' }));

    const sansLaPremiere = result.current.matieres.filter((m) => m.id !== '1');
    await act(() => result.current.sauvegarderMatieres(sansLaPremiere));

    expect(result.current.notes).toEqual({ '2': '15' });
    expect(await lireStockage('@matieres')).toEqual(sansLaPremiere);
    expect(await lireStockage('@notes')).toEqual({ '2': '15' });
  });

  it('convertit les notes quand on passe de /20 à /100 et inversement', async () => {
    const { result } = await rendreContexte();
    await act(() => result.current.sauvegarderNotes({ '1': '15', '2': '12.35' }));

    await act(() => result.current.changerSysteme(100));
    expect(result.current.systeme).toBe(100);
    expect(result.current.notes).toEqual({ '1': '75', '2': '61.75' });
    expect(await AsyncStorage.getItem('@systeme')).toBe('100');

    await act(() => result.current.changerSysteme(20));
    expect(result.current.systeme).toBe(20);
    expect(result.current.notes).toEqual({ '1': '15', '2': '12.35' });
  });

  it('ne change rien si le système est déjà sélectionné', async () => {
    const { result } = await rendreContexte();
    await act(() => result.current.sauvegarderNotes({ '1': '15' }));

    await act(() => result.current.changerSysteme(20));

    expect(result.current.notes).toEqual({ '1': '15' });
  });

  it('sauvegarde le barème', async () => {
    const { result } = await rendreContexte();
    const bareme = [{ id: 'z', min: 0, max: 20, gpa: 2, grade: 'C' }];

    await act(() => result.current.sauvegarderIntervalles(bareme));

    expect(result.current.intervalles).toEqual(bareme);
    expect(await lireStockage('@intervalles')).toEqual(bareme);
  });
});
