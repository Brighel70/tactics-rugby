# TACTICS

Lavagna tattica animata per il rugby. Il catalogo locale contiene X1 — Uscita esterna, X2 — Taglio interno, X3 — Giro largo e X4 — Dietro la schiena.

**App online:** https://brighel70.github.io/tactics-rugby/

La versione online viene aggiornata solo dopo una nuova pubblicazione; le modifiche locali si provano all'indirizzo indicato sotto.

## X3 — Giro largo

X3 è uno schema originale da mischia: 9 → 10 → 12 → 10 → 13 → 14. Dopo aver servito il 12, il 10 gira dietro di lui, riceve il passaggio di ritorno e apre verso l'esterno. Il 13 serve il 14; il 15 e il 13 si dispongono in sostegno, mentre l'11 segue l'azione e il 9 copre dietro.

Il giro del 10 si ispira all'esercizio «Loop the Loop» nei [materiali didattici di World Rugby](https://passport.world.rugby/media/jdscvk5f/t1-rugby-activities-final.pdf). La sequenza completa e le coordinate di X3 sono state create per TACTICS.

## X4 — Dietro la schiena

X4 segue la sequenza 9 → 10 → 12 → 15 → 14. Il 10 e il 12 avanzano ciascuno con il pallone per un ulteriore secondo prima del proprio passaggio: il 10 passa a 4,6 s e il 12 a 8 s. L'azione parte vicino alla linea di metà campo e il passaggio finale avviene ancora in quella zona. I giocatori attaccanti dal 10 al 15 sono arretrati di un metro; il 13 mantiene una corsia verticale e corre sempre diritto, quasi in linea con il 12 e appena più arretrato. Il 12 scarica dietro la schiena direttamente al 15, che corre dietro al 13 senza che il 13 tocchi il pallone. Dopo la ricezione il 15 accelera leggermente, si sposta a sinistra e passa al 14 senza rallentare. Il 9 e l'11 si spostano verso sinistra salendo leggermente per formare una copertura arretrata, con il 9 più avanti dell'11. Solo X4 mostra una difesa color mattone: otto uomini contrapposti in mischia, 9, 10, 12, 13 e 11 largo a sinistra, 14 a destra della mischia e 15 arretrato dietro il proprio 12. L'11 difensore resta sulla stessa linea orizzontale del 15 difensore per tutta l'azione. I difensori dal 10 alle ali partono almeno cinque metri dietro l'ultima fila della propria mischia. La mischia e i difensori dal 10 al 15 sono arretrati di un metro, mentre il 9 mantiene la posizione. La difesa avanza su traiettorie sincronizzate con la giocata; il 14 si stacca subito in diagonale verso la copertura profonda. Quando il 15 apre sul 14 attaccante, gli altri difensori convergono verso il lato del pallone e poi girano per inseguirlo; il 12 e il 13 difensivi seguono le corsie dei rispettivi attaccanti. La mischia spinge di poco e resta ingaggiata. Le traiettorie sono predefinite e non simulano ancora placcaggi o decisioni in risposta al pallone.

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

Su Windows fare doppio clic su `Apri-TACTICS-locale.cmd`, lasciare aperta la finestra che compare e aprire **http://localhost:4173/** in Chrome o Edge sullo stesso PC. Le modifiche salvate ai file compaiono ricaricando la pagina (Ctrl+F5 se il browser mostra ancora una versione precedente). Per interrompere il server premere Ctrl+C nella finestra. Questa prova usa i file locali e non pubblica nulla su GitHub.

Per avviare lo stesso server dal terminale:

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

Per una prova temporanea su un telefono o tablet collegato alla stessa rete Wi-Fi del PC, aprire `http://INDIRIZZO-IP-DEL-PC:4173/` nel browser del dispositivo mentre il server locale è aperto. `localhost` sul telefono indica il telefono stesso. Se Windows chiede l'autorizzazione al server, consentire l'accesso sulla rete privata. L'installazione PWA e la prova offline sul dispositivo richiedono invece un indirizzo HTTPS; la prova Wi-Fi serve a controllare animazioni e layout prima della pubblicazione.

## Pubblicazione con GitHub Pages

Il repository è `Brighel70/tactics-rugby`. A ogni push su `main`, il workflow `.github/workflows/pages.yml` esegue test e build, poi pubblica solo `dist/`. I file originali in `references/` restano locali. Gli URL relativi funzionano sotto `/tactics-rugby/`.

## Installazione mobile

Aprire prima la pagina HTTPS mentre si è online e attendere il caricamento completo.

- **iPhone/iPad:** Safari → Condividi → Aggiungi alla schermata Home → Aggiungi.
- **Android:** Chrome → menu ⋮ → Installa app oppure Aggiungi a schermata Home.

Aprire poi TACTICS dall'icona. X1, X2, X3, X4 e gli asset vengono memorizzati dal service worker dopo la pubblicazione della nuova versione. Una nuova build usa un identificatore di cache derivato dai file e sostituisce la cache precedente quando il nuovo service worker si attiva. Per vedere subito una nuova versione, chiudere e riaprire l'app dopo il primo caricamento online.

Se TACTICS era già stata aggiunta alla Home prima dell'aggiornamento dell'icona, rimuovere la vecchia icona e aggiungere di nuovo la pagina dal browser dopo che la nuova versione è stata pubblicata. iOS può conservare l'immagine della vecchia icona finché non viene aggiunta nuovamente.

## Aggiungere una giocata

In `src/plays.js` aggiungere una voce a `PLAYS` con ID, nome, descrizione, categoria, eventuale `derivedFrom`, `duration`, tracce dei sette giocatori, passaggi e fasi. Ogni traccia contiene keyframe `{t,x,y}` ordinati; Y diminuisce verso la meta. I passaggi usano `{start,end,from,to}` e possono specificare `arc` per dare una curvatura maggiore al volo del pallone. Il motore `src/engine.js` e il renderer non richiedono modifiche. Aggiungere un test della nuova sequenza, quindi eseguire `npm test` e `npm run build`.

Le categorie future sono dichiarate in `CATEGORIES`; non contengono giocate fittizie. Il modello dati a keyframe può essere modificato da un futuro editor grafico senza cambiare il motore.
