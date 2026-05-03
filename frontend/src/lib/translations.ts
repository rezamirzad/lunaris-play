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
  eggs: string;
  chicks: string;
  targetPlayer: string;
  // ACTION BUTTON KEYS
  discard: string;
  invalidCombo: string;
  attack: string;
  waiting: string;
  defend: string;
  accept: string;
  // LOG KEYS
  LOG_LAY_EGG: string;
  LOG_HATCH: string;
  LOG_DISCARD: string;
  LOG_INVALID: string;
  LOG_FOX_SUCCESS: string;
  LOG_FOX_BLOCKED: string;
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
    eggs: "EGGS",
    chicks: "CHICKS",
    targetPlayer: "SELECT VICTIM 🦊",
    discard: "DISCARD",
    invalidCombo: "INVALID COMBO",
    attack: "ATTACK",
    waiting: "WAITING...",
    defend: "DEFEND",
    accept: "GIVE EGG",
    LOG_LAY_EGG: "{player} laid an egg! 🥚",
    LOG_HATCH: "{player} hatched a chick! 🐣",
    LOG_DISCARD: "{player} discarded a {card}. ♻️",
    LOG_INVALID: "Invalid combination! 🚫",
    LOG_FOX_SUCCESS: "{player} stole an egg from {target}! 🦊",
    LOG_FOX_BLOCKED: "{target} blocked the fox with 2 Roosters! 🐓🐓",
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
    eggs: "OEUFS",
    chicks: "POUSSINS",
    targetPlayer: "CHOISIR UNE CIBLE 🦊",
    discard: "DÉFAUSSER",
    invalidCombo: "COUP INVALIDE",
    attack: "ATTAQUER",
    waiting: "ATTENTE...",
    defend: "DÉFENDRE",
    accept: "DONNER OEUF",
    LOG_LAY_EGG: "{player} a pondu un œuf ! 🥚",
    LOG_HATCH: "{player} a fait éclore un poussin ! 🐣",
    LOG_DISCARD: "{player} a défaussé un {card}. ♻️",
    LOG_INVALID: "Coup invalide ! 🚫",
    LOG_FOX_SUCCESS: "{player} a volé un œuf à {target} ! 🦊",
    LOG_FOX_BLOCKED: "{target} a bloqué le renard avec 2 Coqs ! 🐓🐓",
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
    eggs: "EIER",
    chicks: "KÜKEN",
    targetPlayer: "OPFER WÄHLEN 🦊",
    discard: "ABWERFEN",
    invalidCombo: "UNGÜLTIG",
    attack: "ANGREIFEN",
    waiting: "WARTEN...",
    defend: "VERTEIDIGEN",
    accept: "EI GEBEN",
    LOG_LAY_EGG: "{player} hat ein Ei gelegt! 🥚",
    LOG_HATCH: "{player} hat ein Küken ausgebrütet! 🐣",
    LOG_DISCARD: "{player} hat ein {card} abgeworfen. ♻️",
    LOG_INVALID: "Ungültiger Zug! 🚫",
    LOG_FOX_SUCCESS: "{player} hat {target} ein Ei gestohlen! 🦊",
    LOG_FOX_BLOCKED: "{target} hat den Fuchs mit 2 Hähnen abgewehrt! 🐓🐓",
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
    eggs: "تخم",
    chicks: "جوجه",
    targetPlayer: "انتخاب هدف 🦊",
    discard: "حذف کارت",
    invalidCombo: "حرکت نامعتبر",
    attack: "حمله",
    waiting: "در انتظار...",
    defend: "دفاع",
    accept: "تسلیم تخم",
    LOG_LAY_EGG: "{player} یک تخم گذاشت! 🥚",
    LOG_HATCH: "{player} یک جوجه به دنیا آورد! 🐣",
    LOG_DISCARD: "{player} کارت {card} را دور انداخت. ♻️",
    LOG_INVALID: "حرکت اشتباه! 🚫",
    LOG_FOX_SUCCESS: "{player} یک تخم از {target} دزدید! 🦊",
    LOG_FOX_BLOCKED: "{target} با دو خروس جلو روباه را گرفت! 🐓🐓",
  },
};

export function formatLog(template: string, data: Record<string, string>) {
  if (!template) return "";
  let result = template;
  for (const key in data) {
    result = result.replace(`{${key}}`, data[key]);
  }
  return result;
}
