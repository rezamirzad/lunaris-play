export type Language = "en" | "fr" | "de" | "fa";

export interface TranslationSet {
  title: string;
  subtitle: string;
  namePlaceholder: string;
  roomPlaceholder: string;
  enterLobby: string;
  arcade: string;
  ongoingGames: string;
  howToPlay: string;
  step1: string;
  step2: string;
  step3: string;
  capacityLabel: string;
  maxLabel: string;
  players: string;
  footer: string;
  noOngoing: string;
  host: string;
  startMatch: string;
  activeTurn: string;
  matchActivity: string;
  availableMoves: string;
  hintLayEgg: string;
  hintHatch: string;
  hintSteal: string;
  eggs: string;
  chicks: string;
  targetPlayer: string;
  discard: string;
  invalidCombo: string;
  attack: string;
  waiting: string;
  defend: string;
  noRoosters: string;
  accept: string;
  gameOver: string;
  winner: string;
  victory: string;
  champion: string;
  exit: string;
  lobby: string;
  dixit_title: string;
  dixit_desc: string;
  pioupiou_title: string;
  pioupiou_desc: string;
  dixit_score: string;
  dixit_clue_placeholder: string;
  dixit_phase_clue: string;
  dixit_phase_submit: string;
  dixit_phase_vote: string;
  dixit_wait_storyteller: string;
  dixit_wait_others: string;
  dixit_guess_card: string;
  LOG_LAY_EGG: string;
  LOG_HATCH: string;
  LOG_DISCARD: string;
  LOG_INVALID: string;
  LOG_FOX_SUCCESS: string;
  LOG_FOX_BLOCKED: string;
  finalHand: string;
  waitingPlayers: string;
  minPlayersRequired: string;
  testingNote: string;
  action: string;
  nearlyWinning: string;
  noEggsToSteal: string;
  yourTurn: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    title: "LUNARIS",
    subtitle: "ARCADE HUB",
    namePlaceholder: "YOUR NAME",
    roomPlaceholder: "ROOM CODE",
    enterLobby: "JOIN ROOM",
    arcade: "AVAILABLE GAMES",
    ongoingGames: "ONGOING SESSIONS",
    howToPlay: "HOW TO PLAY",
    step1: "1. Open this page on your TV to HOST.",
    step2: "2. Scan the QR code on your PHONE.",
    step3: "3. Use your phone as the controller!",
    capacityLabel: "CAPACITY",
    maxLabel: "MAX",
    players: "PLAYERS",
    footer: "Lunaris League v1.0.4",
    noOngoing: "No public games active.",
    host: "HOST GAME",
    startMatch: "START MATCH",
    activeTurn: "ACTIVE TURN",
    matchActivity: "MATCH ACTIVITY",
    availableMoves: "AVAILABLE MOVES",
    hintLayEgg: "LAY EGG",
    hintHatch: "HATCH",
    hintSteal: "STEAL EGG",
    eggs: "EGGS",
    chicks: "CHICKS",
    targetPlayer: "SELECT VICTIM 🦊",
    discard: "DISCARD",
    invalidCombo: "INVALID COMBO",
    attack: "ATTACK",
    waiting: "WAITING...",
    defend: "DEFEND",
    noRoosters: "No Roosters to defend!",
    accept: "GIVE EGG",
    gameOver: "GAME OVER",
    winner: "WINNER",
    victory: "VICTORY!",
    champion: "CHAMPION",
    exit: "EXIT",
    lobby: "LOBBY",
    dixit_title: "Dixit",
    dixit_desc: "A game of imagination and abstract art.",
    pioupiou_title: "Piou Piou",
    pioupiou_desc: "Tactical henhouse card game.",
    dixit_score: "SCORE",
    dixit_clue_placeholder: "Your clue...",
    dixit_phase_clue: "CHOOSE CARD & CLUE",
    dixit_phase_submit: "MATCH THE CLUE",
    dixit_phase_vote: "FIND THE TRUTH",
    dixit_wait_storyteller: "Wait for Storyteller",
    dixit_wait_others: "Wait for Others",
    dixit_guess_card: "Which is the original?",
    LOG_LAY_EGG: "{player} laid an egg! 🥚",
    LOG_HATCH: "{player} hatched a chick! 🐣",
    LOG_DISCARD: "{player} discarded a {card}. ♻️",
    LOG_INVALID: "Invalid combination! 🚫",
    LOG_FOX_SUCCESS: "{player} stole an egg from {target}! 🦊",
    LOG_FOX_BLOCKED: "{target} blocked the fox with 2 Roosters! 🐓🐓",
    finalHand: "Final Hand",
    waitingPlayers: "Waiting for Players",
    minPlayersRequired: "Need at least {count} players to begin",
    testingNote: "(2 for testing)",
    action: "ACTION",
    nearlyWinning: "NEARLY WINNING!",
    noEggsToSteal: "No eggs to steal!",
    yourTurn: "YOUR TURN",
  },
  fr: {
    title: "LUNARIS",
    subtitle: "CENTRE ARCADE",
    namePlaceholder: "VOTRE NOM",
    roomPlaceholder: "CODE SALLE",
    enterLobby: "REJOINDRE",
    arcade: "JEUX DISPONIBLES",
    ongoingGames: "SESSIONS EN COURS",
    howToPlay: "COMMENT JOUER",
    step1: "1. Ouvrez sur TV pour HÉBERGER.",
    step2: "2. Scannez le QR sur MOBILE.",
    step3: "3. Jouez avec votre mobile !",
    capacityLabel: "CAPACITÉ",
    maxLabel: "MAX",
    players: "JOUEURS",
    footer: "Lunaris League v1.0.4",
    noOngoing: "Aucune partie en cours.",
    host: "HÉBERGER",
    startMatch: "DÉMARRER",
    activeTurn: "TOUR ACTIF",
    matchActivity: "ACTIVITÉ DU MATCH",
    availableMoves: "MOUVEMENTS POSSIBLES",
    hintLayEgg: "PONDRE",
    hintHatch: "ÉCLORE",
    hintSteal: "VOLER OEUF",
    eggs: "OEUFS",
    chicks: "POUSSINS",
    targetPlayer: "CHOISIR UNE CIBLE 🦊",
    discard: "DÉFAUSSER",
    invalidCombo: "COUP INVALIDE",
    attack: "ATTAQUER",
    waiting: "ATTENTE...",
    defend: "DÉFENDRE",
    noRoosters: "Pas de Coqs pour défendre !",
    accept: "DONNER OEUF",
    gameOver: "FIN DE PARTIE",
    winner: "GAGNANT",
    victory: "VICTOIRE !",
    champion: "CHAMPION",
    exit: "QUITTER",
    lobby: "SALON",
    dixit_title: "Dixit",
    dixit_desc: "Un jeu d'imagination et d'art.",
    pioupiou_title: "Piou Piou",
    pioupiou_desc: "Jeu de cartes tactique.",
    dixit_score: "SCORE",
    dixit_clue_placeholder: "Votre indice...",
    dixit_phase_clue: "CHOISISSEZ IMAGE & INDICE",
    dixit_phase_submit: "CORRESPONDEZ À L'INDICE",
    dixit_phase_vote: "TROUVEZ LA VÉRITÉ",
    dixit_wait_storyteller: "Attente du Conteur",
    dixit_wait_others: "Attente des autres",
    dixit_guess_card: "Lequel est l'original ?",
    LOG_LAY_EGG: "{player} a pondu un œuf ! 🥚",
    LOG_HATCH: "{player} a fait éclore un poussin ! 🐣",
    LOG_DISCARD: "{player} a défaussé un {card}. ♻️",
    LOG_INVALID: "Coup invalide ! 🚫",
    LOG_FOX_SUCCESS: "{player} a volé un œuf à {target} ! 🦊",
    LOG_FOX_BLOCKED: "{target} a bloqué le renard avec 2 Coqs ! 🐓🐓",
    finalHand: "Main Finale",
    waitingPlayers: "Attente des joueurs",
    minPlayersRequired: "Il faut au moins {count} joueurs pour commencer",
    testingNote: "(2 pour le test)",
    action: "ACTION",
    nearlyWinning: "PRESQUE GAGNÉ !",
    noEggsToSteal: "Pas d'oeufs à voler !",
    yourTurn: "À VOUS DE JOUER",
  },
  de: {
    title: "LUNARIS",
    subtitle: "ARCADE-ZENTRUM",
    namePlaceholder: "DEIN NAME",
    roomPlaceholder: "RAUMCODE",
    enterLobby: "BEITRETEN",
    arcade: "VERFÜGBARE SPIELE",
    ongoingGames: "AKTIVE SPIELE",
    howToPlay: "SO WIRD GESPIELT",
    step1: "1. Seite auf TV öffnen.",
    step2: "2. Code auf dem Handy eingeben.",
    step3: "3. Handy als Controller nutzen!",
    capacityLabel: "KAPAZITÄT",
    maxLabel: "MAX",
    players: "SPIELER",
    footer: "Lunaris League v1.0.4",
    noOngoing: "Keine aktiven Spiele.",
    host: "HOSTEN",
    startMatch: "STARTEN",
    activeTurn: "AKTIVER ZUG",
    matchActivity: "SPIELAKTIVITÄT",
    availableMoves: "MÖGLICHE ZÜGE",
    hintLayEgg: "EI LEGEN",
    hintHatch: "BRÜTEN",
    hintSteal: "EI STEHLEN",
    eggs: "EIER",
    chicks: "KÜKEN",
    targetPlayer: "OPFER WÄHLEN 🦊",
    discard: "ABWERFEN",
    invalidCombo: "UNGÜLTIG",
    attack: "ANGREIFEN",
    waiting: "WARTEN...",
    defend: "VERTEIDIGEN",
    noRoosters: "Keine Hähne zum Verteidigen!",
    accept: "EI GEBEN",
    gameOver: "SPIEL VORBEI",
    winner: "GEWINNER",
    victory: "SIEG!",
    champion: "CHAMPION",
    exit: "BEENDEN",
    lobby: "LOBBY",
    dixit_title: "Dixit",
    dixit_desc: "Ein Spiel der Fantasie.",
    pioupiou_title: "Piou Piou",
    pioupiou_desc: "Taktisches Kartenspiel.",
    dixit_score: "PUNKTE",
    dixit_clue_placeholder: "Dein Hinweis...",
    dixit_phase_clue: "BILD & HINWEIS WÄHLEN",
    dixit_phase_submit: "ZUM HINWEIS PASSEN",
    dixit_phase_vote: "FINDE DIE WAHRHEIT",
    dixit_wait_storyteller: "Warten auf Erzähler",
    dixit_wait_others: "Warten auf andere",
    dixit_guess_card: "Welches ist das Original?",
    LOG_LAY_EGG: "{player} hat ein Ei gelegt! 🥚",
    LOG_HATCH: "{player} hat ein Küken ausgebrütet! 🐣",
    LOG_DISCARD: "{player} hat ein {card} abgewerfen. ♻️",
    LOG_INVALID: "Ungültiger Zug! 🚫",
    LOG_FOX_SUCCESS: "{player} hat {target} ein Ei gestohlen! 🦊",
    LOG_FOX_BLOCKED: "{target} hat den Fuchs mit 2 Hähnen abgewehrt! 🐓🐓",
    finalHand: "Letzte Hand",
    waitingPlayers: "Warten auf Spieler",
    minPlayersRequired: "Mindestens {count} Spieler erforderlich",
    testingNote: "(2 zum Testen)",
    action: "AKTION",
    nearlyWinning: "FAST GEWONNEN!",
    noEggsToSteal: "Keine Eier zu stehlen!",
    yourTurn: "DU BIST DRAN",
  },
  fa: {
    title: "لوناریس",
    subtitle: "مرکز بازی",
    namePlaceholder: "نام شما",
    roomPlaceholder: "کد اتاق",
    enterLobby: "ورود به اتاق",
    arcade: "بازی‌های موجود",
    ongoingGames: "بازی‌های در جریان",
    howToPlay: "راهنمای بازی",
    step1: "۱. این صفحه را در تلویزیون باز کنید.",
    step2: "۲. کد اتاق را در گوشی وارد کنید.",
    step3: "۳. از گوشی به عنوان دسته استفاده کنید!",
    capacityLabel: "ظرفیت",
    maxLabel: "حداکثر",
    players: "بازیکن",
    footer: "لوناریس لیگ نسخه ۱.۰.۴",
    noOngoing: "بازی فعالی وجود ندارد.",
    host: "ایجاد بازی",
    startMatch: "شروع بازی",
    activeTurn: "نوبت فعلی",
    matchActivity: "گزارش بازی",
    availableMoves: "حرکت‌های ممکن",
    hintLayEgg: "تخم گذاری",
    hintHatch: "تولد جوجه",
    hintSteal: "دزدیدن تخم",
    eggs: "تخم",
    chicks: "جوجه",
    targetPlayer: "انتخاب هدف 🦊",
    discard: "حذف کارت",
    invalidCombo: "حرکت نامعتبر",
    attack: "حمله",
    waiting: "در انتظار...",
    defend: "دفاع",
    noRoosters: "خروسی برای دفاع نداری!",
    accept: "تسلیم تخم",
    gameOver: "پایان بازی",
    winner: "برنده",
    victory: "پیروزی!",
    champion: "قهرمان",
    exit: "خروج",
    lobby: "لابی",
    dixit_title: "دیکسیت",
    dixit_desc: "بازی تخیل و هنر انتزاعی.",
    pioupiou_title: "پیو پیو",
    pioupiou_desc: "بازی کارتی استراتژیک.",
    dixit_score: "امتیاز",
    dixit_clue_placeholder: "سرنخ شما...",
    dixit_phase_clue: "تصویر و سرنخ را انتخاب کنید",
    dixit_phase_submit: "کارت هماهنگ را بگذارید",
    dixit_phase_vote: "حقیقت را پیدا کنید",
    dixit_wait_storyteller: "در انتظار قصه‌گو",
    dixit_wait_others: "در انتظار بقیه",
    dixit_guess_card: "کدام کارت اصلی است؟",
    LOG_LAY_EGG: "{player} یک تخم گذاشت! 🥚",
    LOG_HATCH: "{player} یک جوجه به دنیا آورد! 🐣",
    LOG_DISCARD: "{player} کارت {card} را دور انداخت. ♻️",
    LOG_INVALID: "حرکت اشتباه! 🚫",
    LOG_FOX_SUCCESS: "{player} یک تخم از {target} دزدید! 🦊",
    LOG_FOX_BLOCKED: "{target} با دو خروس جلو روباه را گرفت! 🐓🐓",
    finalHand: "دست نهایی",
    waitingPlayers: "در انتظار بازیکنان",
    minPlayersRequired: "حداقل {count} بازیکن برای شروع لازم است",
    testingNote: "(۲ نفر برای تست)",
    action: "عملیات",
    nearlyWinning: "یک قدم تا پیروزی!",
    noEggsToSteal: "تخمی برای دزدیدن نیست!",
    yourTurn: "نوبت شماست",
  },
};

export function toPersianDigits(num: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

export function formatLog(
  template: string,
  data: Record<string, string | number>,
  lang?: Language,
) {
  if (!template) return "";
  let result = template;
  for (const key in data) {
    let value = data[key];
    if (lang === "fa") {
      value = toPersianDigits(String(value));
    }
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}
