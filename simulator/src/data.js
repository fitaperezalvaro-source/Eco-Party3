export const maps = [
  {name:['Parc urbà','Parque urbano'], mission:['Recupera els camins del parc','Recupera los senderos del parque'], goal:120, ids:[11,12,15], ground:'#76a957', path:'#d3bf83', seed:38, item:'carton'},
  {name:['Platja sostenible','Playa sostenible'], mission:['Deixa neta la vora de la mar','Deja limpia la orilla del mar'], goal:95, ids:[6,14], ground:'#d9be7e', path:'#efe0aa', seed:64, item:'glass'},
  {name:['Bosc en recuperació','Bosque en recuperación'], mission:['Classifica residus i prepara compost','Clasifica residuos y prepara compost'], goal:110, ids:[13,15], ground:'#5b935e', path:'#b9ad7d', seed:95, item:'twig'},
  {name:['Ciutat del futur','Ciudad del futuro'], mission:['Activa la xarxa de recollida selectiva','Activa la red de recogida selectiva'], goal:130, ids:[7,9,11], ground:'#91aa98', path:'#c2cbb9', seed:103, item:'chip'}
];
export const materials = {
  paper:{ bin:0,mass:.7,value:4 }, carton:{bin:0,mass:1,value:5}, bottle:{bin:1,mass:1,value:5}, can:{bin:1,mass:1.22,value:6},
  leaf:{bin:2,mass:.55,value:3}, twig:{bin:2,mass:.8,value:4}, glass:{bin:3,mass:1.6,value:8}, chip:{bin:4,mass:1.4,value:9}
};
export const bins = [
  {x:500,y:270,color:'#6aaeff',mark:'▤',name:['Paper','Papel']},{x:750,y:270,color:'#ffdc66',mark:'◇',name:['Envasos','Envases']},
  {x:1000,y:270,color:'#eaa671',mark:'❧',name:['Compost','Compost']},{x:1250,y:270,color:'#70eaa7',mark:'◈',name:['Vidre','Vidrio']},
  {x:1180,y:620,color:'#d6adff',mark:'↻',name:['Reutilització','Reutilización']}
];
export const upgrades = [
 ['Potència','Potencia','+16 % de força base','+16 % de fuerza base',90],
 ['Abast','Alcance','+14 unitats','+14 unidades',115],
 ['Eficiència','Eficiencia','Consum dividit per 1 + 0,16 × nivell','Consumo dividido por 1 + 0,16 × nivel',130],
 ['Bateria','Batería','+20 energia','+20 energía',100],
 ['Recàrrega','Recarga','+5 energia per segon','+5 energía por segundo',120],
 ['Mobilitat','Movilidad','+18 velocitat base','+18 velocidad base',110],
 ['Dipòsit','Depósito','+15 % de capacitat base','+15 % de capacidad base',95],
 ['Classificació','Clasificación','+3 % del valor base','+3 % del valor base',125]
];
// Names, price, storage, suction, extra reach, energy draw, tint and cone half-angle.
export const tools = [
 ['Bàsica','Básica',0,25,1,0,1,'#c7f474',.42],
 ['Mini','Mini',260,45,1.4,17,.98,'#73d4ff',.47],
 ['Plus','Plus',800,80,2,30,.94,'#ffce69',.53],
 ['Turbo','Turbo',3600,150,3,45,1.04,'#f28aaa',.59],
 ['Solar','Solar',12500,300,4.5,61,.73,'#f7ef8b',.64],
 ['Industrial','Industrial',46000,600,7,83,.85,'#ff995c',.70],
 ['Quantum','Quantum',215000,1200,11,107,.73,'#b0a0ff',.76],
 ['2030','2030',900000,2500,18,140,.65,'#78ffe8',.82]
];
export const sizes={paper:1,carton:3,bottle:2,can:2,leaf:1,twig:2,glass:5,chip:5};
export const regionRate=[1,2.25,4.8,9.2];
export const upgradeGrowth=1.6;
export const prestige=[
 ['Potència permanent','Potencia permanente',.05],
 ['Dipòsit permanent','Depósito permanente',.10],
 ['Mobilitat permanent','Movilidad permanente',.05],
 ['Reciclatge permanent','Reciclaje permanente',.05]
];
export const ods = [
 ['Fi de la pobresa','Fin de la pobreza','#e5243b','Facilitar l’accés a recursos i serveis bàsics.','Facilitar el acceso a recursos y servicios básicos.'],
 ['Fam zero','Hambre cero','#af7d23','Col·laborar amb un banc d’aliments.','Colaborar con un banco de alimentos.'],
 ['Salut i benestar','Salud y bienestar','#4c9f38','Fer activitat física en espais públics segurs.','Hacer actividad física en espacios públicos seguros.'],
 ['Educació de qualitat','Educación de calidad','#c5192d','Compartir materials d’estudi accessibles.','Compartir materiales de estudio accesibles.'],
 ['Igualtat de gènere','Igualdad de género','#dc422b','Repartir les responsabilitats sense estereotips.','Repartir las responsabilidades sin estereotipos.'],
 ['Aigua neta i sanejament','Agua limpia y saneamiento','#007995','Evitar tirar residus al clavegueram.','Evitar tirar residuos al alcantarillado.'],
 ['Energia assequible i no contaminant','Energía asequible y no contaminante','#997100','Aprofitar l’energia solar quan siga viable.','Aprovechar la energía solar cuando sea viable.'],
 ['Treball decent i creixement econòmic','Trabajo decente y crecimiento económico','#a21942','Promoure condicions de treball segures i justes.','Promover condiciones de trabajo seguras y justas.'],
 ['Indústria, innovació i infraestructura','Industria, innovación e infraestructura','#b94415','Dissenyar equips reparables.','Diseñar equipos reparables.'],
 ['Reducció de les desigualtats','Reducción de las desigualdades','#bb1362','Fer accessibles els espais i serveis.','Hacer accesibles los espacios y servicios.'],
 ['Ciutats i comunitats sostenibles','Ciudades y comunidades sostenibles','#9b6100','Cuidar els parcs i millorar la mobilitat a peu.','Cuidar los parques y mejorar la movilidad a pie.'],
 ['Producció i consum responsables','Producción y consumo responsables','#946923','Reduir compres innecessàries, reparar i separar residus.','Reducir compras innecesarias, reparar y separar residuos.'],
 ['Acció pel clima','Acción por el clima','#3f7e44','Millorar l’eficiència energètica i les opcions de transport.','Mejorar la eficiencia energética y las opciones de transporte.'],
 ['Vida submarina','Vida submarina','#006fa1','Recollir residus de la platja abans que arriben a la mar.','Recoger residuos de la playa antes de que lleguen al mar.'],
 ['Vida d’ecosistemes terrestres','Vida de ecosistemas terrestres','#437c20','Respectar la fullaraca que protegeix el sòl del bosc.','Respetar la hojarasca que protege el suelo del bosque.'],
 ['Pau, justícia i institucions sòlides','Paz, justicia e instituciones sólidas','#00689d','Participar en decisions comunitàries transparents.','Participar en decisiones comunitarias transparentes.'],
 ['Aliances per a aconseguir els objectius','Alianzas para lograr los objetivos','#19486a','Organitzar una jornada amb el centre educatiu i el barri.','Organizar una jornada con el centro educativo y el barrio.']
];

export const odsSummary = [
  ['Reduir la pobresa en totes les seues formes.','Reducir la pobreza en todas sus formas.'],
  ['Millorar l’accés a aliments suficients i nutritius.','Mejorar el acceso a alimentos suficientes y nutritivos.'],
  ['Afavorir la salut i el benestar en totes les edats.','Favorecer la salud y el bienestar a todas las edades.'],
  ['Garantir oportunitats d’aprenentatge accessibles i de qualitat.','Garantizar oportunidades de aprendizaje accesibles y de calidad.'],
  ['Defendre la igualtat de drets i oportunitats entre gèneres.','Defender la igualdad de derechos y oportunidades entre géneros.'],
  ['Garantir l’accés a aigua segura i sanejament.','Garantizar el acceso a agua segura y saneamiento.'],
  ['Facilitar l’accés a energia fiable, assequible i sostenible.','Facilitar el acceso a energía fiable, asequible y sostenible.'],
  ['Promoure entorns laborals dignes i segurs.','Promover entornos laborales dignos y seguros.'],
  ['Construir infraestructures resilients i fomentar la innovació sostenible.','Construir infraestructuras resilientes y fomentar la innovación sostenible.'],
  ['Reduir les desigualtats dins dels països i entre ells.','Reducir las desigualdades dentro de los países y entre ellos.'],
  ['Fer que els pobles i les ciutats siguen inclusius, segurs i sostenibles.','Hacer que los pueblos y las ciudades sean inclusivos, seguros y sostenibles.'],
  ['Reduir l’impacte ambiental de la producció i el consum.','Reducir el impacto ambiental de la producción y el consumo.'],
  ['Actuar davant del canvi climàtic i els seus efectes.','Actuar frente al cambio climático y sus efectos.'],
  ['Conservar els oceans i utilitzar responsablement els recursos marins.','Conservar los océanos y usar responsablemente los recursos marinos.'],
  ['Conservar la biodiversitat terrestre i recuperar els ecosistemes degradats.','Conservar la biodiversidad terrestre y recuperar los ecosistemas degradados.'],
  ['Promoure societats pacífiques, justícia accessible i institucions responsables.','Promover sociedades pacíficas, justicia accesible e instituciones responsables.'],
  ['Cooperar entre territoris i institucions per a assolir els objectius.','Cooperar entre territorios e instituciones para alcanzar los objetivos.']
];
