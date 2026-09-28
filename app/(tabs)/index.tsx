import * as NavigationBar from 'expo-navigation-bar';
import { usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  FlatList,
  KeyboardAvoidingView, Platform,
  StyleSheet, Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// 1. Importation de AdMob
import { BannerAd, BannerAdSize } from 'react-native-google-mobile-ads';

import { GradeContext, Systeme } from '../../context/GradeContext';
import { AD_UNIT_IDS, etatPubs, usePubsAutorisees } from '../../utils/ads';
import { calculerResultats, trouverIntervalle, versSur20 } from '../../utils/calculator';

// Note avec au plus 2 décimales (saisie en cours comprise, ex: "12.")
const FORMAT_NOTE = /^\d{0,3}(\.\d{0,2})?$/;
const SYSTEMES: Systeme[] = [20, 100];
// Crédit : nombre positif avec au plus 1 décimale
const FORMAT_CREDIT = /^\d{1,2}(\.\d)?$/;

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { matieres, intervalles, notes, systeme, sauvegarderMatieres, sauvegarderNotes, changerSysteme } = useContext(GradeContext);
  const pubsAutorisees = usePubsAutorisees();

  const [nom, setNom] = useState('');
  const [credit, setCredit] = useState('');
  const [backPressedCount, setBackPressedCount] = useState(0);

  // Configuration Immersive
  useEffect(() => {
    NavigationBar.setVisibilityAsync("hidden");
    NavigationBar.setBehaviorAsync("overlay-swipe");
  }, []);

  // Gestion du double appui retour
  useEffect(() => {
    const onBackPress = () => {
      if (pathname !== '/' && pathname !== '/index') {
        router.replace('/');
        return true;
      }

      if (backPressedCount === 0) {
        setBackPressedCount(1);
        ToastAndroid.show("Appuyez encore une fois pour quitter", ToastAndroid.SHORT);

        setTimeout(() => {
          setBackPressedCount(0);
        }, 2000);

        return true;
      } else if (backPressedCount === 1) {
        BackHandler.exitApp();
        return true;
      }

      return false;
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [pathname, backPressedCount, router]);

  // Validation et mise à jour de la note
  const handleNoteChange = (id: string, text: string) => {
    const formattedText = text.replace(/,/g, '.');

    if (formattedText === '') {
      const updatedNotes = { ...notes };
      delete updatedNotes[id];
      sauvegarderNotes(updatedNotes);
      return;
    }

    // Caractères non numériques ou plus de 2 décimales : on ignore la frappe
    if (!FORMAT_NOTE.test(formattedText)) return;

    const val = parseFloat(formattedText);

    if (!isNaN(val) && val > systeme) {
      Alert.alert("Note invalide", `La note doit être comprise entre 0 et ${systeme}.`);
      return;
    }

    sauvegarderNotes({ ...notes, [id]: formattedText });
  };

  const ajouterMatiere = () => {
    const nomPropre = nom.trim();
    const creditTexte = credit.trim().replace(',', '.');
    const creditVal = parseFloat(creditTexte);

    if (!nomPropre || !FORMAT_CREDIT.test(creditTexte) || creditVal <= 0) {
      Alert.alert("Erreur", "Veuillez saisir un nom et un crédit valide (nombre supérieur à 0).");
      return;
    }
    const nouvelleMatiere = {
      id: Date.now().toString(),
      nom: nomPropre,
      cr: creditVal
    };
    sauvegarderMatieres([...matieres, nouvelleMatiere]);
    setNom('');
    setCredit('');
  };

  const supprimerMatiere = (id: string, nomMatiere: string) => {
    Alert.alert(
      "Confirmation",
      `Voulez-vous supprimer "${nomMatiere}" ?`,
      [
        { text: "Annuler", style: "cancel" },
        {
          text: "Supprimer",
          style: "destructive",
          onPress: () => {
            const misesAJour = matieres.filter(m => m.id !== id);
            sauvegarderMatieres(misesAJour);
          }
        }
      ]
    );
  };

  const resultats = calculerResultats(matieres, notes, intervalles, systeme);

  // Grade de la tranche où tombe la note d'une UE (vide si pas de note)
  const gradeDeLaNote = (id: string) => {
    const note = parseFloat(notes[id]);
    return isNaN(note) ? undefined : trouverIntervalle(versSur20(note, systeme), intervalles)?.grade;
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right', 'bottom']}>
      <StatusBar hidden={true} />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Calculateur de Notes</Text>
            <Text style={styles.subtitle}>Dévoilez votre potentiel.</Text>
          </View>
          <TouchableOpacity
            style={styles.btnSettings}
            onPress={() => router.push('/settings')}
          >
            <Text style={styles.btnSettingsText}>⚙️ Barème</Text>
          </TouchableOpacity>
        </View>

        {/* Choix du système de notation */}
        <View style={styles.systemeZone}>
          <Text style={styles.systemeLabel}>Notes sur</Text>
          <View style={styles.systemeChoix}>
            {SYSTEMES.map((s) => (
              <TouchableOpacity
                key={s}
                style={[styles.systemeBtn, systeme === s && styles.systemeBtnActif]}
                onPress={() => changerSysteme(s)}
              >
                <Text style={[styles.systemeBtnText, systeme === s && styles.systemeBtnTextActif]}>
                  /{s}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.addZone}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Nom de l'UE"
            placeholderTextColor="#94a3b8"
            value={nom}
            onChangeText={setNom}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Crédit"
            placeholderTextColor="#94a3b8"
            keyboardType="decimal-pad"
            value={credit}
            onChangeText={setCredit}
          />
          <TouchableOpacity style={styles.btnAdd} onPress={ajouterMatiere}>
            <Text style={styles.btnAddText}>AJOUTER</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={matieres}
          keyExtractor={item => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <TouchableOpacity
                style={styles.btnRemove}
                onPress={() => supprimerMatiere(item.id, item.nom)}
              >
                <Text style={styles.btnRemoveText}>✕</Text>
              </TouchableOpacity>
              <View style={styles.info}>
                <Text style={styles.courseName}>{item.nom}</Text>
                <Text style={styles.courseDetails}>Crédits: {item.cr}</Text>
              </View>
              {gradeDeLaNote(item.id) && (
                <View style={styles.gradeBadge}>
                  <Text style={styles.gradeBadgeText}>{gradeDeLaNote(item.id)}</Text>
                </View>
              )}
              <TextInput
                style={styles.noteInput}
                placeholder="Note"
                placeholderTextColor="#94a3b8"
                keyboardType="decimal-pad"
                maxLength={6}
                value={notes[item.id] || ''}
                onChangeText={(text) => handleNoteChange(item.id, text)}
              />
            </View>
          )}
        />
      </KeyboardAvoidingView>

      {/* SÉCURITÉ : BANNIÈRE UNIQUE EN BAS (Ne se recharge pas au scroll) */}
      {pubsAutorisees && (
        <View style={styles.footerAdContainer}>
          <BannerAd
            unitId={AD_UNIT_IDS.banniereAccueil}
            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
            requestOptions={{ requestNonPersonalizedAdsOnly: true }}
            onAdOpened={() => { etatPubs.ignorerProchainRetour = true; }}
          />
        </View>
      )}

      <View style={styles.footer}>
        <View style={styles.resItem}>
          <Text style={styles.label}>Moyenne /{systeme}</Text>
          <Text style={[styles.val, styles.valMoy]}>{resultats.moyenne}</Text>
        </View>
        <View style={[styles.resItem, styles.borderLeft]}>
          <Text style={styles.label}>MGP (4.0)</Text>
          <Text style={styles.val}>{resultats.mgp}</Text>
        </View>
        <View style={[styles.resItem, styles.borderLeft]}>
          <Text style={styles.label}>Grade</Text>
          <Text style={[styles.val, styles.valGrade]}>{resultats.grade}</Text>
          {resultats.appreciation !== '' && (
            <Text style={styles.appreciation}>{resultats.appreciation}</Text>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f1f5f9' },
  header: { padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#0f172a' },
  subtitle: { fontSize: 12, color: '#64748b' },
  btnSettings: { backgroundColor: '#e2e8f0', padding: 8, borderRadius: 8 },
  btnSettingsText: { fontSize: 12, fontWeight: '600', color: '#0f172a' },
  systemeZone: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 15 },
  systemeLabel: { fontSize: 13, fontWeight: '600', color: '#334155' },
  systemeChoix: { flexDirection: 'row', backgroundColor: '#e2e8f0', borderRadius: 8, padding: 3 },
  systemeBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6 },
  systemeBtnActif: { backgroundColor: '#3b82f6' },
  systemeBtnText: { fontSize: 13, fontWeight: 'bold', color: '#475569' },
  systemeBtnTextActif: { color: '#fff' },
  addZone: { flexDirection: 'row', padding: 12, backgroundColor: '#e2e8f0', margin: 10, borderRadius: 12, gap: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, height: 40, color: '#0f172a' },
  btnAdd: { backgroundColor: '#3b82f6', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8 },
  btnAddText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: '#fff', marginHorizontal: 10, marginBottom: 8, padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#3b82f6' },
  btnRemove: { backgroundColor: '#ef4444', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  btnRemoveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  info: { flex: 1 },
  courseName: { fontWeight: 'bold', fontSize: 14, color: '#0f172a' },
  courseDetails: { fontSize: 12, color: '#94a3b8' },
  noteInput: { width: 60, height: 40, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, textAlign: 'center', color: '#0f172a' },
  footer: { backgroundColor: '#0f172a', padding: 15, flexDirection: 'row', justifyContent: 'space-around', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  resItem: { alignItems: 'center' },
  borderLeft: { borderLeftWidth: 1, borderLeftColor: '#334155', paddingLeft: 20 },
  label: { color: '#94a3b8', fontSize: 10 },
  val: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  valMoy: { color: '#60a5fa' },
  valGrade: { color: '#fbbf24' },
  appreciation: { color: '#94a3b8', fontSize: 10 },
  gradeBadge: { backgroundColor: '#dbeafe', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4, marginRight: 8, minWidth: 34, alignItems: 'center' },
  gradeBadgeText: { color: '#1d4ed8', fontWeight: 'bold', fontSize: 13 },
  footerAdContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingTop: 10,
    paddingBottom: 15,
  }
});