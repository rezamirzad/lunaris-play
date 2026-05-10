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
  capacity: string;
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
  results: string;
  storyteller: string;
  dixit_round_summary: string;
  dixit_title: string;
  dixit_desc: string;
  pioupiou_title: string;
  pioupiou_desc: string;
  sushinode_title: string;
  sushinode_desc: string;
  dixit_score: string;
  dixit_clue_placeholder: string;
  dixit_phase_clue: string;
  dixit_phase_submit: string;
  dixit_phase_vote: string;
  dixit_wait_storyteller: string;
  dixit_wait_others: string;
  dixit_guess_card: string;
  dixit_who_voted: string;
  dixit_st_bonus: string;
  dixit_st_fail: string;
  dixit_st_fail_all: string;
  dixit_st_fail_none: string;
  dixit_found_original: string;
  dixit_found_original_all: string;
  dixit_found_original_none: string;
  dixit_others_fooled: string;
  dixit_all_or_none: string;
  rank_out_of: string;
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
  chicken: string;
  rooster: string;
  fox: string;
  nest: string;
  lastEvents: string;
  noEvents: string;
  ready: string;
  hand: string;
  room: string;
  statusLive: string;
  statusArchived: string;
  statusLobby: string;
  invalidSession: string;
  authenticating: string;
  available: string;
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
    capacityLabel: "MAXIMUM CAPACITY",
    maxLabel: "MAX",
    players: "PLAYERS",
    capacity: "CAPACITY",
    footer: "Lunaris League v1.0.4",
    noOngoing: "No public games active.",
    host: "HOST",
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
    results: "ROUND RESULTS",
    storyteller: "STORYTELLER",
    dixit_round_summary: "ROUND SUMMARY",
    dixit_title: "Dixit",
    dixit_desc: "A game of imagination and abstract art.",
    pioupiou_title: "Piou Piou",
    pioupiou_desc: "Protect the flock. Hatch eggs. Outsmart the fox",
    sushinode_title: "Sushi Node",
    sushinode_desc: "Fast-paced digital drafting protocol.",
    dixit_score: "SCORE",
    dixit_clue_placeholder: "Your clue...",
    dixit_phase_clue: "CHOOSE CARD & CLUE",
    dixit_phase_submit: "MATCH THE CLUE",
    dixit_phase_vote: "FIND THE TRUTH",
    dixit_wait_storyteller: "Wait for Storyteller",
    dixit_wait_others: "Wait for Others",
    dixit_guess_card: "Which is the original?",
    dixit_who_voted: "GUESSERS",
    dixit_st_bonus: "SOME GUESSED (STORYTELLER BONUS)",
    dixit_st_fail: "EVERYONE OR NO ONE GUESSED (0 PTS)",
    dixit_st_fail_all: "EVERYONE FOUND YOUR CARD",
    dixit_st_fail_none: "NO ONE FOUND YOUR CARD",
    dixit_found_original: "YOU FOUND THE ORIGINAL",
    dixit_found_original_all: "YOU AND EVERYONE ELSE FOUND THE ORIGINAL",
    dixit_found_original_none: "YOU AND NO ONE ELSE FOUND THE ORIGINAL",
    dixit_others_fooled: "PLAYER(S) FELL FOR YOUR CARD",
    dixit_all_or_none: "EVERYONE/NO ONE FOUND THE ORIGINAL",
    rank_out_of: "{rank} of {total}",
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
    chicken: "Chicken",
    rooster: "Rooster",
    fox: "Fox",
    nest: "Nest",
    lastEvents: "Last 5 events",
    noEvents: "No events recorded",
    ready: "Ready",
    hand: "Hand",
    room: "Room",
    statusLive: "Live",
    statusArchived: "Archived",
    statusLobby: "Initializing",
    invalidSession: "Invalid Session",
    authenticating: "Authenticating Node",
    available: "Available",
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
    capacityLabel: "CAPACITÉ MAXIMUM",
    maxLabel: "MAX",
    players: "JOUEURS",
    capacity: "CAPACITY",
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
    results: "RÉSULTATS DU TOUR",
    storyteller: "CONTEUR",
    dixit_round_summary: "RÉSUMÉ DU TOUR",
    dixit_title: "Dixit",
    dixit_desc: "Un jeu d'imagination et d'art.",
    pioupiou_title: "Piou Piou",
    pioupiou_desc:
      "Protégez le troupeau. Faites éclore les œufs. Rusez contre le renard.",
    sushinode_title: "Sushi Node",
    sushinode_desc: "Protocole de draft numérique rapide.",
    dixit_score: "SCORE",
    dixit_clue_placeholder: "Votre indice...",
    dixit_phase_clue: "CHOISISSEZ IMAGE & INDICE",
    dixit_phase_submit: "CORRESPONDEZ À L'INDICE",
    dixit_phase_vote: "TROUVEZ LA VÉRITÉ",
    dixit_wait_storyteller: "Attente du Conteur",
    dixit_wait_others: "Attente des autres",
    dixit_guess_card: "Lequel est l'original ?",
    dixit_who_voted: "VOTANTS",
    dixit_st_bonus: "CERTAINS ONT TROUVÉ (BONUS CONTEUR)",
    dixit_st_fail: "TOUT LE MONDE OU PERSONNE N'A TROUVÉ (0 PTS)",
    dixit_st_fail_all: "TOUT LE MONDE A TROUVÉ VOTRE CARTE",
    dixit_st_fail_none: "PERSONNE N'A TROUVÉ VOTRE CARTE",
    dixit_found_original: "VOUS AVEZ TROUVÉ L'ORIGINAL",
    dixit_found_original_all: "VOUS ET TOUS LES AUTRES AVEZ TROUVÉ L'ORIGINAL",
    dixit_found_original_none: "VOUS ET PERSONNE D'AUTRE N'AVEZ TROUVÉ L'ORIGINAL",
    dixit_others_fooled: "JOUEUR(S) ONT ÉTÉ PIÉGÉS PAR VOTRE CARTE",
    dixit_all_or_none: "TOUT LE MONDE/PERSONNE N'A TROUVÉ L'ORIGINAL",
    rank_out_of: "{rank} sur {total}",
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
    chicken: "Poussin",
    rooster: "Coq",
    fox: "Renard",
    nest: "Nid",
    lastEvents: "5 derniers événements",
    noEvents: "Aucun événement enregistré",
    ready: "Prêt",
    hand: "Main",
    room: "Salle",
    statusLive: "En Direct",
    statusArchived: "Archivé",
    statusLobby: "Initialisation",
    invalidSession: "Session Invalide",
    authenticating: "Authentification du Nœud",
    available: "Disponible",
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
    capacityLabel: "KAPAZITÄT MAXIMAL",
    maxLabel: "MAX",
    players: "SPIELER",
    capacity: "KAPAZITÄT",
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
    results: "RUNDENERGEBNISSE",
    storyteller: "ERZÄHLER",
    dixit_round_summary: "RUNDENZUSAMMENFASSUNG",
    dixit_title: "Dixit",
    dixit_desc: "Ein Spiel der Fantasie.",
    pioupiou_title: "Piou Piou",
    pioupiou_desc: "Schütze die Herde. Brüte Eier aus. Überliste den Fuchs.",
    sushinode_title: "Sushi Node",
    sushinode_desc: "Schnelles digitales Drafting-Protokoll.",
    dixit_score: "PUNKTE",
    dixit_clue_placeholder: "Dein Hinweis...",
    dixit_phase_clue: "BILD & HINWEIS WÄHLEN",
    dixit_phase_submit: "ZUM HINWEIS PASSEN",
    dixit_phase_vote: "FINDE DIE WAHRHEIT",
    dixit_wait_storyteller: "Warten auf Erzähler",
    dixit_wait_others: "Warten auf andere",
    dixit_guess_card: "Welches ist das Original?",
    dixit_who_voted: "GIPFEL",
    dixit_st_bonus: "EINIGE HABEN ERRATEN (ERZÄHLER-BONUS)",
    dixit_st_fail: "ALLE ODER NIEMAND HAT ERRATEN (0 PKT)",
    dixit_st_fail_all: "ALLE HABEN DEINE KARTE GEFUNDEN",
    dixit_st_fail_none: "NIEMAND HAT DEINE KARTE GEFUNDEN",
    dixit_found_original: "DU HAST DAS ORIGINAL GEFUNDEN",
    dixit_found_original_all: "DU UND ALLE ANDEREN HABEN DAS ORIGINAL GEFUNDEN",
    dixit_found_original_none: "DU UND NIEMAND SONST HABEN DAS ORIGINAL GEFUNDEN",
    dixit_others_fooled: "SPIELER SIND AUF DEINE KARTE REINGEFALLEN",
    dixit_all_or_none: "ALLE/NIEMAND HAT DAS ORIGINAL GEFUNDEN",
    rank_out_of: "{rank} von {total}",
    LOG_LAY_EGG: "{player} hat ein Ei gelegt! 🥚",
    LOG_HATCH: "{player} hat ein Küken ausgebrütet! 🐣",
    LOG_DISCARD: "{player} hat ein {card} abgewerfen. ♻️",
    LOG_INVALID: "Ungültiger Zug! 🚫",
    LOG_FOX_SUCCESS: "{player} hat {target} ein Ei gestohlen! 🦊",
    LOG_FOX_BLOCKED: "{target} hat den Fuchs with 2 Hähnen abgewehrt! 🐓🐓",
    finalHand: "Letzte Hand",
    waitingPlayers: "Warten auf Spieler",
    minPlayersRequired: "Mindestens {count} Spieler erforderlich",
    testingNote: "(2 zum Testen)",
    action: "AKTION",
    nearlyWinning: "FAST GEWONNEN!",
    noEggsToSteal: "Keine Eier zu stehlen!",
    yourTurn: "DU BIST DRAN",
    chicken: "Küken",
    rooster: "Hahn",
    fox: "Fuchs",
    nest: "Nest",
    lastEvents: "Letzte 5 Ereignisse",
    noEvents: "Keine Ereignisse aufgezeichnet",
    ready: "Bereit",
    hand: "Hand",
    room: "Raum",
    statusLive: "Live",
    statusArchived: "Archiviert",
    statusLobby: "Initializing",
    invalidSession: "Ungültige Sitzung",
    authenticating: "Authentifizierung des Knotens",
    available: "Verfügbar",
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
    capacityLabel: "ظرفیت حداکثر",
    maxLabel: "حداکثر",
    players: "بازیکن",
    capacity: "ظرفیت",
    footer: "لوناریس لیگ نسخه ۱.۰.۴",
    noOngoing: "بازی فعالی وجود ندارد.",
    host: "ایجاد",
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
    results: "نتایج دور",
    storyteller: "قصه‌گو",
    dixit_round_summary: "خلاصه دور",
    dixit_title: "دیکسیت",
    dixit_desc: "بازی تخیل و هنر",
    pioupiou_title: "پیو پیو",
    pioupiou_desc:
      "از گله محافظت کنید. تخم‌مرغ‌ها را جوجه کنید. روباه را فریب دهید",
    sushinode_title: "سوشی نود",
    sushinode_desc: "پروتکل یارکشی دیجیتال سریع.",
    dixit_score: "امتیاز",
    dixit_clue_placeholder: "سرنخ شما...",
    dixit_phase_clue: "تصویر و سرنخ را انتخاب کنید",
    dixit_phase_submit: "کارت هماهنگ را بگذارید",
    dixit_phase_vote: "حقیقت را پیدا کنید",
    dixit_wait_storyteller: "در انتظار قصه‌گو",
    dixit_wait_others: "در انتظار بقیه",
    dixit_guess_card: "کدام کارت اصلی است؟",
    dixit_who_voted: "حدس‌زننده‌ها",
    dixit_st_bonus: "تعدادی حدس زدند (امتیاز قصه‌گو)",
    dixit_st_fail: "همه یا هیچ‌کس حدس نزد (۰ امتیاز)",
    dixit_st_fail_all: "همه کارت شما را پیدا کردند",
    dixit_st_fail_none: "هیچ‌کس کارت شما را پیدا نکرد",
    dixit_found_original: "کارت اصلی را پیدا کردی",
    dixit_found_original_all: "تو و همه بازیکنان دیگر کارت اصلی را پیدا کردید",
    dixit_found_original_none: "تو و هیچ‌کس دیگر کارت اصلی را پیدا نکردید",
    dixit_others_fooled: "بازیکن دیگر فریب کارت تو را خوردند",
    dixit_all_or_none: "همه یا هیچ‌کس کارت اصلی را پیدا نکرد",
    rank_out_of: "{rank} از {total}",
    LOG_LAY_EGG: "{player} یک تخم گذاشت! 🥚",
    LOG_HATCH: "{player} یک جوجه به دنیا آورد! 🐣",
    LOG_DISCARD: "را دور انداخت {card} کارت {player}",
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
    chicken: "جوجه",
    rooster: "خروس",
    fox: "روباه",
    nest: "لانه",
    lastEvents: "آخرین گزارش‌ها",
    noEvents: "گزارشی ثبت نشده",
    ready: "آماده",
    hand: "دست",
    room: "اتاق",
    statusLive: "در حال بازی",
    statusArchived: "بایگانی شده",
    statusLobby: "آماده‌سازی",
    invalidSession: "نشست نامعتبر",
    authenticating: "در حال تایید هویت",
    available: "در دسترس",
  },
};

/**
 * Converts English digits to Persian/Arabic digits for Farsi localization.
 * Exported to fix Module has no exported member 'toPersianDigits' error.
 */
export function toPersianDigits(num: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Replaces placeholders like {player} in translation strings with actual data.
 * Exported to fix Module has no exported member 'formatLog' error.
 */
export function formatLog(
  template: string,
  data: Record<string, string | number>,
  lang?: Language,
) {
  if (!template) return "";
  let result = template;
  for (const key in data) {
    let value = data[key];
    // If the language is Persian, ensure digits in the data are also converted
    if (lang === "fa") {
      value = toPersianDigits(String(value));
    }
    result = result.replace(`{${key}}`, String(value));
  }
  return result;
}

/**
 * Resolves a game title based on database fields or translation keys.
 */
export function getLocalizedGameTitle(
  slug: string,
  lang: Language,
  t: TranslationSet,
  dbTitle?: string,
  dbTitleFr?: string,
  dbTitleDe?: string,
  dbTitleFa?: string,
): string {
  // 1. Try DB specific language fields
  let title = dbTitle || slug;
  if (lang === "fr") title = dbTitleFr || title;
  else if (lang === "de") title = dbTitleDe || title;
  else if (lang === "fa") title = dbTitleFa || title;

  // 2. Try translation file key (slug_title)
  const tTitle = (t as any)[`${slug.toLowerCase()}_title`];

  return tTitle || title;
}
