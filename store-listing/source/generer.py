"""Génère les visuels de la fiche Play Store (icône, bannière, captures).

Usage (depuis la racine du projet) : python store-listing/source/generer.py
Nécessite Python + Pillow et Google Chrome.
"""
import os
import subprocess
from pathlib import Path

from PIL import Image

RACINE = Path(__file__).resolve().parents[2]
SORTIE = RACINE / 'store-listing'
SOURCE = SORTIE / 'source'
CHROME = r'C:\Program Files\Google\Chrome\Application\chrome.exe'

# Données de démonstration (résultats calculés avec utils/calculator.ts)
MATIERES = [
    ('Formation bilingue 1', 2, '14.5', 'B+'),
    ('EPS 1', 1, '16', 'A'),
    ('Electromagnétisme 1', 4, '12.75', 'B-'),
    ('TP Physique', 4, '15', 'B+'),
    ('Mécanique du point', 4, '11.5', 'C+'),
    ('Chimie générale', 4, '13', 'B'),
    ('Algèbre générale', 4, '17', 'A'),
    ('Analyse réelle 1', 4, '10.5', 'C'),
    ('Algorithmique', 3, '18.5', 'A+'),
    ('ECM', 1, '12', 'B-'),
]
RESULTATS = {20: ('13.92', '3.00', 'B', 'Assez Bien'), 100: ('69.60', '3.00', 'B', 'Assez Bien')}

BAREME = [
    ('A+', 18, 20, 4.0), ('A', 16, 17.99, 3.7), ('B+', 14, 15.99, 3.3), ('B', 13, 13.99, 3.0),
    ('B-', 12, 12.99, 2.7), ('C+', 11, 11.99, 2.3), ('C', 10, 10.99, 2.0), ('C-', 9, 9.99, 1.7),
    ('D', 8, 8.99, 1.3), ('E', 7, 7.99, 1.0), ('F', 0, 6.99, 0.0),
]

POLICE = "'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

# --- Interface de l'application (reproduit les styles de app/(tabs)/index.tsx et app/settings.tsx)
CSS_APP = """
.app { width: 372px; height: 664px; background: #f1f5f9; display: flex; flex-direction: column;
       overflow: hidden; font-family: %s; color: #0f172a; }
.header { padding: 15px; display: flex; justify-content: space-between; align-items: center; }
.title { font-size: 20px; font-weight: 700; }
.subtitle { font-size: 12px; color: #64748b; }
.btn-settings { background: #e2e8f0; padding: 8px; border-radius: 8px; font-size: 12px; font-weight: 600; }
.systeme { display: flex; justify-content: space-between; align-items: center; margin: 0 15px; }
.systeme-label { font-size: 13px; font-weight: 600; color: #334155; }
.seg { display: flex; background: #e2e8f0; border-radius: 8px; padding: 3px; }
.seg div { padding: 6px 16px; border-radius: 6px; font-size: 13px; font-weight: 700; color: #475569; }
.seg .on { background: #3b82f6; color: #fff; }
.add { display: flex; gap: 8px; padding: 12px; background: #e2e8f0; margin: 10px; border-radius: 12px; }
.input { background: #fff; border-radius: 8px; padding: 0 10px; height: 40px; display: flex;
         align-items: center; font-size: 14px; color: #94a3b8; }
.btn-add { background: #3b82f6; color: #fff; font-weight: 700; font-size: 12px; padding: 0 12px;
           border-radius: 8px; display: flex; align-items: center; }
.list { flex: 1; overflow: hidden; }
.card { background: #fff; margin: 0 10px 8px; padding: 12px; border-radius: 10px; display: flex;
        align-items: center; border-left: 5px solid #3b82f6; }
.remove { background: #ef4444; width: 22px; height: 22px; border-radius: 11px; color: #fff; font-size: 10px;
          font-weight: 700; display: flex; align-items: center; justify-content: center; margin-right: 10px; flex: none; }
.info { flex: 1; }
.name { font-weight: 700; font-size: 14px; }
.details { font-size: 12px; color: #94a3b8; }
.badge { background: #dbeafe; border-radius: 6px; padding: 4px 8px; margin-right: 8px; min-width: 18px;
         text-align: center; color: #1d4ed8; font-weight: 700; font-size: 13px; }
.note { width: 60px; height: 40px; border: 1px solid #e2e8f0; border-radius: 6px; display: flex;
        align-items: center; justify-content: center; font-size: 14px; flex: none; }
.footer { background: #0f172a; padding: 15px; display: flex; justify-content: space-around;
          border-radius: 20px 20px 0 0; }
.res { display: flex; flex-direction: column; align-items: center; }
.res + .res { border-left: 1px solid #334155; padding-left: 20px; }
.label { color: #94a3b8; font-size: 10px; }
.val { color: #fff; font-size: 22px; font-weight: 700; }
.appr { color: #94a3b8; font-size: 10px; }
.navbar { background: #fff; height: 56px; display: flex; align-items: center; padding: 0 16px; gap: 24px;
          font-size: 20px; font-weight: 500; box-shadow: 0 1px 3px rgba(0,0,0,.12); position: relative; }
.content { flex: 1; padding: 15px; overflow: hidden; }
.head-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px; }
.reset { background: #fee2e2; color: #ef4444; font-size: 12px; font-weight: 700; padding: 8px 12px; border-radius: 8px; }
.form { background: #fff; padding: 12px; border-radius: 12px; margin-bottom: 15px; box-shadow: 0 1px 2px rgba(0,0,0,.08); }
.fields { display: flex; gap: 10px; margin-bottom: 10px; }
.field { flex: 1; }
.flabel { font-size: 11px; font-weight: 600; color: #475569; margin-bottom: 4px; }
.finput { background: #f8fafc; border: 1px solid #cbd5e1; border-radius: 8px; height: 44px; display: flex;
          align-items: center; justify-content: center; font-size: 14px; color: #94a3b8; }
.btn-tranche { background: #3b82f6; height: 42px; border-radius: 8px; color: #fff; font-size: 13px;
               font-weight: 700; display: flex; align-items: center; justify-content: center; }
.row { background: #fff; padding: 14px; border-radius: 10px; display: flex; align-items: center; margin-bottom: 8px; }
.rgrade { width: 36px; font-weight: 700; font-size: 15px; }
.rtext { flex: 1; font-size: 14px; color: #334155; }
.rgpa { font-weight: 700; color: #3b82f6; font-size: 15px; }
.rdel { color: #ef4444; font-weight: 700; font-size: 16px; padding: 0 8px; }
""" % POLICE


def ecran_accueil(systeme=20, debut=0):
    facteur = 1 if systeme == 20 else 5
    cartes = ''
    for nom, cr, note, grade in MATIERES[debut:]:
        valeur = note if facteur == 1 else f'{float(note) * facteur:g}'
        cartes += f'''<div class="card"><div class="remove">✕</div>
          <div class="info"><div class="name">{nom}</div><div class="details">Crédits: {cr}</div></div>
          <div class="badge">{grade}</div><div class="note">{valeur}</div></div>'''
    moy, mgp, grade, appr = RESULTATS[systeme]
    seg = ''.join(f'<div class="{"on" if s == systeme else ""}">/{s}</div>' for s in (20, 100))
    return f'''<div class="app">
      <div class="header"><div><div class="title">Calculateur de Notes</div>
        <div class="subtitle">Dévoilez votre potentiel.</div></div>
        <div class="btn-settings">⚙️ Barème</div></div>
      <div class="systeme"><div class="systeme-label">Notes sur</div><div class="seg">{seg}</div></div>
      <div class="add"><div class="input" style="flex:2">Nom de l'UE</div>
        <div class="input" style="flex:1">Crédit</div><div class="btn-add">AJOUTER</div></div>
      <div class="list">{cartes}</div>
      <div class="footer">
        <div class="res"><div class="label">Moyenne /{systeme}</div><div class="val" style="color:#60a5fa">{moy}</div></div>
        <div class="res"><div class="label">MGP (4.0)</div><div class="val">{mgp}</div></div>
        <div class="res"><div class="label">Grade</div><div class="val" style="color:#fbbf24">{grade}</div>
          <div class="appr">{appr}</div></div>
      </div></div>'''


def ecran_bareme():
    lignes = ''.join(
        f'''<div class="row"><div class="rgrade">{g}</div><div class="rtext">Note de {mn:g} à {mx:g}</div>
        <div class="rgpa">{gpa:.1f} MGP</div><div class="rdel">✕</div></div>'''
        for g, mn, mx, gpa in BAREME)
    champs = ''.join(f'<div class="field"><div class="flabel">{l}</div><div class="finput">{p}</div></div>'
                     for l, p in (('Note Min', 'ex: 12'), ('Note Max', 'ex: 13.99'), ('MGP', 'ex: 3.0'), ('Grade', 'ex: B+')))
    return f'''<div class="app">
      <div class="navbar"><span>←</span><span>Configuration du Barème</span></div>
      <div class="content">
        <div class="head-row"><div style="flex:1"><div class="title">Barème MGP</div>
          <div class="subtitle">Définissez la MGP pour chaque tranche de note (notes sur 20).</div></div>
          <div class="reset">🔄 Reset</div></div>
        <div class="form"><div class="fields">{champs}</div><div class="btn-tranche">+ Ajouter la tranche</div></div>
        {lignes}
      </div></div>'''


def page(largeur, hauteur, corps, css=''):
    return f'''<!doctype html><html><head><meta charset="utf-8"><style>
      * {{ box-sizing: border-box; margin: 0; padding: 0; }}
      html, body {{ width: {largeur}px; height: {hauteur}px; overflow: hidden; font-family: {POLICE}; }}
      {CSS_APP}
      {css}
    </style></head><body>{corps}</body></html>'''


CSS_CAPTURE = """
body { background: linear-gradient(160deg, #1e3a8a 0%, #0f172a 70%); color: #fff; position: relative; }
.halo { position: absolute; width: 900px; height: 900px; border-radius: 50%; top: 700px; left: 90px;
        background: radial-gradient(circle, rgba(59,130,246,.45), rgba(59,130,246,0) 65%); }
.legende { position: absolute; top: 110px; left: 70px; right: 70px; text-align: center; }
.legende h1 { font-size: 76px; line-height: 1.12; font-weight: 800; letter-spacing: -1px; }
.legende h1 em { font-style: normal; color: #fbbf24; }
.legende p { margin-top: 22px; font-size: 36px; color: #bfdbfe; }
.phone { position: absolute; left: 154px; top: 470px; width: 772px; height: 1356px; padding: 14px;
         border-radius: 64px; background: #020617; box-shadow: 0 40px 90px rgba(0,0,0,.55), 0 0 0 3px #334155; }
.screen { width: 744px; height: 1328px; border-radius: 50px; overflow: hidden; }
.screen .app { transform: scale(2); transform-origin: top left; }
"""


def capture(titre, sous_titre, ecran):
    corps = f'''<div class="halo"></div>
      <div class="legende"><h1>{titre}</h1><p>{sous_titre}</p></div>
      <div class="phone"><div class="screen">{ecran}</div></div>'''
    return page(1080, 1920, corps, CSS_CAPTURE)


CSS_BANNIERE = """
body { background: linear-gradient(120deg, #0f172a 0%, #1e3a8a 100%); color: #fff; position: relative; }
.halo { position: absolute; width: 700px; height: 700px; border-radius: 50%; right: -120px; top: -100px;
        background: radial-gradient(circle, rgba(59,130,246,.5), rgba(59,130,246,0) 65%); }
.gauche { position: absolute; left: 60px; top: 0; bottom: 0; width: 560px; display: flex;
          flex-direction: column; justify-content: center; }
.marque { display: flex; align-items: center; gap: 22px; margin-bottom: 26px; }
.marque img { width: 120px; height: 120px; border-radius: 28px; box-shadow: 0 10px 30px rgba(0,0,0,.4); }
.marque h1 { font-size: 64px; font-weight: 800; line-height: 1; }
.marque span { display: block; font-size: 22px; font-weight: 600; color: #93c5fd; margin-top: 6px; }
.accroche { font-size: 34px; font-weight: 700; line-height: 1.25; }
.accroche em { font-style: normal; color: #fbbf24; }
.puces { display: flex; gap: 12px; margin-top: 26px; }
.puces div { background: rgba(255,255,255,.12); border: 1px solid rgba(255,255,255,.2); border-radius: 999px;
             padding: 8px 18px; font-size: 18px; font-weight: 600; }
.resultat { position: absolute; right: 60px; top: 125px; width: 330px; background: #0f172a; border-radius: 28px;
            padding: 30px 24px; box-shadow: 0 30px 60px rgba(0,0,0,.5), 0 0 0 2px #334155; transform: rotate(-4deg); }
.resultat .ligne { display: flex; justify-content: space-between; align-items: baseline; padding: 12px 6px; }
.resultat .ligne + .ligne { border-top: 1px solid #334155; }
.resultat .l { color: #94a3b8; font-size: 20px; }
.resultat .v { font-size: 44px; font-weight: 800; }
"""


def banniere():
    icone = (SOURCE / 'icone-banniere.png').as_uri()
    corps = f'''<div class="halo"></div>
      <div class="gauche">
        <div class="marque"><img src="{icone}"><div><h1>MGP</h1><span>Calculateur de Notes</span></div></div>
        <div class="accroche">Votre <em>moyenne</em>, votre <em>MGP</em><br>et votre <em>grade</em> en un instant</div>
        <div class="puces"><div>Notes /20 ou /100</div><div>Barème LMD</div></div>
      </div>
      <div class="resultat">
        <div class="ligne"><span class="l">Moyenne /20</span><span class="v" style="color:#60a5fa">13.92</span></div>
        <div class="ligne"><span class="l">MGP (4.0)</span><span class="v">3.00</span></div>
        <div class="ligne"><span class="l">Grade</span><span class="v" style="color:#fbbf24">B</span></div>
      </div>'''
    return page(1024, 500, corps, CSS_BANNIERE)


def rendre(nom, html, largeur, hauteur):
    fichier_html = SOURCE / f'{nom}.html'
    fichier_html.write_text(html, encoding='utf-8')
    sortie = SORTIE / f'{nom}.png'
    subprocess.run([CHROME, '--headless=new', '--disable-gpu', '--hide-scrollbars',
                    '--force-device-scale-factor=1', '--allow-file-access-from-files',
                    f'--window-size={largeur},{hauteur}', f'--screenshot={sortie}',
                    fichier_html.as_uri()], check=True, capture_output=True)
    # Play Store : PNG sans transparence
    Image.open(sortie).convert('RGB').save(sortie)
    print('OK', sortie.relative_to(RACINE))


def main():
    os.makedirs(SOURCE, exist_ok=True)
    icone = Image.open(RACINE / 'assets/images/icon.png').convert('RGB')
    icone.resize((512, 512), Image.LANCZOS).save(SORTIE / 'icone-512.png')
    icone.resize((240, 240), Image.LANCZOS).save(SOURCE / 'icone-banniere.png')
    print('OK store-listing/icone-512.png')

    rendre('banniere-1024x500', banniere(), 1024, 500)
    rendre('capture-1-accueil', capture('Calculez votre <em>MGP</em><br>en un instant',
                                        'Moyenne pondérée par les crédits', ecran_accueil(20)), 1080, 1920)
    rendre('capture-2-sur-100', capture('Notes sur <em>20</em><br>ou sur <em>100</em>',
                                        'Vos notes sont converties automatiquement', ecran_accueil(100)), 1080, 1920)
    rendre('capture-3-grades', capture('Un <em>grade</em> pour<br>chaque UE',
                                       'De A+ à F, avec votre appréciation', ecran_accueil(20, debut=4)), 1080, 1920)
    rendre('capture-4-bareme', capture('Un barème <em>LMD</em><br>personnalisable',
                                       'Ajoutez ou modifiez vos tranches', ecran_bareme()), 1080, 1920)


if __name__ == '__main__':
    main()
