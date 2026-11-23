export const profiles=[
 ['Brot','#b4ea78','#233d2c','leaf'],['Ona','#74d7fd','#36314e','wave'],['Sol','#fbc66f','#673b2a','sun'],
 ['Niu','#e9a4f0','#45304e','cap'],['Riu','#fa9e88','#503a24','wave'],['Llum','#eee88a','#272a46','sun'],
 ['Saba','#91dfbd','#443520','leaf'],['Bosc','#acc5fc','#292e3b','cap']
];
export const goals=[
 ['Fi de la pobresa','Fin de la pobreza','No poverty'],['Fam zero','Hambre cero','Zero hunger'],
 ['Salut i benestar','Salud y bienestar','Good health and well-being'],['Educació de qualitat','Educación de calidad','Quality education'],
 ['Igualtat de gènere','Igualdad de género','Gender equality'],['Aigua neta i sanejament','Agua limpia y saneamiento','Clean water and sanitation'],
 ['Energia assequible i no contaminant','Energía asequible y no contaminante','Affordable and clean energy'],['Treball digne i creixement econòmic','Trabajo decente y crecimiento económico','Decent work and economic growth'],
 ['Indústria, innovació i infraestructures','Industria, innovación e infraestructura','Industry, innovation and infrastructure'],['Reducció de les desigualtats','Reducción de las desigualdades','Reduced inequalities'],
 ['Ciutats i comunitats sostenibles','Ciudades y comunidades sostenibles','Sustainable cities and communities'],['Consum i producció responsables','Producción y consumo responsables','Responsible consumption and production'],
 ['Acció climàtica','Acción por el clima','Climate action'],['Vida submarina','Vida submarina','Life below water'],
 ['Vida terrestre','Vida de ecosistemas terrestres','Life on land'],['Pau, justícia i institucions sòlides','Paz, justicia e instituciones sólidas','Peace, justice and strong institutions'],
 ['Aliances per als objectius','Alianzas para lograr los objetivos','Partnerships for the goals']
];
export const games=[
 {id:'vac',icon:'◉',color:'#b8ee7b',goals:[11,12,15],name:['EcoVac Challenge','EcoVac Challenge','EcoVac Challenge'],desc:['Mantín premut un residu per a aspirar-lo. Buida el dipòsit al contenidor adequat.','Mantén pulsado un residuo para aspirarlo. Vacía el depósito en el contenedor adecuado.','Hold a piece of litter to vacuum it. Empty the tank at the matching bin.'],seconds:24},
 {id:'sort',icon:'♻',color:'#ffca77',goals:[12],name:['Reciclatge exprés','Reciclaje exprés','Recycling Express'],desc:['Classifica els residus de la cinta abans que s’acabe el temps.','Clasifica los residuos de la cinta antes de que termine el tiempo.','Sort the litter on the conveyor before the clock runs out.'],seconds:20},
 {id:'water',icon:'◇',color:'#80d9ff',goals:[6],name:['Gotes de vida','Gotas de vida','Drops of Life'],desc:['Gira els tres colzes fins que apunten en les mateixes direccions que els models. Comprova la connexió.','Gira los tres codos hasta que apunten en las mismas direcciones que los modelos. Comprueba la conexión.','Rotate three elbows to match the model directions, then check the connection.'],seconds:26},
 {id:'bike',icon:'↗',color:'#f9a0a9',goals:[11,13],name:['Carrera sostenible','Carrera sostenible','Sustainable Race'],desc:['Tria un carril amb fulla abans que arribe l’obstacle. Els obstacles només et fan perdre ritme.','Elige un carril con hoja antes de que llegue el obstáculo. Los obstáculos solo te hacen perder ritmo.','Pick a lane with a leaf before the obstacle reaches you. Obstacles only slow you down.'],seconds:22},
 {id:'solar',icon:'☀',color:'#fce06d',goals:[7],name:['Energia solar','Energía solar','Solar Energy'],desc:['Alinea el panell amb la posició del sol quan canvie. Com més temps coincidisquen, més energia.','Alinea el panel con la posición del sol cuando cambie. Cuanto más tiempo coincidan, más energía.','Follow the sun with your panel. The longer they align, the more energy you collect.'],seconds:22},
 {id:'forest',icon:'♣',color:'#83e1a3',goals:[15],name:['Bosc viu','Bosque vivo','Living Forest'],desc:['Planta en els terrenys buits. Respecta les plantes autòctones i la roca.','Planta en los terrenos vacíos. Respeta las plantas autóctonas y la roca.','Plant on empty soil. Leave existing native plants and rock in place.'],seconds:22},
 {id:'delivery',icon:'♡',color:'#f6adc9',goals:[2,10,11],name:['Repartiment solidari','Reparto solidario','Solidarity Delivery'],desc:['Porta cada lot al centre que el demana. Llig la necessitat abans de repartir.','Lleva cada lote al centro que lo pide. Lee la necesidad antes de repartir.','Bring each supply to the centre that requests it. Read the needs before you deliver.'],seconds:22},
 {id:'city',icon:'▦',color:'#b5bdf9',goals:[9,11],name:['Ciutat intel·ligent','Ciudad inteligente','Smart City'],desc:['Construeix dos serveis amb el pressupost exacte. Cada servei té un cost.','Construye dos servicios con el presupuesto exacto. Cada servicio tiene un coste.','Build two services within the exact budget. Each service has a cost.'],seconds:26}
];
export const tiles=[
 {id:'green',icon:'✦',color:'#b8ee7b',points:6,restore:1,name:['EcoPunts','EcoPuntos','EcoPoints']},
 {id:'blue',icon:'≈',color:'#80d9ff',points:9,restore:2,name:['Transport públic','Transporte público','Public transport']},
 {id:'orange',icon:'!',color:'#ffbb79',points:2,restore:2,game:true,name:['Repte','Reto','Challenge']},
 {id:'purple',icon:'✷',color:'#d9a8f4',points:4,restore:3,name:['Projecte comunitari','Proyecto comunitario','Community project']},
 {id:'ods',icon:'◎',color:'#fce06d',points:4,restore:4,game:true,name:['Activitat ODS','Actividad ODS','SDG activity']},
 {id:'mini',icon:'▶',color:'#f9a0a9',points:2,restore:1,game:true,name:['Minijoc','Minijuego','Minigame']},
 {id:'team',icon:'♡',color:'#83e1bc',points:5,restore:6,name:['Cooperació','Cooperación','Cooperation']}
];
export const route=[[12,64],[19,49],[29,43],[39,46],[47,34],[58,27],[70,32],[79,42],[86,54],[79,66],[66,67],[56,58],[46,68],[35,75],[24,75],[16,71]];
export const material=[
 ['Paper','Papel','Paper'],['Envasos','Envases','Packaging'],['Vidre','Vidrio','Glass'],['Orgànic','Orgánico','Organic']
];
export const items=[
 ['Full de paper','Hoja de papel','Sheet of paper'],['Botella de plàstic','Botella de plástico','Plastic bottle'],['Pot de vidre','Tarro de vidrio','Glass jar'],['Pell de plàtan','Piel de plátano','Banana peel'],
 ['Caixa de cartó','Caja de cartón','Cardboard box'],['Llanda','Lata','Can'],['Botella de vidre','Botella de vidrio','Glass bottle'],['Cor de poma','Corazón de manzana','Apple core']
];
