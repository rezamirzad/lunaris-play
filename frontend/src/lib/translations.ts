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
  host: string; // <--- ADDED THIS
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
    step1: "1. Open this page on your TV or Laptop to HOST.",
    step2: "2. Scan the QR code or enter the code on your PHONE.",
    step3: "3. Use your phone as the controller to play!",
    capacityLabel: "CAPACITY",
    maxLabel: "MAX",
    players: "PLAYERS",
    footer: "Lunaris League v1.0.4",
    noOngoing: "No public games active. Start one!",
    host: "HOST GAME", // <--- ADDED THIS
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
    step1: "1. Ouvrez cette page sur TV/PC pour HÉBERGER.",
    step2: "2. Scannez le QR ou entrez le code sur MOBILE.",
    step3: "3. Jouez en utilisant votre mobile comme manette !",
    capacityLabel: "CAPACITÉ",
    maxLabel: "MAX",
    players: "JOUEURS",
    footer: "Lunaris League v1.0.4",
    noOngoing: "Aucune partie en cours. Lancez-en une !",
    host: "HÉBERGER", // <--- ADDED THIS
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
    step1: "1. Seite auf TV/Laptop zum HOSTEN öffnen.",
    step2: "2. Code auf dem HANDY eingeben.",
    step3: "3. Handy als Controller zum Spielen nutzen!",
    capacityLabel: "KAPAZITÄT",
    maxLabel: "MAX",
    players: "SPIELER",
    footer: "Lunaris League v1.0.4",
    noOngoing: "Keine aktiven Spiele. Starte eins!",
    host: "HOSTEN", // <--- ADDED THIS
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
    step1: "۱. این صفحه را در تلویزیون یا لپ‌تاپ باز کنید.",
    step2: "۲. کد اتاق را در گوشی خود وارد کنید.",
    step3: "۳. از گوشی به عنوان دسته بازی استفاده کنید!",
    capacityLabel: "ظرفیت",
    maxLabel: "حداکثر",
    players: "بازیکن",
    footer: "لوناریس لیگ نسخه ۱.۰.۴",
    noOngoing: "بازی فعالی وجود ندارد. یکی شروع کنید!",
    host: "ایجاد بازی", // <--- ADDED THIS
  },
};
