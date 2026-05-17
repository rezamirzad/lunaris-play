export type Language = "en" | "fr" | "de" | "fa";

export interface TranslationSet {
  title: string;
  subtitle: string;
  game: string;
  wins: string;
  rank: string;
  board: string;
  namePlaceholder: string;
  roomPlaceholder: string;
  enterLobby: string;
  lobbyInitiation: string;
  matchInitiation: string;
  arcade: string;
  ongoingGames: string;
  howToPlay: string;
  hallOfFame: string;
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
  themind_title: string;
  themind_desc: string;
  themind_level: string;
  themind_lives: string;
  themind_emps: string;
  themind_syncing: string;
  themind_playing: string;
  themind_victory: string;
  themind_game_over: string;
  justone_title: string;
  justone_desc: string;
  justone_mystery_word: string;
  justone_clue_placeholder: string;
  justone_guess_placeholder: string;
  justone_standby: string;
  justone_validation: string;
  justone_confirm_data: string;
  justone_pass: string;
  justone_correct: string;
  justone_wrong: string;
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
  notReady: string;
  hand: string;
  room: string;
  statusLive: string;
  statusArchived: string;
  statusLobby: string;
  invalidSession: string;
  authenticating: string;
  available: string;
  connectedPlayers: string;
  readyPlayers: string;
  waitingForPlayers: string;
  madeBy: string;
  unknown_predator: string;
  waiting_for_sequence: string;
  
  // Game specific (organic themes)
  themind_shurikens: string;
  themind_team_stats: string;
  themind_hand_size: string;
  themind_discard_pile: string;
  themind_awaiting_play: string;
  themind_secured_by: string;
  themind_ready_for_next: string;
  themind_start_level: string;
  themind_level_progress: string;
  themind_shuriken_request: string;
  themind_shuriken_vote: string;
  themind_shuriken_confirm: string;
  themind_sector_stabilized: string;
  themind_concentrating: string;
  themind_terminal_locked: string;
  themind_miscalculated: string;
  themind_purged: string;
  
  justone_guesser: string;
  justone_clue_submitted: string;
  justone_awaiting_clues: string;
  justone_validated: string;
  justone_accepted: string;
  justone_rejected: string;
  justone_total_score: string;
  justone_round_count: string;
  justone_ambiguity_detected: string;
  justone_target_word: string;
  justone_consensus_required: string;
  justone_all_canceled: string;
  justone_session_ended: string;
  justone_submit_clue: string;
  justone_execute_guess: string;
  justone_waiting_sync: string;
  justone_decryption_input: string;
  justone_clue_input: string;
  justone_helper: string;
  
  dixit_participants: string;
  dixit_clue_received: string;
  dixit_awaiting_st: string;
  dixit_match_live: string;
  dixit_current_phase: string;
  dixit_integrity: string;
  dixit_node_owner: string;
  dixit_received_guesses: string;
  dixit_guessers: string;
  dixit_wait_others_action: string;
  
  pioupiou_match_telemetry: string;
  pioupiou_resolution: string;
  pioupiou_encryption: string;
  pioupiou_secure: string;
  
  shared_status: string;
  shared_rank: string;
  shared_score: string;
  shared_players: string;
  shared_language: string;
  shared_points: string;
  boot_preparing: string;
  boot_syncing: string;
  boot_starting: string;
  boot_ready: string;
  boot_loading: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    title: "LUNARIS",
    subtitle: "ARCADE HUB",
    game: "GAMES",
    wins: "WINS",
    rank: "RANK",
    namePlaceholder: "YOUR NAME",
    roomPlaceholder: "ROOM CODE",
    enterLobby: "JOIN ROOM",
    arcade: "AVAILABLE GAMES",
    ongoingGames: "ONGOING SESSIONS",
    board: "TO BOARD",
    lobbyInitiation: "Preparing lobby...",
    matchInitiation: "Start game",
    howToPlay: "HOW TO PLAY",
    step1: "1. Open this page on your TV to HOST.",
    step2: "2. Scan the QR code on your PHONE.",
    step3: "3. Use your phone as the controller!",
    capacityLabel: "MAXIMUM PLAYERS",
    maxLabel: "MAX",
    players: "PLAYERS",
    capacity: "CAPACITY",
    hallOfFame: "HALL OF FAME",
    footer: "Lunaris Arcade v1.0.4",
    noOngoing: "No public games active.",
    host: "HOST",
    startMatch: "START GAME",
    activeTurn: "ACTIVE TURN",
    matchActivity: "GAME LOG",
    availableMoves: "AVAILABLE MOVES",
    hintLayEgg: "LAY EGG",
    hintHatch: "HATCH",
    hintSteal: "STEAL EGG",
    eggs: "EGGS",
    chicks: "CHICKS",
    targetPlayer: "SELECT TARGET 🦊",
    discard: "DISCARD",
    invalidCombo: "INVALID MOVE",
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
    dixit_desc: "Give clever clues about beautiful, dreamlike cards. Guess the right picture to score points!",
    pioupiou_title: "PiouPiou",
    pioupiou_desc: "Collect cards to hatch your chicks, but watch out for the sly fox trying to steal your eggs!",
    themind_title: "The Mind",
    themind_desc: "Play number cards in ascending order as a team. The catch? You can't speak or communicate at all!",
    themind_level: "LEVEL {level}",
    themind_lives: "LIVES",
    themind_emps: "THROWING STARS",
    themind_syncing: "CONCENTRATING...",
    themind_playing: "PLAYING",
    themind_victory: "VICTORY",
    themind_game_over: "GAME OVER",
    justone_title: "Just One",
    justone_desc: "Write a single-word clue to help your teammate guess the secret word. Careful: duplicate clues are canceled out!",
    justone_mystery_word: "MYSTERY WORD",
    justone_clue_placeholder: "Enter single-word clue...",
    justone_guess_placeholder: "Enter final guess...",
    justone_standby: "Wait for clues",
    justone_validation: "COMPARE CLUES",
    justone_confirm_data: "CONFIRM",
    justone_pass: "PASS",
    justone_correct: "CORRECT",
    justone_wrong: "WRONG",
    sushinode_title: "Sushi Go",
    sushinode_desc: "High-speed card drafting and collection.",
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
    dixit_others_fooled: "GUESSES ON YOUR CARD",
    dixit_all_or_none: "ALL OR NONE GUESSED",
    rank_out_of: "{rank} of {total}",
    LOG_LAY_EGG: "{player} laid an egg! 🥚",
    LOG_HATCH: "{player} hatched a chick! 🐣",
    LOG_DISCARD: "{player} discarded a {card}. ♻️",
    LOG_INVALID: "Invalid move! 🚫",
    LOG_FOX_SUCCESS: "{player} stole an egg from {target}! 🦊",
    LOG_FOX_BLOCKED: "{target} blocked the fox with 2 Roosters! 🐓🐓",
    finalHand: "Final Hand",
    waitingPlayers: "Waiting for Players",
    minPlayersRequired: "Need at least {count} players to begin",
    testingNote: "",
    action: "ACTION",
    nearlyWinning: "NEARLY WINNING!",
    noEggsToSteal: "No eggs to steal!",
    yourTurn: "YOUR TURN",
    chicken: "Chicken",
    rooster: "Rooster",
    fox: "Fox",
    nest: "Nest",
    lastEvents: "Recent events",
    noEvents: "No events yet",
    ready: "Ready",
    notReady: "Not Ready",
    hand: "Hand",
    room: "Room",
    statusLive: "In Progress",
    statusArchived: "Finished",
    statusLobby: "Waiting",
    invalidSession: "Invalid Game",
    authenticating: "Connecting...",
    available: "Available",
    connectedPlayers: "Connected Players",
    readyPlayers: "READY",
    waitingForPlayers: "Waiting for players",
    madeBy: "Created by Lunaris",
    unknown_predator: "A Predator",
    waiting_for_sequence: "AWAITING MOVE",
    
    themind_shurikens: "THROWING STARS",
    themind_team_stats: "PLAYER STATUS",
    themind_hand_size: "CARDS REMAINING",
    themind_discard_pile: "DISCARD PILE",
    themind_awaiting_play: "AWAITING PLAY",
    themind_secured_by: "PLAYED BY",
    themind_ready_for_next: "LEVEL CLEARED! READY?",
    themind_start_level: "START NEXT LEVEL",
    themind_level_progress: "LEVEL PROGRESS",
    themind_shuriken_request: "STAR REQUESTED",
    themind_shuriken_vote: "VOTE ACTIVE",
    themind_shuriken_confirm: "TAP TO CONFIRM",
    themind_sector_stabilized: "Level {level} Complete",
    themind_concentrating: "Concentrating...",
    themind_terminal_locked: "GAME OVER",
    themind_miscalculated: "MISCALCULATED",
    themind_purged: "DISCARDED",
    
    justone_guesser: "GUESSER",
    justone_clue_submitted: "CLUE SUBMITTED",
    justone_awaiting_clues: "AWAITING CLUES...",
    justone_validated: "VALIDATED",
    justone_accepted: "ACCEPTED",
    justone_rejected: "REJECTED",
    justone_total_score: "TOTAL SCORE",
    justone_round_count: "ROUND",
    justone_ambiguity_detected: "AMBIGUITY DETECTED",
    justone_target_word: "THE WORD WAS",
    justone_consensus_required: "VOTE ON VALIDITY",
    justone_all_canceled: "ALL CLUES CANCELED",
    justone_session_ended: "GAME OVER",
    justone_submit_clue: "SUBMIT CLUE",
    justone_execute_guess: "EXECUTE GUESS",
    justone_waiting_sync: "Waiting for others...",
    justone_decryption_input: "GUESS",
    justone_clue_input: "CLUE",
    justone_helper: "HELPER",
    
    dixit_participants: "PLAYERS",
    dixit_clue_received: "THE CLUE IS",
    dixit_awaiting_st: "WAITING FOR STORYTELLER...",
    dixit_match_live: "GAME IN PROGRESS",
    dixit_current_phase: "CURRENT PHASE",
    dixit_integrity: "ROUND PROGRESS",
    dixit_node_owner: "PLAYED BY",
    dixit_received_guesses: "GUESSES ({count})",
    dixit_guessers: "GUESSERS",
    dixit_wait_others_action: "Wait for others",
    
    pioupiou_match_telemetry: "GAME STATUS",
    pioupiou_resolution: "WINNER",
    pioupiou_encryption: "PHASE",
    pioupiou_secure: "ACTIVE",
    
    shared_status: "STATUS",
    shared_rank: "RANK",
    shared_score: "SCORE",
    shared_players: "PLAYERS",
    shared_language: "LANGUAGE",
    shared_points: "PTS",
    boot_preparing: "PREPARING BOARD",
    boot_syncing: "SYNCING PLAYERS",
    boot_starting: "STARTING",
    boot_ready: "READY",
    boot_loading: "LOADING",
  },
  fr: {
    title: "LUNARIS",
    subtitle: "CENTRE ARCADE",
    game: "JEUX",
    wins: "VICTOIRES",
    rank: "RANG",
    namePlaceholder: "VOTRE NOM",
    roomPlaceholder: "CODE SALLE",
    enterLobby: "REJOINDRE",
    arcade: "JEUX DISPONIBLES",
    ongoingGames: "SESSIONS EN COURS",
    board: "AU PLATEAU",
    lobbyInitiation: "Préparation du salon...",
    matchInitiation: "Démarrer la partie",
    howToPlay: "COMMENT JOUER",
    step1: "1. Ouvrez cette page sur TV pour HÉBERGER.",
    step2: "2. Scannez le QR sur MOBILE.",
    step3: "3. Jouez avec votre mobile !",
    capacityLabel: "CAPACITÉ MAXIMUM",
    maxLabel: "MAX",
    players: "JOUEURS",
    capacity: "CAPACITÉ",
    hallOfFame: "TABLEAU D'HONNEUR",
    footer: "Lunaris Arcade v1.0.4",
    noOngoing: "Aucune partie publique.",
    host: "HÉBERGER",
    startMatch: "DÉMARRER LA PARTIE",
    activeTurn: "TOUR ACTIF",
    matchActivity: "LOG DE JEU",
    availableMoves: "MOUVEMENTS POSSIBLES",
    hintLayEgg: "PONDRE",
    hintHatch: "ÉCLORE",
    hintSteal: "VOLER OEUF",
    eggs: "OEUFS",
    chicks: "POUSSINS",
    targetPlayer: "CHOISIR CIBLE 🦊",
    discard: "DÉFAUSSER",
    invalidCombo: "COUP INVALIDE",
    attack: "ATTAQUER",
    waiting: "ATTENTE...",
    defend: "DÉFENDRE",
    noRoosters: "Pas de Coqs !",
    accept: "DONNER OEUF",
    gameOver: "FIN DE PARTIE",
    winner: "GAGNANT",
    victory: "VICTOIRE !",
    champion: "CHAMPION",
    exit: "QUITTER",
    lobby: "SALON",
    results: "RÉSULTATS",
    storyteller: "CONTEUR",
    dixit_round_summary: "RÉSUMÉ DU TOUR",
    dixit_title: "Dixit",
    dixit_desc: "Donnez des indices subtils. Devinez la bonne image pour marquer des points !",
    pioupiou_title: "PiouPiou",
    pioupiou_desc: "Faites éclore vos poussins, mais attention au renard !",
    themind_title: "The Mind",
    themind_desc: "Jouez des cartes dans l'ordre croissant sans communiquer !",
    themind_level: "NIVEAU {level}",
    themind_lives: "VIES",
    themind_emps: "SHURIKENS",
    themind_syncing: "CONCENTRATION...",
    themind_playing: "EN JEU",
    themind_victory: "VICTOIRE",
    themind_game_over: "FIN DE PARTIE",
    justone_title: "Just One",
    justone_desc: "Aidez votre coéquipier à deviner le mot secret !",
    justone_mystery_word: "MOT MYSTÈRE",
    justone_clue_placeholder: "Entrez un indice...",
    justone_guess_placeholder: "Entrez votre réponse...",
    justone_standby: "Attente des indices",
    justone_validation: "COMPARER LES INDICES",
    justone_confirm_data: "CONFIRMER",
    justone_pass: "PASSER",
    justone_correct: "CORRECT",
    justone_wrong: "ERREUR",
    sushinode_title: "Sushi Go",
    sushinode_desc: "Collection de cartes rapide.",
    dixit_score: "SCORE",
    dixit_clue_placeholder: "Votre indice...",
    dixit_phase_clue: "CHOISIR CARTE & INDICE",
    dixit_phase_submit: "CORRESPONDRE À L'INDICE",
    dixit_phase_vote: "TROUVER LA VÉRITÉ",
    dixit_wait_storyteller: "Attente Conteur",
    dixit_wait_others: "Attente joueurs",
    dixit_guess_card: "Laquelle est l'originale ?",
    dixit_who_voted: "VOTANTS",
    dixit_st_bonus: "CERTAINS ONT TROUVÉ (BONUS CONTEUR)",
    dixit_st_fail: "TOUT LE MONDE OU PERSONNE (0 PTS)",
    dixit_st_fail_all: "TOUT LE MONDE A TROUVÉ",
    dixit_st_fail_none: "PERSONNE N'A TROUVÉ",
    dixit_found_original: "VOUS AVEZ TROUVÉ",
    dixit_found_original_all: "TOUT LE MONDE A TROUVÉ",
    dixit_found_original_none: "VOUS SEUL AVEZ TROUVÉ",
    dixit_others_fooled: "VOTES SUR VOTRE CARTE",
    dixit_all_or_none: "TOUS OU PERSONNE N'A TROUVÉ",
    rank_out_of: "{rank} sur {total}",
    LOG_LAY_EGG: "{player} a pondu ! 🥚",
    LOG_HATCH: "{player} a fait éclore ! 🐣",
    LOG_DISCARD: "{player} a jeté {card}. ♻️",
    LOG_INVALID: "Coup invalide ! 🚫",
    LOG_FOX_SUCCESS: "{player} a volé {target} ! 🦊",
    LOG_FOX_BLOCKED: "{target} a bloqué ! Suppression du dossier...",
    finalHand: "Main Finale",
    waitingPlayers: "Attente joueurs",
    minPlayersRequired: "{count} joueurs requis",
    testingNote: "",
    action: "ACTION",
    nearlyWinning: "PRESQUE GAGNÉ !",
    noEggsToSteal: "Pas d'oeufs !",
    yourTurn: "À VOUS",
    chicken: "Poussin",
    rooster: "Coq",
    fox: "Renard",
    nest: "Nid",
    lastEvents: "Événements récents",
    noEvents: "Aucun événement",
    ready: "Prêt",
    notReady: "Pas prêt",
    hand: "Main",
    room: "Salle",
    statusLive: "En cours",
    statusArchived: "Terminé",
    statusLobby: "Attente",
    invalidSession: "Jeu invalide",
    authenticating: "Connexion...",
    available: "Disponible",
    connectedPlayers: "Joueurs connectés",
    readyPlayers: "PRÊTS",
    waitingForPlayers: "Attente joueurs",
    madeBy: "Créé par Lunaris",
    unknown_predator: "Un Prédateur",
    waiting_for_sequence: "EN ATTENTE",
    
    themind_shurikens: "SHURIKENS",
    themind_team_stats: "ÉTAT DES JOUEURS",
    themind_hand_size: "CARTES RESTANTES",
    themind_discard_pile: "DÉFAUSSE",
    themind_awaiting_play: "ATTENTE JEU",
    themind_secured_by: "JOUÉ PAR",
    themind_ready_for_next: "NIVEAU RÉUSSI ! PRÊTS ?",
    themind_start_level: "NIVEAU SUIVANT",
    themind_level_progress: "PROGRESSION",
    themind_shuriken_request: "ÉTOILE DEMANDÉE",
    themind_shuriken_vote: "VOTE ACTIF",
    themind_shuriken_confirm: "TAP TO CONFIRM",
    themind_sector_stabilized: "Niveau {level} Réussi",
    themind_concentrating: "Concentration...",
    themind_terminal_locked: "FIN DE PARTIE",
    themind_miscalculated: "ERREUR",
    themind_purged: "DÉFAUSSÉ",
    
    justone_guesser: "DEVINEUR",
    justone_clue_submitted: "INDICE SOUMIS",
    justone_awaiting_clues: "ATTENTE INDICES...",
    justone_validated: "VALIDÉ",
    justone_accepted: "ACCEPTÉ",
    justone_rejected: "REJETÉ",
    justone_total_score: "SCORE TOTAL",
    justone_round_count: "TOUR",
    justone_ambiguity_detected: "AMBIGUÏTÉ DÉTECTÉE",
    justone_target_word: "LE MOT ÉTAIT",
    justone_consensus_required: "VALIDEZ L'INDICE",
    justone_all_canceled: "INDICES ANNULÉS",
    justone_session_ended: "FIN DE PARTIE",
    justone_submit_clue: "SOUMETTRE INDICE",
    justone_execute_guess: "RÉPONDRE",
    justone_waiting_sync: "Attente des autres...",
    justone_decryption_input: "RÉPONSE",
    justone_clue_input: "INDICE",
    justone_helper: "ASSISTANT",
    
    dixit_participants: "JOUEURS",
    dixit_clue_received: "L'INDICE EST",
    dixit_awaiting_st: "ATTENTE DU CONTEUR...",
    dixit_match_live: "PARTIE EN COURS",
    dixit_current_phase: "PHASE ACTUELLE",
    dixit_integrity: "PROGRESSION TOUR",
    dixit_node_owner: "JOUÉ PAR",
    dixit_received_guesses: "VOTES ({count})",
    dixit_guessers: "VOTANTS",
    dixit_wait_others_action: "Attente joueurs",
    
    pioupiou_match_telemetry: "ÉTAT DU JEU",
    pioupiou_resolution: "GAGNANT",
    pioupiou_encryption: "PHASE",
    pioupiou_secure: "ACTIF",
    
    shared_status: "STATUT",
    shared_rank: "RANG",
    shared_score: "SCORE",
    shared_players: "JOUEURS",
    shared_language: "LANGUE",
    shared_points: "PTS",
    boot_preparing: "PRÉPARATION PLATEAU",
    boot_syncing: "SYNCHRO JOUEURS",
    boot_starting: "DÉMARRAGE",
    boot_ready: "PRÊT",
    boot_loading: "CHARGEMENT",
  },
  de: {
    title: "LUNARIS",
    subtitle: "ARCADE-ZENTRUM",
    game: "SPIELE",
    wins: "SIEGE",
    rank: "RANG",
    namePlaceholder: "DEIN NAME",
    roomPlaceholder: "RAUMCODE",
    enterLobby: "BEITRETEN",
    board: "ZUM BRETT",
    arcade: "SPIELE",
    ongoingGames: "AKTIVE SPIELE",
    howToPlay: "SO WIRD GESPIELT",
    step1: "1. Seite auf TV öffnen.",
    step2: "2. QR-Code scannen.",
    step3: "3. Handy als Controller nutzen!",
    capacityLabel: "KAPAZITÄT",
    lobbyInitiation: "Lobby bereit...",
    matchInitiation: "Spiel starten",
    maxLabel: "MAX",
    players: "SPIELER",
    capacity: "KAPAZITÄT",
    hallOfFame: "HALL OF FAME",
    footer: "Lunaris Arcade v1.0.4",
    noOngoing: "Keine Spiele.",
    host: "HOSTEN",
    startMatch: "STARTEN",
    activeTurn: "AKTIVER ZUG",
    matchActivity: "SPIELPROTOKOLL",
    availableMoves: "MÖGLICHKEITEN",
    hintLayEgg: "EI LEGEN",
    hintHatch: "BRÜTEN",
    hintSteal: "EI STEHLEN",
    eggs: "EIER",
    chicks: "KÜKEN",
    targetPlayer: "ZIEL WÄHLEN 🦊",
    discard: "ABWERFEN",
    invalidCombo: "UNGÜLTIG",
    attack: "ANGRIFF",
    waiting: "WARTEN...",
    defend: "VERTEIDIGEN",
    noRoosters: "Keine Hähne!",
    accept: "EI GEBEN",
    gameOver: "SPIEL VORBEI",
    winner: "GEWINNER",
    victory: "SIEG!",
    champion: "CHAMPION",
    exit: "BEENDEN",
    lobby: "LOBBY",
    results: "ERGEBNISSE",
    storyteller: "ERZÄHLER",
    dixit_round_summary: "ZUSAMMENFASSUNG",
    dixit_title: "Dixit",
    dixit_desc: "Gib clevere Hinweise. Errate das Bild!",
    pioupiou_title: "PiouPiou",
    pioupiou_desc: "Lass Küken schlüpfen!",
    themind_title: "The Mind",
    themind_desc: "Spielt Karten in Reihenfolge ohne Worte!",
    themind_level: "LEVEL {level}",
    themind_lives: "LEBEN",
    themind_emps: "WURFSTERNE",
    themind_syncing: "KONZENTRATION...",
    themind_playing: "SPIELT",
    themind_victory: "SIEG",
    themind_game_over: "ENDE",
    justone_title: "Just One",
    justone_desc: "Hilf deinem Team das Wort zu erraten!",
    justone_mystery_word: "GEHEIMWORT",
    justone_clue_placeholder: "Hinweis eingeben...",
    justone_guess_placeholder: "Antwort eingeben...",
    justone_standby: "Warten auf Hinweise",
    justone_validation: "VERGLEICHEN",
    justone_confirm_data: "BESTÄTIGEN",
    justone_pass: "PASS",
    justone_correct: "RICHTIG",
    justone_wrong: "FALSCH",
    sushinode_title: "Sushi Go",
    sushinode_desc: "Schnelles Kartenspiel.",
    dixit_score: "PUNKTE",
    dixit_clue_placeholder: "Dein Hinweis...",
    dixit_phase_clue: "WÄHLEN",
    dixit_phase_submit: "ANPASSEN",
    dixit_phase_vote: "FINDEN",
    dixit_wait_storyteller: "Warten...",
    dixit_wait_others: "Warten...",
    dixit_guess_card: "Welches?",
    dixit_who_voted: "VOTER",
    dixit_st_bonus: "ERFOLG",
    dixit_st_fail: "FEHLSCHLAG",
    dixit_st_fail_all: "ALLE GEFUNDEN",
    dixit_st_fail_none: "NIEMAND GEFUNDEN",
    dixit_found_original: "GEFUNDEN",
    dixit_found_original_all: "ALLE GEFUNDEN",
    dixit_found_original_none: "NIEMAND GEFUNDEN",
    dixit_others_fooled: "VOTES AUF DEINE KARTE",
    dixit_all_or_none: "ALLE ODER NIEMAND HAT GERRATEN",
    rank_out_of: "{rank} von {total}",
    LOG_LAY_EGG: "{player} hat gelegt! 🥚",
    LOG_HATCH: "{player} ist geschlüpft! 🐣",
    LOG_DISCARD: "{player} warf {card} ab. ♻️",
    LOG_INVALID: "Ungültig! 🚫",
    LOG_FOX_SUCCESS: "{player} stahl von {target}! 🦊",
    LOG_FOX_BLOCKED: "{target} wehrte ab! 🐓🐓",
    finalHand: "Letzte Hand",
    waitingPlayers: "Warten...",
    minPlayersRequired: "{count} Spieler nötig",
    testingNote: "",
    action: "AKTION",
    nearlyWinning: "FAST GEWONNEN!",
    noEggsToSteal: "Keine Eier!",
    yourTurn: "DU BIST DRAN",
    chicken: "Küken",
    rooster: "Hahn",
    fox: "Fuchs",
    nest: "Nest",
    lastEvents: "Ereignisse",
    noEvents: "Keine",
    ready: "Ready",
    notReady: "Nicht bereit",
    hand: "Hand",
    room: "Raum",
    statusLive: "Aktiv",
    statusArchived: "Beendet",
    statusLobby: "Warten",
    invalidSession: "Ungültig",
    authenticating: "Verbinden...",
    available: "Verfügbar",
    connectedPlayers: "Spieler online",
    readyPlayers: "BEREIT",
    waitingForPlayers: "Warten...",
    madeBy: "Von Lunaris erstellt",
    unknown_predator: "Ein Räuber",
    waiting_for_sequence: "WARTET",
    
    themind_shurikens: "WURFSTERNE",
    themind_team_stats: "SPIELERSTATUS",
    themind_hand_size: "KARTEN",
    themind_discard_pile: "ABLAGE",
    themind_awaiting_play: "WARTEN",
    themind_secured_by: "VON",
    themind_ready_for_next: "BEREIT?",
    themind_start_level: "NÄCHSTES LEVEL",
    themind_level_progress: "FORTSCHRITT",
    themind_shuriken_request: "STERN?",
    themind_shuriken_vote: "VOTE",
    themind_shuriken_confirm: "TAP TO CONFIRM",
    themind_sector_stabilized: "Level {level} geschafft",
    themind_concentrating: "Konzentration...",
    themind_terminal_locked: "ENDE",
    themind_miscalculated: "FEHLER",
    themind_purged: "ABGELEGT",
    
    justone_guesser: "RATENDER",
    justone_clue_submitted: "BEREIT",
    justone_awaiting_clues: "WARTEN...",
    justone_validated: "OK",
    justone_accepted: "JA",
    justone_rejected: "NEIN",
    justone_total_score: "SCORE",
    justone_round_count: "RUNDE",
    justone_ambiguity_detected: "UNKLEAR",
    justone_target_word: "DAS WORT WAR",
    justone_consensus_required: "STIMMT DAS?",
    justone_all_canceled: "ALLE GELÖSCHT",
    justone_session_ended: "ENDE",
    justone_submit_clue: "HINWEIS GEBEN",
    justone_execute_guess: "RATEN",
    justone_waiting_sync: "Warten...",
    justone_decryption_input: "ANTWORT",
    justone_clue_input: "HINWEIS",
    justone_helper: "HELFER",
    
    dixit_participants: "SPIELER",
    dixit_clue_received: "HINWEIS",
    dixit_awaiting_st: "WARTEN...",
    dixit_match_live: "AKTIV",
    dixit_current_phase: "PHASE",
    dixit_integrity: "RUNDE",
    dixit_node_owner: "VON",
    dixit_received_guesses: "VOTES ({count})",
    dixit_guessers: "RATENDE",
    dixit_wait_others_action: "Warten...",
    
    pioupiou_match_telemetry: "STATUS",
    pioupiou_resolution: "GEWINNER",
    pioupiou_encryption: "PHASE",
    pioupiou_secure: "AKTIV",
    
    shared_status: "STATUS",
    shared_rank: "RANG",
    shared_score: "SCORE",
    shared_players: "SPIELER",
    shared_language: "SPRACHE",
    shared_points: "PKT",
    boot_preparing: "BEREITE BRETT VOR",
    boot_syncing: "SYNCHRONISIERE SPIELER",
    boot_starting: "STARTEN",
    boot_ready: "BEREIT",
    boot_loading: "LADEN",
  },
  fa: {
    title: "لوناریس",
    subtitle: "مرکز بازی",
    game: "بازی",
    wins: "برد",
    rank: "رتبه",
    namePlaceholder: "نام شما",
    roomPlaceholder: "کد اتاق",
    lobbyInitiation: "آماده‌سازی...",
    matchInitiation: "شروع بازی",
    enterLobby: "ورود به اتاق",
    board: "رفتن به بازی",
    arcade: "بازی‌ها",
    ongoingGames: "بازی‌های در جریان",
    howToPlay: "راهنمای بازی",
    step1: "۱. این صفحه را در تلویزیون باز کنید.",
    step2: "۲. کد اتاق را در گوشی وارد کنید.",
    step3: "۳. از گوشی به عنوان دسته استفاده کنید!",
    capacityLabel: "ظرفیت حداکثر",
    maxLabel: "حداکثر",
    players: "بازیکن",
    capacity: "ظرفیت",
    hallOfFame: "تالار مشاهیر",
    footer: "لوناریس نسخه ۱.۰.۴",
    noOngoing: "بازی فعالی وجود ندارد.",
    host: "ایجاد",
    startMatch: "شروع بازی",
    activeTurn: "نوبت فعلی",
    matchActivity: "گزارش بازی",
    availableMoves: "حرکت‌ها",
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
    noRoosters: "خروسی نداری!",
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
    dixit_desc: "درباره کارت‌ها سرنخ بدهید. تصویر درست را حدس بزنید!",
    pioupiou_title: "پیو پیو",
    pioupiou_desc: "جوجه‌هایتان را از تخم بیرون بیاورید!",
    themind_title: "The Mind",
    themind_desc: "اعداد را به ترتیب بازی کنید بدون کلام!",
    themind_level: "مرحله {level}",
    themind_lives: "جان‌ها",
    themind_emps: "ستاره‌ها",
    themind_syncing: "تمرکز...",
    themind_playing: "در حال بازی",
    themind_victory: "پیروزی",
    themind_game_over: "باخت",
    justone_title: "Just One",
    justone_desc: "به هم‌تیمی خود کمک کنید کلمه را حدس بزند!",
    justone_mystery_word: "کلمه رمز",
    justone_clue_placeholder: "سرنخ...",
    justone_guess_placeholder: "حدس نهایی...",
    justone_standby: "در انتظار سرنخ‌ها",
    justone_validation: "مقایسه سرنخ‌ها",
    justone_confirm_data: "تایید",
    justone_pass: "رد شدن",
    justone_correct: "درست",
    justone_wrong: "اشتباه",
    sushinode_title: "سوشی گو",
    sushinode_desc: "یارکشی سریع کارت‌ها.",
    dixit_score: "امتیاز",
    dixit_clue_placeholder: "سرنخ شما...",
    dixit_phase_clue: "انتخاب",
    dixit_phase_submit: "هماهنگی",
    dixit_phase_vote: "پیدا کردن",
    dixit_wait_storyteller: "انتظار قصه‌گو",
    dixit_wait_others: "انتظار بقیه",
    dixit_guess_card: "کدام؟",
    dixit_who_voted: "حدس‌زننده‌ها",
    dixit_st_bonus: "موفقیت",
    dixit_st_fail: "شکست",
    dixit_st_fail_all: "همه کارت شما را پیدا کردند",
    dixit_st_fail_none: "هیچ‌کس کارت شما را پیدا نکرد",
    dixit_found_original: "کارت اصلی را پیدا کردی",
    dixit_found_original_all: "همه کارت اصلی را پیدا کردند",
    dixit_found_original_none: "فقط شما کارت اصلی را پیدا کردید",
    dixit_others_fooled: "رای‌ها به کارت شما",
    dixit_all_or_none: "همه یا هیچ‌کس حدس زد",
    rank_out_of: "{rank} از {total}",
    LOG_LAY_EGG: "{player} تخم گذاشت! 🥚",
    LOG_HATCH: "{player} به دنیا آورد! 🐣",
    LOG_DISCARD: "{player} انداخت {card} ♻️",
    LOG_INVALID: "نامعتبر! 🚫",
    LOG_FOX_SUCCESS: "{player} دزدید از {target}! 🦊",
    LOG_FOX_BLOCKED: "{target} دفاع کرد! 🐓🐓",
    finalHand: "دست نهایی",
    waitingPlayers: "انتظار بازیکنان",
    minPlayersRequired: "{count} بازیکن لازم است",
    testingNote: "",
    action: "عملیات",
    nearlyWinning: "نزدیک پیروزی!",
    noEggsToSteal: "تخمی نیست!",
    yourTurn: "نوبت شما",
    chicken: "جوجه",
    rooster: "خروس",
    fox: "روباه",
    nest: "لانه",
    lastEvents: "گزارش‌ها",
    noEvents: "گزارشی نیست",
    ready: "آماده",
    notReady: "منتظر",
    hand: "دست",
    room: "اتاق",
    statusLive: "در جریان",
    statusArchived: "پایان",
    statusLobby: "لابی",
    invalidSession: "نامعتبر",
    authenticating: "اتصال...",
    available: "موجود",
    connectedPlayers: "بازیکنان",
    readyPlayers: "آماده",
    waitingForPlayers: "انتظار...",
    madeBy: "ساخته شده توسط لوناریس",
    unknown_predator: "یک شکارچی",
    waiting_for_sequence: "در انتظار حرکت",
    
    themind_shurikens: "ستاره‌ها",
    themind_team_stats: "وضعیت تیم",
    themind_hand_size: "کارت‌های باقی‌مانده",
    themind_discard_pile: "کارت‌های سوخته",
    themind_awaiting_play: "انتظار بازی",
    themind_secured_by: "بازی توسط",
    themind_ready_for_next: "مرحله تمام! آماده؟",
    themind_start_level: "شروع مرحله بعد",
    themind_level_progress: "پیشرفت مرحله",
    themind_shuriken_request: "درخواست ستاره",
    themind_shuriken_vote: "رای‌گیری",
    themind_shuriken_confirm: "تایید نهایی",
    themind_sector_stabilized: "مرحله {level} موفق",
    themind_concentrating: "تمرکز...",
    themind_terminal_locked: "پایان",
    themind_miscalculated: "اشتباه",
    themind_purged: "سوخته",
    
    justone_guesser: "حدس‌زننده",
    justone_clue_submitted: "سرنخ ثبت شد",
    justone_awaiting_clues: "انتظار سرنخ...",
    justone_validated: "تایید شده",
    justone_accepted: "قبول",
    justone_rejected: "رد",
    justone_total_score: "امتیاز کل",
    justone_round_count: "دور",
    justone_ambiguity_detected: "ابهام",
    justone_target_word: "کلمه بود",
    justone_consensus_required: "رای به سرنخ",
    justone_all_canceled: "حذف همه",
    justone_session_ended: "پایان",
    justone_submit_clue: "ثبت سرنخ",
    justone_execute_guess: "حدس زدن",
    justone_waiting_sync: "در انتظار بقیه...",
    justone_decryption_input: "حدس",
    justone_clue_input: "سرنخ",
    justone_helper: "یار کمکی",
    
    dixit_participants: "بازیکنان",
    dixit_clue_received: "سرنخ این است",
    dixit_awaiting_st: "انتظار قصه‌گو...",
    dixit_match_live: "بازی فعال",
    dixit_current_phase: "فاز فعلی",
    dixit_integrity: "پیشرفت دور",
    dixit_node_owner: "بازی توسط",
    dixit_received_guesses: "رای‌ها ({count})",
    dixit_guessers: "حدس‌زننده‌ها",
    dixit_wait_others_action: "انتظار بقیه",
    
    pioupiou_match_telemetry: "وضعیت",
    pioupiou_resolution: "برنده",
    pioupiou_encryption: "فاز",
    pioupiou_secure: "فعال",
    
    shared_status: "وضعیت",
    shared_rank: "رتبه",
    shared_score: "امتیاز",
    shared_players: "بازیکنان",
    shared_language: "زبان",
    shared_points: "امتیاز",
    boot_preparing: "آماده‌سازی برد",
    boot_syncing: "همگام‌سازی بازیکنان",
    boot_starting: "شروع",
    boot_ready: "آماده",
    boot_loading: "بارگذاری",
  },
};

/**
 * Converts English digits to Persian/Arabic digits for Farsi localization.
 */
export function toPersianDigits(num: string | number): string {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return String(num).replace(/\d/g, (d) => persianDigits[parseInt(d)]);
}

/**
 * Replaces placeholders like {player} in translation strings with actual data.
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
 * Resolves a game title based on database fields or translation keys
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
