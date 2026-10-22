/** @typedef {{t:number,x:number,y:number}} Keyframe */
/** @typedef {{id:number,role:string,keys:Keyframe[],smooth?:boolean}} PlayerTrack */
/** @typedef {{start:number,end:number,from:number|null,to:number,arc?:number}} Pass */
/** @typedef {{start:number,title:string,description:string}} Phase */
/** @typedef {{scrum:[number,number][],scrumAdvance:{keys:Keyframe[]},tracks:Record<number,PlayerTrack>}} Defense */
/** @typedef {{id:string,name:string,description:string,category:string,derivedFrom:string|null,duration:number,tracks:Record<number,PlayerTrack>,passes:Pass[],phases:Phase[],scrumY?:number,scrumBall?:[number,number],defense?:Defense}} Play */

export const PLAYER_IDS = [9, 10, 11, 12, 13, 14, 15];
export const ROLES = {9:'Mediano di mischia',10:'Apertura',11:'Ala destra',12:'Primo centro',13:'Secondo centro',14:'Ala sinistra',15:'Estremo'};
export const CATEGORIES = [{id:'trequarti',name:'Attacco trequarti'},{id:'mischia',name:'Giocate da mischia'},{id:'touche',name:'Giocate da touche'},{id:'difesa',name:'Giocate difensive'}];
const duration = 12.6;
const x1Duration = 15;
const key = rows => rows.map(([t,x,y]) => ({t,x,y}));
const track = (id,rows) => ({id,role:ROLES[id],keys:key(rows)});
const curvedTrack = (id,rows) => ({...track(id,rows),smooth:true});
const oneMeterBack = playerTrack => ({...playerTrack,keys:playerTrack.keys.map(frame=>({...frame,y:frame.y-10}))});
const oneMeterBackForAttack = playerTrack => ({...playerTrack,keys:playerTrack.keys.map(frame=>({...frame,y:frame.y+10}))});

// Coordinate logiche nel viewBox 700 × 850. Y diminuisce verso la meta.
// Le posizioni iniziali provengono dal riferimento HTML originale.
const common = {
  10:track(10,[[0,434,490],[1.45,427,483],[2,415,466],[2.9,381,440],[3.4,363,421],[4.15,337,402],[4.65,322,392],[6,315,383],[12.6,310,380]]),
  12:track(12,[[0,343,551],[1.45,350,540],[2,358,519],[2.9,366,480],[3.4,384,455],[4.15,423,410],[4.65,434,403],[6.5,445,386],[12.6,445,385]]),
  13:track(13,[[0,238,605],[1.45,238,585],[2,238,562],[2.9,238,520],[3.4,238,496],[4.15,238,463],[4.65,238,442],[5.4,238,411],[6.55,238,354],[7.15,238,331],[8,238,310],[12.6,238,302]]),
  15:track(15,[[0,240,743],[1.45,229,724],[2,210,690],[2.9,186,637],[3.4,174,599],[4.15,166,544],[4.65,164,516],[5.4,164,455],[6.55,164,379],[7.15,164,357],[8,164,320],[9.05,164,282],[10,162,267],[12.6,157,259]]),
  14:curvedTrack(14,[[0,94,663],[1.45,94,651],[2,94,631],[2.9,94,601],[3.4,94,583],[4.15,94,558],[4.65,94,539],[5.4,94,506],[6.55,94,426],[7.15,94,390],[8,94,370],[9.05,94,330],[9.55,94,305],[10.5,94,276],[12.6,94,184]])
};
const continueToGoal = (base,fromTime,endY) => {
  const keys=base.keys.filter(frame=>frame.t<=fromTime);
  return {...base,keys:[...keys,{t:x1Duration,x:keys.at(-1).x,y:endY}]};
};
const initialPasses = [
  {start:.68,end:.98,from:null,to:9},
  {start:1.55,end:2.02,from:9,to:10},
  {start:4.15,end:4.65,from:10,to:13}
];
const initialPhases = [
  {start:0,title:'Mischia vinta',description:'La mischia conquista il pallone. Il 9 si prepara a raccoglierlo.'},
  {start:1.5,title:'Il 9 apre sul 10',description:'Il mediano serve l’apertura. I trequarti salgono insieme; il 9 avvia la corsa di copertura.'},
  {start:2.25,title:'Incrocio e finta',description:'Il 10 taglia verso sinistra e il 12 incrocia sulla diagonale opposta. Il 10 finge il passaggio e conserva il pallone.'},
  {start:4.15,title:'Il 10 serve il 13',description:'Dopo la finta, l’apertura passa all’indietro al secondo centro, che attacca diritto.'}
];

/** @type {Record<string,Play>} */
export const PLAYS = {
  X1:{
    id:'X1',name:'Uscita esterna',description:'Incrocio 10/12, uscita sul 13, inserimento del 15 e passaggio all’ala sinistra.',category:'trequarti',derivedFrom:null,duration:x1Duration,
    tracks:{...common,
      9:curvedTrack(9,[[0,568,435],[.7,568,435],[1.5,555,435],[2.02,540,435],[3.4,490,435],[4.65,430,435],[6.55,340,435],[9.05,250,435],[12.6,205,435]]),
      10:continueToGoal(common[10],6,100),
      12:continueToGoal(common[12],6.5,110),
      13:continueToGoal(common[13],8,100),
      15:continueToGoal(common[15],10,105),
      14:continueToGoal(common[14],12.6,82),
      11:track(11,[[0,568,591],[1,568,591],[1.5,553,586],[2.5,504,566],[3.4,456,543],[4.15,411,525],[4.65,383,508],[5.4,337,483],[6.55,268,448],[7.15,241,420],[8,191,375],[9.05,169,333],[9.55,164,325],[10.5,162,315],[12.6,162,245],[15,162,160]])
    },
    passes:[...initialPasses,{start:6.55,end:7.15,from:13,to:15},{start:9.05,end:9.55,from:15,to:14}],
    phases:[...initialPhases,
      {start:5.45,title:'L’11 segue il pallone',description:'L’ala destra stringe da destra verso sinistra e si porta dietro al 15, senza ricevere.'},
      {start:6.55,title:'Il 13 serve il 15',description:'Il 13 avanza e passa all’estremo inserito alla propria sinistra. L’11 resta in sostegno.'},
      {start:9.05,title:'Il 15 libera il 14',description:'L’estremo serve l’ala sinistra, che corre diritto verso la meta. Il 9 completa la linea difensiva dietro ai trequarti, a circa quattro metri dalla laterale sinistra.'},
      {start:10.5,title:'Corsa verso la meta',description:'Il 14 continua l’azione; gli altri trequarti proseguono nelle proprie corsie verso la meta. L’11 resta dietro al 15 in sostegno e il 9 mantiene la copertura.'}
    ]
  },
  X2:{
    id:'X2',name:'Taglio interno',description:'Variante con l’11 che raddrizza prima della ricezione dal 13.',category:'trequarti',derivedFrom:'X1',duration,
    tracks:{...common,
      9:track(9,[[0,568,435],[.7,568,435],[1.5,568,435],[1.55,568,435],[2.02,568,435],[2.75,544,441],[3.4,520,446],[4.15,495,452],[4.65,475,455],[5.2,457,458],[5.5,455,460],[5.98,455,445],[6.3,455,430],[6.85,455,414],[7.5,455,390],[8.4,455,350],[9.65,455,290],[12.6,455,220]]),
      10:curvedTrack(10,[[0,434,490],[.68,434,490],[.98,434,490],[1.5,434,480],[2.02,434,470],[2.25,421,458],[2.9,381,440],[3.4,363,421],[4.15,337,402],[4.65,322,392],[5.5,298,373],[6.3,267,344],[6.85,244,328],[7.5,218,313],[8.4,200,290],[9.65,185,267],[12.6,170,240]]),
      12:track(12,[[0,343,551],[.68,343,551],[.98,343,551],[1.5,343,540],[2.02,343,519],[2.25,343,503],[5.5,440,407],[5.98,440,390],[6.3,440,380],[6.85,440,365],[7.5,440,338],[8.4,440,285],[9.65,440,216],[12.6,440,162]]),
      11:curvedTrack(11,[[0,568,591],[.68,568,591],[.98,568,591],[1.5,551,584],[2.02,532,572],[2.25,519,560],[2.9,485,544],[3.4,458,527],[4.1,425,505],[4.65,399,483],[5.15,380,463],[5.5,380,445],[5.98,380,417],[6.3,380,399],[6.85,380,368],[7.5,380,331],[8.4,380,278],[9.65,380,209],[12.6,380,155]]),
      13:curvedTrack(13,[[0,238,605],[.68,238,605],[.98,238,605],[1.5,238,585],[2.02,238,562],[2.9,238,520],[3.4,238,496],[4.15,238,463],[4.65,238,442],[5.5,238,417],[5.98,238,410],[6.3,244,405],[6.85,263,378],[7.5,286,340],[8.4,305,300],[9.65,309,234],[12.6,310,180]]),
      15:curvedTrack(15,[[0,240,743],[1.45,240,724],[2.02,240,688],[2.25,240,673],[2.9,220,637],[3.4,190,599],[4.15,170,544],[4.65,164,516],[5.4,164,464],[6.3,164,425],[7.5,164,396],[9.65,164,362],[12.6,164,345]]),
      14:curvedTrack(14,[[0,94,663],[.68,94,663],[.98,94,663],[1.5,94,651],[2.02,94,631],[2.9,94,601],[3.4,94,583],[4.15,94,558],[4.65,94,539],[5.4,94,508],[6.3,94,479],[7.5,94,448],[9.65,94,405],[12.6,94,385]])
    },
    passes:[...initialPasses,{start:5.5,end:5.98,from:13,to:11}],
    phases:[...initialPhases,
      {start:4.8,title:'L’11 raddrizza la corsa',description:'L’11 completa la curva verso sinistra e corre diritto prima della ricezione. Il 12 continua su una diagonale retta verso il pallino superiore sinistro della mischia.'},
      {start:5.5,title:'Il 13 serve l’11',description:'Mentre il 13 passa all’11, il 12 raddrizza immediatamente verso la meta. L’11 arriva sul pallone continuando a correre; il 9 raggiunge la zona sotto il 12 e inizia a salire.'},
      {start:6.85,title:'Taglio interno',description:'L’11 prosegue diritto con il pallone. Il 12 sale nella corsia alla sua destra e si porta poco dietro per sostenerlo; il 9 sale dietro al 12. Il 13 converge nella corsia di sostegno alla sinistra dell’11.'}
    ]
  },
  X3:{
    id:'X3',name:'Giro largo',description:'Il 10 gira dietro al 12, riceve di nuovo e apre sul 13 per liberare il 14.',category:'trequarti',derivedFrom:null,duration:14.8,
    tracks:{
      9:track(9,[[0,568,435],[.7,568,435],[1.5,568,435],[1.9,568,435],[2.6,555,435],[3.5,530,435],[4.4,500,435],[5.5,470,435],[6.5,440,435],[8.4,380,435],[10.5,320,435],[12.5,270,435],[14.8,240,435]]),
      10:curvedTrack(10,[[0,434,490],[1,434,490],[1.5,434,480],[1.9,430,468],[2.6,412,430],[3,398,463],[3.5,355,480],[4,315,454],[4.4,290,418],[5.5,272,355],[6,270,340],[7.1,270,300],[7.6,270,285],[8.4,270,255],[10,270,200],[12,270,145],[14.8,270,105]]),
      11:curvedTrack(11,[[0,568,591],[1,568,591],[1.5,555,585],[1.9,535,575],[2.6,505,560],[3,485,550],[3.5,460,535],[4,435,520],[4.4,410,510],[5.5,365,485],[6,345,470],[7.1,305,445],[7.6,290,430],[8.4,260,405],[10,225,360],[12,210,285],[14.8,200,200]]),
      12:track(12,[[0,343,551],[1,343,551],[1.5,343,525],[1.9,343,500],[2.6,343,463],[3,345,445],[3.5,345,420],[4,345,400],[4.4,345,383],[5.5,345,340],[6,345,320],[7.1,345,278],[7.6,345,260],[8.4,345,230],[10,345,180],[12,345,130],[14.8,345,95]]),
      13:curvedTrack(13,[[0,238,605],[1,238,605],[1.5,238,590],[1.9,238,570],[2.6,238,535],[3,238,515],[3.5,238,490],[4,238,465],[4.4,238,445],[5.5,225,390],[6,218,370],[7.1,215,322],[7.6,210,320],[8.1,190,320],[8.4,180,315],[10,172,260],[12,170,185],[14.8,170,125]]),
      14:track(14,[[0,94,663],[1,94,663],[1.5,94,648],[1.9,94,628],[2.6,94,595],[3,94,575],[3.5,94,550],[4,94,525],[4.4,94,505],[5.5,94,455],[6,94,430],[7.1,94,370],[7.6,94,340],[8.4,94,300],[10,94,220],[12,94,130],[14.8,94,68]]),
      15:curvedTrack(15,[[0,240,743],[1,240,743],[1.5,235,722],[1.9,220,700],[2.6,195,660],[3,180,635],[3.5,165,600],[4,155,565],[4.4,150,535],[5.5,145,465],[6,140,435],[7.1,135,400],[7.6,135,380],[8.4,120,350],[10,120,285],[12,120,205],[14.8,120,145]])
    },
    passes:[
      {start:.7,end:1,from:null,to:9},
      {start:1.5,end:1.9,from:9,to:10},
      {start:2.6,end:3,from:10,to:12},
      {start:4,end:4.4,from:12,to:10},
      {start:5.5,end:6,from:10,to:13},
      {start:7.1,end:7.6,from:13,to:14}
    ],
    phases:[
      {start:0,title:'Mischia vinta',description:'La mischia conquista il pallone e il 9 lo recupera.'},
      {start:1.5,title:'Il 9 apre sul 10',description:'Il 9 serve il 10. La linea dei trequarti sale mantenendo ampiezza e profondità.'},
      {start:2.6,title:'Il 10 serve il 12',description:'Il 10 fissa la difesa e passa al 12; subito dopo inizia a girargli dietro.'},
      {start:3,title:'Giro dietro al 12',description:'Il 12 avanza con il pallone. Il 10 disegna un arco dietro di lui e riappare nella corsia esterna.'},
      {start:4,title:'Il 12 restituisce al 10',description:'Il 12 serve all’indietro il 10, che riceve già in corsa verso sinistra.'},
      {start:5.5,title:'Il 10 apre sul 13',description:'L’apertura avanza e libera il 13. Il 12 continua diritto per impegnare la difesa.'},
      {start:7.1,title:'Il 13 libera il 14',description:'Il 13 serve l’ala sinistra con un passaggio all’indietro. Il 15 si inserisce in sostegno interno.'},
      {start:7.6,title:'Corsa sull’esterno',description:'Il 14 attacca la meta; il 13 e il 15 restano dietro in sostegno, l’11 segue la giocata e il 9 copre la linea arretrata.'}
    ]
  },
  X4:{
    id:'X4',name:'Dietro la schiena',description:'Il 12 scarica direttamente al 15 che arriva dietro al 13; il 15 sale e libera il 14.',category:'trequarti',derivedFrom:null,duration:18.5,
    scrumY:441,scrumBall:[569,481],
    defense:{
      scrum:[[551,333],[571,333],[591,333],[559,354],[583,354],[551,375],[571,375],[591,375]],
      scrumAdvance:{keys:key([[0,0,0],[1.5,0,5],[2.6,0,10],[4.6,0,12],[16.5,0,12]])},
      tracks:{
        9:curvedTrack(9,[[0,493,313],[.7,493,313],[1.5,485,320],[2.6,477,330],[4.6,470,350],[7.3,465,390],[7.8,465,400],[9.3,465,421],[10,460,430],[11,445,445],[12,430,450],[13,415,445],[16.5,350,390],[18.5,320,365]]),
        10:oneMeterBack(curvedTrack(10,[[0,433,286],[.7,433,286],[1.5,425,300],[2.6,415,325],[4.6,400,355],[7.3,385,385],[7.8,383,395],[9.3,380,433],[10,375,450],[11,360,465],[12,340,475],[13,320,470],[16.5,270,400],[18.5,245,375]])),
        11:oneMeterBack(curvedTrack(11,[[0,76,205],[.7,76,205],[1.5,70,217],[2.6,65,235],[4.6,55,265],[7.3,48,290],[7.8,48,305],[9.3,48,331],[10,48,340],[11,48,350],[12,48,345],[13,48,330],[16.5,48,250],[18.5,48,220]])),
        12:oneMeterBack(curvedTrack(12,[[0,338,290],[.7,338,290],[1.5,338,302],[2.6,338,330],[4.6,338,355],[7.3,338,380],[7.8,338,378],[9.3,338,348],[10,338,335],[11,338,318],[12,338,300],[13,338,283],[16.5,338,239],[18.5,338,215]])),
        13:oneMeterBack(curvedTrack(13,[[0,242,292],[.7,242,292],[1.5,245,305],[2.6,248,330],[4.6,250,345],[7.3,255,370],[7.8,255,370],[9.3,255,370],[10,255,370],[11,255,365],[12,255,360],[13,255,360],[16.5,255,295],[18.5,255,270]])),
        14:oneMeterBack(curvedTrack(14,[[0,650,288],[.7,650,288],[1.5,645,284],[2.6,640,279],[4.6,625,268],[7.3,610,255],[7.8,605,251],[9.3,590,240],[10,585,236],[11,575,232],[12,565,228],[13,555,224],[16.5,525,210],[18.5,510,200]])),
        15:oneMeterBack(curvedTrack(15,[[0,338,205],[.7,338,205],[1.5,335,217],[2.6,330,235],[4.6,310,265],[7.3,275,290],[7.8,265,305],[9.3,228,331],[10,215,340],[11,210,350],[12,210,345],[13,215,330],[16.5,205,250],[18.5,195,220]]))
      }
    },
    tracks:{
      9:curvedTrack(9,[[0,568,533],[.7,568,533],[1.5,568,533],[1.9,568,533],[3,530,529],[4.4,470,523],[5.5,405,515],[7.3,340,505],[8,300,497],[10,240,485],[13,170,465],[16.5,125,445],[18.5,100,435]]),
      10:oneMeterBackForAttack(curvedTrack(10,[[0,434,577],[1,434,577],[1.5,434,569],[1.9,430,559],[2.6,425,535],[3,420,529],[4,420,497],[4.4,420,485],[5.5,420,453],[7.3,420,409],[8,420,393],[10,420,365],[13,420,313],[16.5,420,257],[18.5,420,225]])),
      11:oneMeterBackForAttack(curvedTrack(11,[[0,568,658],[1,568,658],[1.5,560,655],[1.9,550,653],[3,530,649],[4.4,485,633],[5.5,445,621],[7.3,390,605],[8,365,597],[10,295,577],[13,240,561],[16.5,185,545],[18.5,160,535]])),
      12:oneMeterBackForAttack(track(12,[[0,343,626],[1,343,626],[1.5,343,618],[1.9,343,607],[2.6,343,583],[3,343,569],[4,343,529],[4.4,343,513],[5.5,343,473],[7.3,343,419],[8,343,403],[10,343,365],[13,343,313],[16.5,343,269],[18.5,343,245]])),
      13:oneMeterBackForAttack(curvedTrack(13,[[0,260,645],[1,260,645],[1.5,260,630],[1.9,260,620],[2.6,260,596],[3,260,582],[4,260,542],[4.4,260,526],[5,260,509],[5.5,260,489],[7.3,260,435],[8,260,419],[10,260,402],[13,260,390],[16.5,260,325],[18.5,260,290]])),
      14:oneMeterBackForAttack(track(14,[[0,94,715],[1,94,715],[1.5,94,703],[1.9,94,687],[2.6,94,661],[3,94,645],[4,94,605],[4.4,94,589],[5.5,94,561],[7.3,94,525],[11.3,94,430],[11.8,94,410],[12.1,94,395],[14,94,275],[15,94,215],[17,94,110],[18.5,94,45]])),
      15:oneMeterBackForAttack(track(15,[[0,240,779],[8.6,205,480],[9.1,195,464],[9.6,185,448],[10.6,165,416],[11.3,165,390],[11.8,165,371],[14,165,288],[18.5,165,120]]))
    },
    passes:[
      {start:.7,end:1,from:null,to:9},
      {start:1.5,end:1.9,from:9,to:10},
      {start:4.6,end:5,from:10,to:12},
      {start:8,end:8.6,from:12,to:15,arc:28},
      {start:11.3,end:11.8,from:15,to:14}
    ],
    phases:[
      {start:0,title:'Mischia vinta',description:'La mischia conquista il pallone e il 9 prepara il passaggio.'},
      {start:1.5,title:'Il 9 serve il 10',description:'Il 9 passa al 10, poi si sposta verso sinistra in copertura. La difesa color mattone comincia ad avanzare.'},
      {start:1.9,title:'Il 10 sale con la palla',description:'Il 10 continua ad avanzare con il pallone prima di servire il 12.'},
      {start:4.6,title:'Il 10 serve il 12',description:'Il 10 sale ancora per un secondo con il pallone, poi passa al 12. Il 15 si propone dietro al 13.'},
      {start:5,title:'Il 12 sale con la palla',description:'Il 12 avanza ancora per un secondo con il pallone prima dello scarico.'},
      {start:8,title:'Scarico diretto al 15',description:'Il 12 scarica dietro la propria schiena direttamente al 15, che riceve correndo dietro al 13.'},
      {start:8.6,title:'Il 15 attacca la linea',description:'Il 15 riceve in corsa, accelera leggermente per un secondo e continua senza rallentare. Il 14 corre alla sua sinistra; 9 e 11 coprono dietro.'},
      {start:11.3,title:'Il 15 libera il 14',description:'Il 15 passa all’indietro al 14. La difesa vede l’apertura e comincia a scivolare verso il lato del pallone.'},
      {start:11.8,title:'Corsa verso la meta',description:'Il 14 prosegue diritto. I difensori girano per inseguire il pallone; il 15 e il 13 sostengono l’azione, mentre 9 e 11 coprono dietro.'}
    ]
  }
};
