# ECO BLOWER 2030 V3

Simulador de recollida selectiva en valencià i castellà. Explora el parc, aspira residus al dipòsit i entrega cada material a la seua estació. Les missions obrin la platja, el bosc i la ciutat.

## Jugar

Obri `EcoBlower2030_V3.html` en un navegador actual. Per a executar el codi modular, obri un terminal en la carpeta del projecte, executa `python -m http.server 8000` i visita http://localhost:8000.

- Mou-te amb WASD o les fletxes. Apunta amb el ratolí i mantín el clic esquerre o l’espai per a aspirar. En mòbil, usa el joystick, toca el món per a apuntar i mantín el botó de la dreta.
- Acosta’t a l’estació compatible i prem E o el botó en pantalla. Els altres materials es queden al dipòsit. Buida’l abans de viatjar o renàixer.
- U obri les millores, V les aspiradores, M el mapa i Esc la pausa.

## Recuperació i manteniment

Cada regió té quatre zones amb una quota de recuperació. Quan aspires un residu, el material desapareix del terreny i el joc guarda la seua zona d’origen. Quan el recicles, contribuïx al percentatge de neteja d’eixa zona. En completar-la, reps una recompensa única i cessa la regeneració allí. El mapa mostra els percentatges locals i el total. La vegetació i les decoracions canvien amb la recuperació.

El punt de **Manteniment** està al sud de l’estació d’envasos. Acosta’t, prem E amb el dipòsit buit i selecciona una donació. Porta els materials a l’estació corresponent per a guanyar un 25 % extra. Les donacions compten per a les missions de reciclatge del cicle i la neteja del mapa es manté.

El renaixement reinicia les compres i les missions del cicle. La recuperació ambiental, els residus pendents al món, els assoliments, les EcoGemmes i les millores permanents es conserven.

## Guardat i versions

V3 guarda les partides amb una clau pròpia de localStorage. Les versions V1 i V2 es poden importar si estan en el mateix origen del navegador. El joc distribuïx el progrés ambiental anterior entre les zones, amb recuperació completa per als mapes amb una fita educativa. El guardat antic queda disponible.

## Publicar en Netlify

Descomprimix el ZIP. Arrossega la carpeta `EcoBlower2030_V3`, que conté `index.html`, `src` i `netlify.toml`, a [Netlify Drop](https://app.netlify.com/drop). Si connectes un repositori, configura la carpeta del joc com a base, deixa el comandament de compilació buit i publica `.`.

## Proves

Executa `npm test` amb Node. Les proves cobrixen marges i accessos en els quatre mapes, reaparició amb límits, aspiració, dipòsit, recompenses, campanyes, renaixement i migració.
