/** @typedef {{t:number,x:number,y:number}} Keyframe */
/** @typedef {{id:number,role:string,keys:Keyframe[]}} PlayerTrack */
/** @typedef {{start:number,end:number,from:number|null,to:number}} Pass */
/** @typedef {{start:number,title:string,description:string}} Phase */
/** @typedef {{id:string,name:string,description:string,category:string,derivedFrom:string|null,duration:number,tracks:Record<number,PlayerTrack>,passes:Pass[],phases:Phase[]}} Play */

export const PLAYER_IDS = [9, 10, 11, 12, 13, 14, 15];
export const ROLES = {9:'Mediano di mischia',10:'Apertura',11:'Ala destra',12:'Primo centro',13:'Secondo centro',14:'Ala sinistra',15:'Estremo'};
export const CATEGORIES = [{id:'trequarti',name:'Attacco trequarti'},{id:'mischia',name:'Giocate da mischia'},{id:'touche',name:'Giocate da touche'},{id:'difesa',name:'Giocate difensive'}];
const duration = 12.6;
const key = rows => rows.map(([t,x,y]) => ({t,x,y}));
const track = (id,rows) => ({id,role:ROLES[id],keys:key(rows)});

// Coordinate logiche nel viewBox 700 × 850. Y diminuisce verso la meta.
// Le posizioni iniziali provengono dal riferimento HTML originale.
const common = {
  10:track(10,[[0,434,490],[1.45,427,483],[2,415,466],[2.9,381,440],[3.4,363,421],[4.15,337,402],[4.65,322,392],[6,315,383],[12.6,310,380]]),
  12:track(12,[[0,343,551],[1.45,350,540],[2,358,519],[2.9,366,480],[3.4,384,455],[4.15,423,410],[4.65,434,403],[6.5,445,386],[12.6,445,385]]),
  13:track(13,[[0,238,605],[1.45,238,585],[2,238,562],[2.9,238,520],[3.4,238,496],[4.15,238,463],[4.65,238,442],[5.4,238,411],[6.55,238,354],[7.15,238,331],[8,238,310],[12.6,238,302]]),
  15:track(15,[[0,240,743],[1.45,229,724],[2,210,690],[2.9,186,637],[3.4,174,599],[4.15,166,544],[4.65,164,516],[5.4,164,455],[6.55,164,379],[7.15,164,357],[8,164,320],[9.05,164,282],[10,162,267],[12.6,157,259]]),
  14:track(14,[[0,94,663],[1.45,94,651],[2,94,631],[2.9,94,601],[3.4,94,583],[4.15,94,558],[4.65,94,539],[5.4,94,506],[6.55,94,456],[7.15,94,415],[8,94,386],[9.05,94,353],[9.55,94,334],[10.5,94,276],[12.6,94,184]])
};
const initialPasses = [
  {start:.68,end:.98,from:null,to:9},
  {start:1.55,end:2.02,from:9,to:10},
  {start:4.15,end:4.65,from:10,to:13}
];
const initialPhases = [
  {start:0,title:'Mischia vinta',description:'La mischia conquista il pallone. Il 9 si prepara a raccoglierlo.'},
  {start:1.5,title:'Il 9 apre sul 10',description:'Il mediano serve l’apertura. I trequarti salgono insieme; il 9 avvia la corsa di sostegno.'},
  {start:2.25,title:'Incrocio e finta',description:'Il 10 taglia verso sinistra e il 12 incrocia sulla diagonale opposta. Il 10 finge il passaggio e conserva il pallone.'},
  {start:4.15,title:'Il 10 serve il 13',description:'Dopo la finta, l’apertura passa all’indietro al secondo centro, che attacca diritto.'}
];

/** @type {Record<string,Play>} */
export const PLAYS = {
  X1:{
    id:'X1',name:'Uscita esterna',description:'Incrocio 10/12, uscita sul 13, inserimento del 15 e passaggio all’ala sinistra.',category:'trequarti',derivedFrom:null,duration,
    tracks:{...common,
      9:track(9,[[0,568,435],[.7,568,435],[1.5,552,425],[2.02,541,428],[3.4,503,466],[4.65,457,511],[6.55,392,574],[9.05,310,660],[12.6,240,725]]),
      11:track(11,[[0,568,591],[1,568,591],[1.5,553,586],[2.5,504,566],[3.4,456,543],[4.15,411,525],[4.65,383,508],[5.4,337,483],[6.55,268,448],[7.15,241,420],[8,191,375],[9.05,169,333],[9.55,164,325],[10.5,162,315],[12.6,157,305]])
    },
    passes:[...initialPasses,{start:6.55,end:7.15,from:13,to:15},{start:9.05,end:9.55,from:15,to:14}],
    phases:[...initialPhases,
      {start:5.45,title:'L’11 segue il pallone',description:'L’ala destra stringe da destra verso sinistra e si porta dietro al 15, senza ricevere.'},
      {start:6.55,title:'Il 13 serve il 15',description:'Il 13 avanza e passa all’estremo inserito alla propria sinistra. L’11 resta in sostegno.'},
      {start:9.05,title:'Il 15 libera il 14',description:'L’estremo serve l’ala sinistra, che corre diritto verso la meta. Il 9 raggiunge la copertura arretrata.'}
    ]
  },
  X2:{
    id:'X2',name:'Taglio interno',description:'Variante con l’11 che raddrizza prima della ricezione dal 13.',category:'trequarti',derivedFrom:'X1',duration,
    tracks:{...common,
      9:track(9,[[0,568,435],[.7,568,435],[1.5,552,425],[2.02,541,428],[2.5,526,431],[3.4,500,438],[4.15,470,445],[4.65,448,453],[5.5,420,469],[5.75,412,469],[5.98,405,466],[6.3,405,449],[6.85,405,416],[7.5,405,366],[8.4,405,306],[9.65,405,237],[12.6,405,183]]),
      10:track(10,[[0,434,490],[1.45,427,483],[2,415,466],[2.9,381,440],[3.4,363,421],[4.15,337,402],[4.65,322,392],[6,315,383],[6.3,301,373],[6.85,275,355],[7.5,250,330],[8.4,241,307],[9.65,235,283],[12.6,230,271]]),
      12:track(12,[[0,343,551],[1.45,350,540],[2,358,519],[2.9,366,480],[3.4,384,455],[4.15,423,410],[4.65,434,403],[6.5,445,386],[7.5,454,352],[8.4,463,316],[9.65,470,279],[12.6,480,220]]),
      11:track(11,[[0,568,591],[1,568,591],[1.5,545,582],[2.5,481,556],[3.4,418,532],[4.1,386,514],[4.35,379,508],[4.65,379,492],[5.15,379,470],[5.5,379,456],[5.98,379,438],[6.3,379,421],[6.85,379,388],[7.5,379,338],[8.4,379,278],[9.65,379,209],[12.6,379,155]]),
      13:track(13,[[0,238,605],[1.45,238,585],[2,238,562],[2.9,238,520],[3.4,238,496],[4.15,238,463],[4.65,238,442],[5.5,238,425],[5.98,238,418],[6.3,254,414],[6.85,280,400],[7.5,315,380],[8.4,340,307],[9.65,340,239],[12.6,340,185]]),
      15:track(15,[[0,240,743],[1.45,229,724],[2,210,690],[2.9,186,637],[3.4,174,599],[4.15,166,544],[4.65,164,516],[5.4,164,464],[6.3,164,425],[7.5,164,396],[9.65,164,362],[12.6,164,345]]),
      14:track(14,[[0,94,663],[1.45,94,651],[2,94,631],[2.9,94,601],[3.4,94,583],[4.15,94,558],[4.65,94,539],[5.4,94,508],[6.3,94,479],[7.5,94,448],[9.65,94,405],[12.6,94,385]])
    },
    passes:[...initialPasses,{start:5.5,end:5.98,from:13,to:11}],
    phases:[...initialPhases,
      {start:4.8,title:'L’11 raddrizza la corsa',description:'L’11 ha completato la diagonale ed è già orientato verso la meta. Il 13 avanza circa due metri.'},
      {start:5.5,title:'Il 13 serve l’11',description:'L’11 riceve già orientato verso la meta. Il 9 arriva dalla sinistra della mischia, 2–3 metri alla sua destra e poco dietro, senza fermarsi.'},
      {start:6.85,title:'Taglio interno',description:'L’11 accelera diritto. Il 9 lo accompagna sulla destra, il 13 converge in sostegno alla sua sinistra e il 12 continua la corsa alla destra del 9.'}
    ]
  }
};
