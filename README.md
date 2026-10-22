# TACTICS

Lavagna tattica animata per il rugby. La prima versione contiene X1 — Uscita esterna e X2 — Taglio interno.

## Struttura

- `src/plays.js`: catalogo, formazioni iniziali, keyframe, passaggi e fasi.
- `src/engine.js`: interpolazione deterministica, stato del pallone e controlli dei dati.
- `src/field.js`: rendering SVG del campo, della mischia, delle traiettorie e dei giocatori.
- `src/main.js`: interfaccia, timeline e riproduzione tramite `requestAnimationFrame`.
- `src/styles.css`: layout desktop e mobile.
- `service-worker.js`, `manifest.webmanifest`, `icons/`: installazione PWA e cache offline.
- `scripts/`: server locale e build senza dipendenze esterne.
- `tests/`: controlli delle sequenze tattiche.
- `references/`: riferimenti originali locali, esclusi da Git e dalla build.

## Uso locale

Richiede Node.js 20 o successivo. Non sono necessari pacchetti npm.

```sh
npm run dev
```

Aprire `http://localhost:4173/` in un browser. Per verificare la versione distribuibile:

```sh
npm test
npm run build
npm run preview
```

La build è in `dist/`. Non aprire `index.html` direttamente come file: service worker e installazione PWA richiedono HTTP su localhost oppure HTTPS.

## Pubblicazione con GitHub Pages

Il workflow `.github/workflows/pages.yml` pubblica solo `dist/`, senza i file originali in `references/`. Gli URL sono relativi alla cartella del repository e funzionano su `https://<utente>.github.io/<repository>/`.

1. Creare un repository GitHub vuoto, per esempio `tactics-rugby`, senza aggiungere file iniziali.
2. Collegarlo e caricare il branch: `git remote add origin https://github.com/<utente>/tactics-rugby.git` e `git push -u origin main`.
3. In **Settings → Pages → Build and deployment**, scegliere **GitHub Actions**.
4. Attendere che il workflow **Publish TACTICS to GitHub Pages** sia completato; aprire l'URL HTTPS mostrato nel deployment.

## Installazione mobile

Aprire prima la pagina HTTPS mentre si è online e attendere il caricamento completo.

- **iPhone/iPad:** Safari → Condividi → Aggiungi alla schermata Home → Aggiungi.
- **Android:** Chrome → menu ⋮ → Installa app oppure Aggiungi a schermata Home.

Aprire poi TACTICS dall'icona. X1, X2 e gli asset vengono memorizzati dal service worker. Una nuova build usa un identificatore di cache derivato dai file e sostituisce la cache precedente quando il nuovo service worker si attiva. Per vedere subito una nuova versione, chiudere e riaprire l'app dopo il primo caricamento online.

## Aggiungere una giocata

In `src/plays.js` aggiungere una voce a `PLAYS` con ID, nome, descrizione, categoria, eventuale `derivedFrom`, `duration`, tracce dei sette giocatori, passaggi e fasi. Ogni traccia contiene keyframe `{t,x,y}` ordinati; Y diminuisce verso la meta. I passaggi usano `{start,end,from,to}`. Il motore `src/engine.js` e il renderer non richiedono modifiche. Aggiungere un test della nuova sequenza, quindi eseguire `npm test` e `npm run build`.

Le categorie future sono dichiarate in `CATEGORIES`; non contengono giocate fittizie. Il modello dati a keyframe può essere modificato da un futuro editor grafico senza cambiare il motore.
