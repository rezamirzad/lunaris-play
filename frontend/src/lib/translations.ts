export type Language = "en" | "fr" | "de" | "fa";

export interface TranslationSet {
  title: string;
  subtitle: string;
  namePlaceholder: string;
  roomPlaceholder: string;
  enterLobby: string;
  arcade: string;
  capacityLabel: string; // New
  maxLabel: string; // New
  players: string;
  footer: string;
  dir: "ltr" | "rtl";
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    title: "LUNARIS",
    subtitle: "MOBILE CONTROLLER",
    namePlaceholder: "YOUR NAME",
    roomPlaceholder: "ROOM CODE",
    enterLobby: "ENTER LOBBY",
    arcade: "THE ARCADE",
    capacityLabel: "CAPACITY",
    maxLabel: "MAX",
    players: "PLAYERS",
    footer: "Connect your phone to play. Select a game to host.",
    dir: "ltr",
  },
  fr: {
    title: "LUNARIS",
    subtitle: "CONTRÔLEUR MOBILE",
    namePlaceholder: "VOTRE NOM",
    roomPlaceholder: "CODE DE LA SALLE",
    enterLobby: "ENTRER DANS LE SALON",
    arcade: "L'ARCADE",
    capacityLabel: "CAPACITÉ",
    maxLabel: "MAX",
    players: "JOUEURS",
    footer: "Connectez votre téléphone. Choisissez un jeu pour héberger.",
    dir: "ltr",
  },
  de: {
    title: "LUNARIS",
    subtitle: "MOBILE STEUERUNG",
    namePlaceholder: "DEIN NAME",
    roomPlaceholder: "RAUMCODE",
    enterLobby: "LOBBY BETRETEN",
    arcade: "DIE ARKADE",
    capacityLabel: "KAPAZITÄT",
    maxLabel: "MAX",
    players: "SPIELER",
    footer: "Verbinde dein Handy. Wähle ein Spiel zum Hosten.",
    dir: "ltr",
  },
  fa: {
    title: "لوناریس",
    subtitle: "کنترلر موبایل",
    namePlaceholder: "نام شما",
    roomPlaceholder: "کد اتاق",
    enterLobby: "ورود به لابی",
    arcade: "آرکید بازی",
    capacityLabel: "ظرفیت",
    maxLabel: "حداکثر",
    players: "بازیکن",
    footer: "برای بازی گوشی خود را وصل کنید. یک بازی انتخاب کنید.",
    dir: "rtl",
  },
};
