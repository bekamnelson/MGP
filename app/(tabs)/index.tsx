import * as NavigationBar from 'expo-navigation-bar';
import { usePathname, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React, { useContext, useEffect, useState } from 'react';
import {
  Alert,
  BackHandler,
  FlatList,
  KeyboardAvoidingView, Platform,
  SafeAreaView,
  StyleSheet, Text,
  TextInput,
  ToastAndroid,
  TouchableOpacity,
  View
} from 'react-native';

// 1. Importation de AdMob
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';

import { GradeContext } from '../../context/GradeContext';
import { calculerResultats } from '../../utils/calculator';

// 2. Configuration de l'ID (Utilisez TestIds en développement)
export const ENABLE_REAL_ADS = false;

// Identifiant réel de votre bloc d'annonces
const PRODUCTION_BANNER_ID = 'ca-app-pub-5542646175321041/6113122329';

// Sélection automatique de l'ID d'annonce
export const adUnitIdFooter = ENABLE_REAL_ADS
  ? PRODUCTION_BANNER_ID
  : TestIds.BANNER;

export default function HomeScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const { matieres, intervalles, sauvegarderMatieres } = useContext(GradeContext);

  const [notes, setNotes] = useState<{ [key: string]: string }>({});
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
  }, [pathname, backPressedCount]);

  // Validation et mise à jour de la note
  const handleNoteChange = (id: string, text: string) => {
    const formattedText = text.replace(',', '.');

    if (formattedText === '') {
      const updatedNotes = { ...notes };
      delete updatedNotes[id];
      setNotes(updatedNotes);
      return;
    }

    const val = parseFloat(formattedText);

    if (isNaN(val)) return;

    if (val < 0 || val > 20) {
      Alert.alert("Note invalide", "La note doit être comprise entre 0 et 20.");
      return;
    }

    setNotes({ ...notes, [id]: formattedText });
  };

  const ajouterMatiere = () => {
    if (!nom || !credit || isNaN(parseFloat(credit))) {
      Alert.alert("Erreur", "Veuillez saisir un nom et un crédit valide.");
      return;
    }
    const nouvelleMatiere = {
      id: Date.now().toString(),
      nom: nom,
      cr: parseFloat(credit)
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

  const resultats = calculerResultats(matieres, notes, intervalles);

  return (
    <SafeAreaView style={styles.container}>
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

        <View style={styles.addZone}>
          <TextInput
            style={[styles.input, { flex: 2 }]}
            placeholder="Nom de l'UE"
            value={nom}
            onChangeText={setNom}
          />
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Crédit"
            keyboardType="numeric"
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
              <TextInput
                style={styles.noteInput}
                placeholder="Note"
                keyboardType="decimal-pad"
                maxLength={5}
                value={notes[item.id] || ''}
                onChangeText={(text) => handleNoteChange(item.id, text)}
              />
            </View>
          )}
        />
      </KeyboardAvoidingView>

      {/* SÉCURITÉ : BANNIÈRE UNIQUE EN BAS (Ne se recharge pas au scroll) */}
      <View style={styles.footerAdContainer}>
        <BannerAd
          unitId={adUnitIdFooter}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{ requestNonPersonalizedAdsOnly: true }}
        />
      </View>

      <View style={styles.footer}>
        <View style={styles.resItem}>
          <Text style={styles.label}>Moyenne /20</Text>
          <Text style={[styles.val, styles.valMoy]}>{resultats.moyenne}</Text>
        </View>
        <View style={[styles.resItem, styles.borderLeft]}>
          <Text style={styles.label}>MGP (4.0)</Text>
          <Text style={styles.val}>{resultats.mgp}</Text>
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
  btnSettingsText: { fontSize: 12, fontWeight: '600' },
  addZone: { flexDirection: 'row', padding: 12, backgroundColor: '#e2e8f0', margin: 10, borderRadius: 12, gap: 8 },
  input: { backgroundColor: '#fff', borderRadius: 8, paddingHorizontal: 10, height: 40 },
  btnAdd: { backgroundColor: '#3b82f6', justifyContent: 'center', paddingHorizontal: 12, borderRadius: 8 },
  btnAddText: { color: '#fff', fontWeight: 'bold', fontSize: 12 },
  card: { backgroundColor: '#fff', marginHorizontal: 10, marginBottom: 8, padding: 12, borderRadius: 10, flexDirection: 'row', alignItems: 'center', borderLeftWidth: 5, borderLeftColor: '#3b82f6' },
  btnRemove: { backgroundColor: '#ef4444', width: 22, height: 22, borderRadius: 11, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  btnRemoveText: { color: '#fff', fontSize: 10, fontWeight: 'bold' },
  info: { flex: 1 },
  courseName: { fontWeight: 'bold', fontSize: 14 },
  courseDetails: { fontSize: 12, color: '#94a3b8' },
  noteInput: { width: 60, height: 40, borderWidth: 1, borderColor: '#e2e8f0', borderRadius: 6, textAlign: 'center' },
  footer: { backgroundColor: '#0f172a', padding: 15, flexDirection: 'row', justifyContent: 'space-around', borderTopLeftRadius: 20, borderTopRightRadius: 20 },
  resItem: { alignItems: 'center' },
  borderLeft: { borderLeftWidth: 1, borderLeftColor: '#334155', paddingLeft: 20 },
  label: { color: '#94a3b8', fontSize: 10 },
  val: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
  valMoy: { color: '#60a5fa' },
  footerAdContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f1f5f9',
    paddingTop: 10,
    paddingBottom: 15,
  }
});