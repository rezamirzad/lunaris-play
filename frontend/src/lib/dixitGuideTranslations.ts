import { Language } from "./translations";

export interface PersonaGuideInfo {
  name: string;
  tag: string;
  desc: string;
  examples: string[];
}

export interface AgeGuideInfo {
  name: string;
  range: string;
  desc: string;
  examples: string[];
}

export interface DixitGuideTranslation {
  // Ruleset Guide
  rulesetTitle: string;
  coreGameplayTitle: string;
  coreGameplayDesc: string[];
  classicTitle: string;
  classicPlayers: string;
  classicBullets: string[];
  odysseyTitle: string;
  odysseyPlayers: string;
  odysseyBullets: string[];
  
  // Bot Guide Modal Header & Buttons
  botGuideButton: string;
  botGuideHeader: string;
  benchmarkTitle: string;
  benchmarkText: string;
  
  // Age Section
  ageSectionTitle: string;
  ages: {
    child: AgeGuideInfo;
    adult: AgeGuideInfo;
  };
  
  // Persona Section
  personaSectionTitle: string;
  personas: Record<string, PersonaGuideInfo>;
}

export const DIXIT_GUIDE_TRANSLATIONS: Record<Language, DixitGuideTranslation> = {
  en: {
    rulesetTitle: "📖 Ruleset Information",
    coreGameplayTitle: "Core Gameplay & Objective (30 Points to Win)",
    coreGameplayDesc: [
      "1. Storyteller Clue: One player becomes Storyteller, picks a secret card from their hand, and speaks a subtle clue.",
      "2. Card Submissions: All other players choose 1 card from their hand that best tricks opponents into guessing it.",
      "3. Voting: All submitted cards are shuffled face up. Non-storytellers vote to identify the Storyteller's original card."
    ],
    classicTitle: "Classic Ruleset",
    classicPlayers: "3–6 Players",
    classicBullets: [
      "Single Vote: Each player casts 1 vote for the Storyteller's card.",
      "Focused Strategy: Precise guessing for intimate table sizes.",
      "Scoring: Storyteller gets 3 pts if some guess right (0 if all or none guess right). Guessers get 3 pts + 1 bonus pt per vote on their trap card."
    ],
    odysseyTitle: "Odyssey Ruleset",
    odysseyPlayers: "7–12 Players",
    odysseyBullets: [
      "All or None Rule: If everyone or no one guesses the Storyteller, Storyteller gets 0 pts and all other players score 2 pts.",
      "Voting & Single-Vote Extra: Correct guess with 1 vote scores 4 pts (3 base + 1 extra); correct guess with 2 votes scores 3 pts. Storyteller scores 3 pts.",
      "Trap Bonus Cap: +1 bonus pt per vote on your card, capped at 3 bonus pts maximum."
    ],
    botGuideButton: "🤖 AI Bot Personas & Age Guide",
    botGuideHeader: "AI Bot Personas & Age Range Guide",
    benchmarkTitle: "Benchmark Reference Card:",
    benchmarkText: '"A glowing golden key floating above a misty clockwork tower at midnight."',
    ageSectionTitle: "Age Ranges (Maturity)",
    ages: {
      child: {
        name: "👶 Child",
        range: "Age 7–12",
        desc: "Simpler, magical vocabulary & playful child imagination.",
        examples: ["shining bedtime secret", "golden magic at night", "the rooftop prize"]
      },
      adult: {
        name: "👤 Adult",
        range: "Age 18+",
        desc: "Nostalgic memories, cozy themes, and poetic depth.",
        examples: ["witching hour secret", "turn of the century", "silent guardian"]
      }
    },
    personaSectionTitle: "12 AI Personas",
    personas: {
      balanced: {
        name: "✨ The Dreamer",
        tag: "Balanced",
        desc: "Cozy & poetic storytelling strategy.",
        examples: ["forbidden attic secret", "sleeping city view", "golden hour at night"]
      },
      cautious: {
        name: "🦉 The Wise Owl",
        tag: "Cautious",
        desc: "Focuses on subtle card details & low-risk play.",
        examples: ["internal mechanics", "precision machinery", "brass geometry"]
      },
      aggressive: {
        name: "🎩 The Mad Hatter",
        tag: "Aggressive",
        desc: "Playful paradoxes, eccentric clues & bold moves.",
        examples: ["twelve minus one", "counterclockwise dream", "upside-down chime"]
      },
      intuitive: {
        name: "🔮 The Mystic",
        tag: "Intuitive",
        desc: "Pure intuition & fluid, adaptive storytelling.",
        examples: ["starlight alignment", "beacon in the mist", "hour of reckoning"]
      },
      wild: {
        name: "⚡ The Daredevil",
        tag: "Wild",
        desc: "High-risk adventurous choices & unpredictable bluffs.",
        examples: ["midnight heist", "heirloom in the sky", "vault above clouds"]
      },
      storyteller: {
        name: "📖 The Storyteller",
        tag: "Literary",
        desc: "Fairytale tropes, myths & classical folklore lore.",
        examples: ["pandora's curiosity", "the bell tolls twelve", "cinder's deadline"]
      },
      surrealist: {
        name: "🌀 The Surrealist",
        tag: "Abstract",
        desc: "Abstract sensory moods, dream logic & liminal space.",
        examples: ["suspended moment", "floating gravity", "gilded fog"]
      },
      cinephile: {
        name: "🎬 The Cinephile",
        tag: "Cinematic",
        desc: "Film tropes, noir lighting & cinematic drama.",
        examples: ["gothic skyline", "steampunk prelude", "dramatic countdown"]
      },
      virtuoso: {
        name: "🎻 The Virtuoso",
        tag: "Musical",
        desc: "Acoustic sensations, musical rhythms & soundscapes.",
        examples: ["midnight chime", "resonating brass", "crescendo at twelve"]
      },
      alchemist: {
        name: "🔬 The Alchemist",
        tag: "Cosmic",
        desc: "Astronomy, elemental science & transformations.",
        examples: ["celestial gear", "golden transmutation", "astronomer's window"]
      },
      historian: {
        name: "📜 The Historian",
        tag: "Relics",
        desc: "Historical eras, lost empires & antique relics.",
        examples: ["victorian spire", "antique escapement", "relic of the realm"]
      },
      trickster: {
        name: "🎭 The Trickster",
        tag: "Riddles",
        desc: "Clever wordplay, riddles, double entendres & illusions.",
        examples: ["teeth with no mouth", "hands without fingers", "spells twelve without talking"]
      }
    }
  },

  fr: {
    rulesetTitle: "📖 Règles du Jeu",
    coreGameplayTitle: "Objectif & Déroulement (30 Points pour Gagner)",
    coreGameplayDesc: [
      "1. Indice du Conteur: Un joueur devient Conteur, choisit une carte secrète et donne un indice subtil.",
      "2. Soumission de Cartes: Les autres joueurs choisissent 1 carte de leur main pour piéger les adversaires.",
      "3. Vote: Les cartes sont mélangées face visible. Les autres votent pour retrouver la carte du Conteur."
    ],
    classicTitle: "Règles Classiques",
    classicPlayers: "3–6 Joueurs",
    classicBullets: [
      "Vote Unique: Chaque joueur vote 1 seule fois pour la carte du Conteur.",
      "Stratégie Ciblée: Déduction précise idéale pour petits groupes.",
      "Score: Le Conteur marque 3 pts si certains trouvent (0 si tous ou aucun). 3 pts pour bonne réponse + 1 pt bonus par vote sur sa carte piège."
    ],
    odysseyTitle: "Règles Odyssey",
    odysseyPlayers: "7–12 Joueurs",
    odysseyBullets: [
      "Règle Tous ou Aucun: Si tout le monde ou personne ne trouve le Conteur, le Conteur marque 0 pt et tous les autres joueurs marquent 2 pts.",
      "Bonus Vote Unique: Trouver la carte avec 1 vote donne 4 pts (3 de base + 1 extra) ; avec 2 votes donne 3 pts. Le Conteur réussi marque 3 pts.",
      "Plafond de Pièges: +1 pt bonus par vote sur sa propre carte, limité à 3 pts bonus maximum."
    ],
    botGuideButton: "🤖 Personnalités & Âges des Bots IA",
    botGuideHeader: "Guide des Personnalités & Tranches d'Âge IA",
    benchmarkTitle: "Carte de Référence Benchmark :",
    benchmarkText: '"Une clé dorée lumineuse flottant au-dessus d\'une tour d\'horlogerie brumeuse à minuit."',
    ageSectionTitle: "Tranches d'Âge (Maturité)",
    ages: {
      child: {
        name: "👶 Enfant",
        range: "7–12 ans",
        desc: "Vocabulaire simple et féerique, imagination enfantine.",
        examples: ["secret du soir brillant", "magie dorée de nuit", "trésor du toit"]
      },
      adult: {
        name: "👤 Adulte",
        range: "18+ ans",
        desc: "Souvenirs nostalgiques, thèmes chaleureux et profondeur poétique.",
        examples: ["secret de l'heure libre", "tournant du siècle", "gardien silencieux"]
      }
    },
    personaSectionTitle: "12 Personnalités IA",
    personas: {
      balanced: {
        name: "✨ Le Rêveur",
        tag: "Équilibré",
        desc: "Stratégie de narration poétique et douillette.",
        examples: ["secret de grenier interdit", "ville endormie", "heure dorée nocturne"]
      },
      cautious: {
        name: "🦉 La Chouette Sage",
        tag: "Prudent",
        desc: "Se concentre sur les détails subtils et le jeu à faible risque.",
        examples: ["mécanique interne", "rouages de précision", "géométrie de laiton"]
      },
      aggressive: {
        name: "🎩 Le Chapelier Fou",
        tag: "Agressif",
        desc: "Paradoxes ludiques, indices excentriques et coups audacieux.",
        examples: ["douze moins un", "rêve à l'envers", "carillon inversé"]
      },
      intuitive: {
        name: "🔮 Le Mystique",
        tag: "Intuitif",
        desc: "Intuition pure et narration fluide et adaptative.",
        examples: ["alignement des étoiles", "phare dans la brume", "l'heure du jugement"]
      },
      wild: {
        name: "⚡ Le Casse-cou",
        tag: "Audacieux",
        desc: "Choix aventureux à haut risque et bluffs imprévisibles.",
        examples: ["casse de minuit", "trésor céleste", "coffre-fort nuageux"]
      },
      storyteller: {
        name: "📖 Le Conteur",
        tag: "Littéraire",
        desc: "Mythes, contes de fées et folklore classique.",
        examples: ["curiosité de pandore", "le son du douzième coup", "l'heure de cendrillon"]
      },
      surrealist: {
        name: "🌀 Le Surréaliste",
        tag: "Abstrait",
        desc: "Ambiance sensorielle abstraite, logique de rêve et espaces liminaux.",
        examples: ["moment suspendu", "gravité flottante", "brume dorée"]
      },
      cinephile: {
        name: "🎬 Le Cinéphile",
        tag: "Cinématographique",
        desc: "Codes du cinéma, éclairage noir et drame cinématographique.",
        examples: ["silhouette gothique", "prélude steampunk", "compte à rebours dramatique"]
      },
      virtuoso: {
        name: "🎻 Le Virtuose",
        tag: "Musical",
        desc: "Sensations acoustiques, rythmes musicaux et paysages sonores.",
        examples: ["carillon de minuit", "laiton résonnant", "crescendo à minuit"]
      },
      alchemist: {
        name: "🔬 L'Alchimiste",
        tag: "Cosmique",
        desc: "Astronomie, science élémentaire et transformations.",
        examples: ["engrenage céleste", "transmutation dorée", "fenêtre de l'astronome"]
      },
      historian: {
        name: "📜 L'Historien",
        tag: "Reliques",
        desc: "Époques historiques, empires perdus et reliques anciennes.",
        examples: ["flèche victorienne", "échappement antique", "reliquet du royaume"]
      },
      trickster: {
        name: "🎭 Le Trickster",
        tag: "Énigmes",
        desc: "Jeux de mots habiles, énigmes, doubles sens et illusions.",
        examples: ["dents sans bouche", "aiguilles sans doigts", "dit douze sans parler"]
      }
    }
  },

  de: {
    rulesetTitle: "📖 Regelset-Informationen",
    coreGameplayTitle: "Hauptziel & Ablauf (30 Punkte zum Sieg)",
    coreGameplayDesc: [
      "1. Hinweis des Erzählers: Ein Spieler wird Erzähler, wählt eine Geheimkarte und gibt einen subtilen Hinweis.",
      "2. Karten Abgeben: Alle anderen Spieler wählen 1 Karte aus ihrer Hand, die Gegner täuscht.",
      "3. Abstimmung: Alle abgebenen Karten werden offen gemischt. Nicht-Erzähler stimmen ab, um die Originalkarte zu finden."
    ],
    classicTitle: "Klassische Regeln",
    classicPlayers: "3–6 Spieler",
    classicBullets: [
      "Einzelstimme: Jeder Spieler gibt genau 1 Stimme für die Karte des Erzählers ab.",
      "Gezielte Strategie: Präzises Raten für überschaubare Runden.",
      "Wertung: Erzähler erhält 3 Pkt., wenn einige richtig raten (0 bei allen oder niemandem). Rater erhalten 3 Pkt. + 1 Bonuspunkt pro Falle."
    ],
    odysseyTitle: "Odyssey-Regeln",
    odysseyPlayers: "7–12 Spieler",
    odysseyBullets: [
      "Alle-oder-Keiner-Regel: Raten alle oder niemand richtig, erhält der Erzähler 0 Pkt. und alle anderen Spieler je 2 Pkt.",
      "Einzelstimmen-Bonus: Richtiger Tipp mit 1 Stimme bringt 4 Pkt. (3 Basis + 1 Extra); mit 2 Stimmen bringt 3 Pkt. Der Erzähler erhält 3 Pkt.",
      "Fallen-Obergrenze: +1 Bonuspunkt pro Stimme auf die eigene Karte, begrenzt auf maximal 3 Bonuspunkte."
    ],
    botGuideButton: "🤖 KI-Bot-Personas & Alters-Guide",
    botGuideHeader: "Guide für KI-Bot-Personas & Altersgruppen",
    benchmarkTitle: "Benchmark-Referenzkarte:",
    benchmarkText: '"Ein leuchtender goldener Schlüssel, der um Mitternacht über einem nebulösen Uhrwerkturm schwebt."',
    ageSectionTitle: "Altersgruppen (Reife)",
    ages: {
      child: {
        name: "👶 Kind",
        range: "7–12 Jahre",
        desc: "Einfaches, magisches Vokabular & spielerische Kinderphantasie.",
        examples: ["glänzendes Geheimnis", "goldene Nachtmagie", "Dachschatz"]
      },
      adult: {
        name: "👤 Erwachsener",
        range: "18+ Jahre",
        desc: "Nostalgische Erinnerungen, gemütliche Themen und poetische Tiefe.",
        examples: ["Geisterstunde-Geheimnis", "Jahrhundertwende", "stiller Wächter"]
      }
    },
    personaSectionTitle: "12 KI-Personas",
    personas: {
      balanced: {
        name: "✨ Der Träumer",
        tag: "Ausgewogen",
        desc: "Gemütliche & poetische Erzählstrategie.",
        examples: ["Dachboden-Geheimnis", "schlafende Stadt", "goldene Nachtstunde"]
      },
      cautious: {
        name: "🦉 Die weise Eule",
        tag: "Vorsichtig",
        desc: "Fokussiert auf subtile Details & risikoarmes Spiel.",
        examples: ["Feinmechanik", "Präzisionsuhrwerk", "Messinggeometrie"]
      },
      aggressive: {
        name: "🎩 Der verrückte Hutmacher",
        tag: "Aggressiv",
        desc: "Verspielte Paradoxien, exzentrische Hinweise & kühne Züge.",
        examples: ["zwölf minus eins", "Rückwärts-Traum", "umgekehrter Klang"]
      },
      intuitive: {
        name: "🔮 Der Mystiker",
        tag: "Intuitiv",
        desc: "Reine Intuition & flüssige, flexible Erzählung.",
        examples: ["Sternenkonstellation", "Leuchtfeuer im Nebel", "Stunde der Wahrheit"]
      },
      wild: {
        name: "⚡ Der Draufgänger",
        tag: "Wild",
        desc: "Risikoreiche Abenteuer-Entscheidungen & unvorhersehbare Bluffs.",
        examples: ["Mitternachtscoup", "Himmels-Erbstück", "Tresor über den Wolken"]
      },
      storyteller: {
        name: "📖 Der Geschichtenerzähler",
        tag: "Literarisch",
        desc: "Märchenmotive, Mythen & klassische Folklore.",
        examples: ["Pandoras Neugier", "zwölf Glockenschläge", "Aschenputtels Frist"]
      },
      surrealist: {
        name: "🌀 Der Surrealist",
        tag: "Abstrakt",
        desc: "Abstrakte Stimmungen, Traumlogik & Schwellenräume.",
        examples: ["schwebender Moment", "entgleitende Schwerkraft", "goldener Nebel"]
      },
      cinephile: {
        name: "🎬 Der Cineast",
        tag: "Kinematografisch",
        desc: "Filmmotive, Film-Noir-Licht & dramatisches Kino.",
        examples: ["gotische Skyline", "Steampunk-Präludium", "dramatischer Countdown"]
      },
      virtuoso: {
        name: "🎻 Der Virtuose",
        tag: "Musikalisch",
        desc: "Akustische Empfindungen, Rhythmen & Klangwelten.",
        examples: ["Mitternachtsklang", "hallendes Messing", "Crescendo um Zwölf"]
      },
      alchemist: {
        name: "🔬 Der Alchemist",
        tag: "Kosmisch",
        desc: "Astronomie, Elementarwissenschaft & Transformationen.",
        examples: ["Himmelszahnrad", "goldene Transmutation", "Fenster des Astronomen"]
      },
      historian: {
        name: "📜 Der Historiker",
        tag: "Relikte",
        desc: "Historische Epochen, verlorene Reiche & alte Relikte.",
        examples: ["viktorianische Turmspitze", "antike Hemmung", "Relikt des Reiches"]
      },
      trickster: {
        name: "🎭 Der Schelm",
        tag: "Rätsel",
        desc: "Wortspiele, Rätsel, Doppeldeutigkeiten & Illusionen.",
        examples: ["Zähne ohne Mund", "Zeiger ohne Finger", "sagt zwölf ohne Worte"]
      }
    }
  },

  fa: {
    rulesetTitle: "📖 راهنمای شیوه بازی و قوانین",
    coreGameplayTitle: "قاعده کلی و هدف بازی (رسیدن به ۳۰ امتیاز)",
    coreGameplayDesc: [
      "۱. سرنخ راوی: راوی یک کارت از دستش انتخاب کرده و سرنخی شاعرانه و رمزآلود سر می‌دهد.",
      "۲. بازی تله‌ها: سایر بازیکنان شبیه‌ترین کارت خود را بازی می‌کنند تا بقیه را به اشتباه بیندازند.",
      "۳. حدس و رأی: کارت‌ها رو می‌شوند؛ بازیکنان باید کارت اصلی راوی را از میان تله‌ها تشخیص دهند."
    ],
    classicTitle: "شیوه کلاسیک",
    classicPlayers: "۳ تا ۶ نفره",
    classicBullets: [
      "حق یک رأی: هر بازیکن فقط به یک کارت رأی می‌دهد.",
      "تمرکز و دقت: مناسب بازی‌های کم‌جمعیت و رقابت‌های نفس‌گیر.",
      "امتیازدهی: راوی ۳ امتیاز می‌گیرد اگر حدس‌ها متوازن باشد (نه همه، نه هیچ‌کس). حدس درست ۳ امتیاز و هر فریب ۱ امتیاز پاداش دارد."
    ],
    odysseyTitle: "شیوه ادیسه",
    odysseyPlayers: "۷ تا ۱۲ نفره",
    odysseyBullets: [
      "قانون همه یا هیچ: اگر همه یا هیچ‌کس کارت راوی را حدس نزند، راوی ۰ امتیاز و تمامی سایر بازیکنان ۲ امتیاز می‌گیرند.",
      "پاداش تک‌رأی: حدس درست با ۱ رأی ۴ امتیاز (۳ پایه + ۱ پاداش)؛ با ۲ رأی ۳ امتیاز دارد. راوی موفق ۳ امتیاز می‌گیرد.",
      "سقف امتیاز تله: ۱ امتیاز پاداش به ازای هر رأی به کارت شما، حداکثر تا سقف ۳ امتیاز پاداش."
    ],
    botGuideButton: "🤖 راهنمای هوش مصنوعی و رده‌های سنی ربات‌ها",
    botGuideHeader: "راهنمای شخصیت‌پردازی و رده‌های سنی ربات‌ها",
    benchmarkTitle: "کارت مبنا برای مقایسه سرنخ‌ها:",
    benchmarkText: '«کلیدی طلایی و درخشان که نیمه‌شب بر فراز برجی ساعت‌دار و مه‌آلود شناور است.»',
    ageSectionTitle: "رده‌های سنی (سطح پختگی)",
    ages: {
      child: {
        name: "👶 کودک",
        range: "۷ تا ۱۲ سال",
        desc: "واژگان ساده، خیال‌انگیز و صمیمیت کودکانه.",
        examples: ["راز درخشان شبانه", "جادوی طلایی ماه", "جایزه بالای بام"]
      },
      adult: {
        name: "👤 بزرگسال",
        range: "۱۸+ سال",
        desc: "خاطرات پرحس‌وحال، مفاهیم عمیق و طنین شعرگونه.",
        examples: ["راز ساعت ۱۲", "مرور روزگار گذشته", "نگهبان بی‌صدا"]
      }
    },
    personaSectionTitle: "۱۲ شخصیت هوش مصنوعی",
    personas: {
      balanced: {
        name: "✨ رؤیاپرداز",
        tag: "متعادل",
        desc: "داستان‌سرایی آرام، شاعرانه و فضاگیر.",
        examples: ["راز شیروانی قدیمی", "شهر در خواب", "روشنی شبانه"]
      },
      cautious: {
        name: "🦉 جغد دانا",
        tag: "محتاط",
        desc: "تمرکز بر ریزه‌کاری‌های کارت و بازی کم‌خطر.",
        examples: ["چرخ‌دنده‌های پنهان", "هندسه ظریف برنجی", "مکانیسم دقیق"]
      },
      aggressive: {
        name: "🎩 کلاهدوز دیوانه",
        tag: "جسور",
        desc: "تناقض‌های بازیگوشانه، سرنخ‌های عجیب و شوکه‌کننده.",
        examples: ["ساعت بی‌شماره", "رؤیای وارونه", "چرخش پادساعتگرد"]
      },
      intuitive: {
        name: "🔮 عارف",
        tag: "شهودی",
        desc: "شهود خالص، فضاپذیری و داستان‌سرایی روان.",
        examples: ["قران ستارگان", "فانوس شب‌تاب", "لحظه موعود"]
      },
      wild: {
        name: "⚡ ماجراجو",
        tag: "بی‌پروا",
        desc: "پرریسک، غیرقابل پیش‌بینی و استاد بلوف زدن.",
        examples: ["دستبرد در تاریکی", "امانت آسمانی", "گنج بر فراز ابرها"]
      },
      storyteller: {
        name: "📖 راوی",
        tag: "ادبی",
        desc: "الهام از اساطیر، افسانه‌های کهن و داستان‌های کلاسیک.",
        examples: ["راز پاندورا", "طنین دوازدهم", "شمارش معکوس سیندرلا"]
      },
      surrealist: {
        name: "🌀 سوررئالیست",
        tag: "انتزاعی",
        desc: "فضاسازی حس‌برانگیز، منطق خواب‌گونه و برزخی.",
        examples: ["لحظه معلق", "جاذبه بی‌وزن", "مه طلایی‌رنگ"]
      },
      cinephile: {
        name: "🎬 سینمادوست",
        tag: "سینمایی",
        desc: "نورپردازی نوار، صحنه‌پردازی دراماتیک و قاب‌های تصویری.",
        examples: ["چشم‌انداز گوتیک", "پیش‌درآمد استیم‌پانک", "سکانس پایانی"]
      },
      virtuoso: {
        name: "🎻 استاد موسیقی",
        tag: "موسیقایی",
        desc: "حس‌های صوتی، ریتم‌های نوایی و طنین‌اندازی.",
        examples: ["زنگ نیمه‌شب", "طنین آلیاژ برنج", "اوج ملودی"]
      },
      alchemist: {
        name: "🔬 کیمیاگر",
        tag: "کیهانی",
        desc: "نجوم، استحاله عناصر و رازهای کیهان.",
        examples: ["چرخ‌دنده کیهانی", "استحاله طلایی", "دریچه منجم"]
      },
      historian: {
        name: "📜 عتیقه‌شناس",
        tag: "کهن",
        desc: "امپراتوری‌های کهن، یادگارهای تاریخی و عتیقه‌ها.",
        examples: ["منار گوتیک", "رقاصک عتیقه", "میراث کهن"]
      },
      trickster: {
        name: "🎭 شعبده‌باز",
        tag: "معماپرداز",
        desc: "بازی با واژگان، چیستان، ایهام و خطای دید.",
        examples: ["دندان‌های بی‌دهان", "عقربه‌های بی‌انگشت", "گفتن بدون کلام"]
      }
    }
  }
};
