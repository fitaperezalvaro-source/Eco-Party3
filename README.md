# Eco Party 2030

Joc de festa local en valencià, castellà i anglés, amb 1–4 persones, 2–4 participants en total i bots per a les places lliures. Els minijocs utilitzen torns en el mateix dispositiu. Cada ronda del tauler inclou un minijoc.

## Inici i publicació

- **Netlify Drop:** descomprimeix el ZIP i arrossega la carpeta `eco-party-2030` amb `index.html` a [Netlify Drop](https://app.netlify.com/drop). Obri l’URL HTTPS que et done Netlify.
- **En local:** des de la carpeta del projecte, executa `python3 -m http.server 8000` i obri `http://localhost:8000`. Els mòduls JavaScript necessiten una URL HTTP o HTTPS.
- El lloc és estàtic, sense instal·lació de dependències ni pas de compilació. `netlify.toml` publica el directori arrel. Conserva `simulator/`, ja que el joc importa la seua aspiració i el seu àudio.
- Pots excloure `docs/` i `tests/` de la carpeta pública. Per a actualitzar, puja de nou els fitxers en el mateix lloc de Netlify.

## Regles

Juga al tauler, tria un minijoc lliure o entra en Desafiament Eco. Configura 2, 4 o 6 rondes per al tauler. Tira el dau i completa l’esdeveniment. Cada 25 EcoPunts donen una estrela. Les marques i les preferències es guarden en el navegador. El simulador original està disponible en **Crèdits**. Les partides en curs es reinicien si ixes.

## Fitxers i proves

- `src/data.js`: personatges, enciclopèdia, caselles i regles textuals de les proves.
- `src/model.js`: estat del tauler, punts i guardat.
- `src/arcade.js`: models dels huit minijocs i bots.
- `src/ui.js` i `src/style.css`: tauler, personatges i estils adaptables.
- `src/main.js`: pantalles, controls i bucles de joc.
- `simulator/`: còpia d’Eco Blower 2030 V3 amb les proves originals.
- `docs/`: guia, memòria, presentació, guió i captures reals.
- `npm test`: proves d’Eco Party. `npm --prefix simulator test`: proves originals d’Eco Blower.

Per a editar la presentació, puja l’arxiu PPTX a Canva des del navegador d’escriptori. Per al vídeo, seguix el guió en valencià i grava el navegador amb el micròfon.
