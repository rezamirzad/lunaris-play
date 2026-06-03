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
  player: string;
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
  incangold_title: string;
  incangold_desc: string;
  incangold_round: string;
  incangold_path: string;
  incangold_stay: string;
  incangold_leave: string;
  incangold_gems: string;
  incangold_banked: string;
  incangold_in_temple: string;
  incangold_at_camp: string;
  incangold_decide: string;
  incangold_exploring: string;
  incangold_results: string;
  incangold_expedition_complete: string;
  incangold_hall_of_riches: string;
  incangold_adventurer: string;
  incangold_cave_n: string;
  incangold_total_wealth: string;
  incangold_close_rules: string;
  incangold_game_rules: string;
  incangold_next_cave: string;
  incangold_time_to_decide: string;
  incangold_continue_exploration: string;
  incangold_enter_cave: string;
  incangold_venture_deeper: string;
  incangold_expedition_ends: string;
  incangold_wealth_found: string;
  incangold_swallowed_by_cave: string;
  incangold_danger: string;
  incangold_gems_label: string;
  incangold_left: string;
  incangold_threat_level: string;
  incangold_path_gems: string;
  incangold_in_the_cave: string;
  incangold_exit_bonus: string;
  incangold_at_base_camp: string;
  incangold_lost_gems: string;
  incangold_the_dilemma: string;
  incangold_checking_fists: string;
  incangold_locked: string;
  incangold_host_advances: string;
  incangold_rules_title: string;
  incangold_goal_title: string;
  incangold_goal_desc: string;
  incangold_gems_rules_title: string;
  incangold_gems_rules_desc: string;
  incangold_dangers_rules_title: string;
  incangold_dangers_rules_desc: string;
  incangold_dilemma_rules_title: string;
  incangold_dilemma_rules_desc: string;
  incangold_leaving_rules_title: string;
  incangold_leaving_rules_desc: string;
  incangold_safety_rules_title: string;
  incangold_safety_rules_desc: string;
  incangold_final_stats: string;
  incangold_rank: string;
  incangold_back_to_arcade: string;
  incangold_in_hand: string;
  incangold_chest_total: string;
  incangold_resting_camp: string;
  incangold_safe_reach: string;
  incangold_expedition_result: string;
  incangold_waiting_reveal: string;
  incangold_secret_choice: string;
  incangold_risk_loot: string;
  incangold_bank_now: string;
  incangold_on_path_bonus: string;
  incangold_artifacts: string;
  incangold_choice_leave: string;
  incangold_choice_stay: string;
  incangold_title_alt: string;
  shared_tech_group: string;
  shared_waiting: string;
  timeattack_title: string;
  timeattack_desc: string;
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
  themind_link_integrity: string;
  themind_stable: string;
  themind_terminated: string;
  themind_transmission_lives: string;
  themind_briefing_title: string;
  themind_briefing_desc: string;
  themind_calibrating: string;
  themind_uplink_active: string;
  themind_frequency_refined: string;
  themind_level_cleared: string;
  themind_sync_next: string;
  themind_uplink_request_sent: string;
  themind_establishing_freq: string;
  themind_system_purged: string;
  themind_freq_stabilized: string;

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
  justone_briefing_title: string;
  justone_briefing_desc: string;
  justone_initializing_links: string;
  justone_signal_stream: string;
  justone_transmission_success: string;
  justone_security_override: string;
  justone_uplink_complete: string;

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
  dixit_briefing_title: string;
  dixit_briefing_desc: string;
  dixit_phase_incubation: string;
  dixit_phase_deciphering: string;
  dixit_champion_title: string;
  dixit_illusion_dissipated: string;

  pioupiou_match_telemetry: string;
  pioupiou_resolution: string;
  pioupiou_encryption: string;
  pioupiou_secure: string;
  pioupiou_henhouse_integrity: string;
  pioupiou_fox_infiltration: string;
  pioupiou_champion_title: string;
  pioupiou_analyzing_strategy: string;
  pioupiou_tactical_feed: string;
  pioupiou_henhouse_defense: string;
  pioupiou_briefing_desc: string;
  pioupiou_securing_perimeters: string;

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
  timeattack_victory_lap: string;
  timeattack_current_phase: string;
  timeattack_round: string;
  timeattack_target: string;
  timeattack_eyes_on_phone: string;
  timeattack_end_input_window: string;
  timeattack_round_results: string;
  timeattack_target_duration: string;
  timeattack_actual: string;
  timeattack_delta: string;
  timeattack_reward: string;
  timeattack_next_round: string;
  timeattack_final_ranking: string;
  timeattack_sync_wave_masters: string;
  timeattack_return_to_arcade: string;
  timeattack_back_to_main_menu: string;
  timeattack_start_round: string;
  timeattack_sync_wave_v1: string;
  timeattack_s_and: string;
  timeattack_ms: string;
  timeattack_personal_timer: string;
  timeattack_locked: string;
  timeattack_waiting_reveal: string;
  timeattack_done: string;
  timeattack_hold: string;
  timeattack_release: string;
  timeattack_start: string;
  timeattack_stop: string;
  timeattack_hold_to_start: string;
  timeattack_tap_to_start: string;
  timeattack_release_at_target: string;
  timeattack_tap_to_stop: string;
  timeattack_time_recorded: string;
  timeattack_final_results: string;
  timeattack_leave_game: string;
  timeattack_waiting_next_round: string;
  timeattack_current_goal: string;
  timeattack_instructions: string;
  timeattack_goal: string;
  timeattack_how: string;
  timeattack_briefing_title: string;
  timeattack_briefing_desc: string;
  timeattack_syncing_oscillators: string;
  timeattack_masters: string;
  timeattack_integrity_verified: string;
  timeattack_global_champion: string;
  timeattack_extraction_sequences: string;
  timeattack_round_victor: string;
  timeattack_transmission_decrypted: string;
  timeattack_neural_link_readiness: string;
  timeattack_sync_all_freq: string;
  timeattack_objective_sequence: string;
  timeattack_extraction_decrypted: string;
  timeattack_calibrating: string;
  timeattack_transmitting: string;
  timeattack_transmission_locked: string;
  timeattack_analyzing_variance: string;
  timeattack_arcade_rankings: string;
  timeattack_round_protocol: string;
  timeattack_round_1_name: string;
  timeattack_round_1_goal: string;
  timeattack_round_1_how: string;
  timeattack_round_2_name: string;
  timeattack_round_2_goal: string;
  timeattack_round_2_how: string;
  timeattack_round_3_name: string;
  timeattack_round_3_goal: string;
  timeattack_round_3_how: string;
  timeattack_round_4_name: string;
  timeattack_round_4_goal: string;
  timeattack_round_4_how: string;
  timeattack_round_5_name: string;
  timeattack_round_5_goal: string;
  timeattack_round_5_how: string;
  timeattack_round_6_name: string;
  timeattack_round_6_goal: string;
  timeattack_round_6_how: string;
  timeattack_round_7_name: string;
  timeattack_round_7_goal: string;
  timeattack_round_7_how: string;
  timeattack_round_7_warning: string;
  timeattack_round_8_name: string;
  timeattack_round_8_goal: string;
  timeattack_round_8_how: string;
  timeattack_round_9_name: string;
  timeattack_round_9_goal: string;
  timeattack_round_9_how: string;
  timeattack_round_10_name: string;
  timeattack_round_10_goal: string;
  timeattack_round_10_how: string;
  timeattack_round_10_penalty: string;
  timeattack_start_protocol: string;
  timeattack_extract_data: string;
  timeattack_next_sequence: string;
}

export const translations: Record<Language, TranslationSet> = {
  en: {
    title: "LUNARIS",
    subtitle: "ARCADE HUB",
    game: "GAMES",
    wins: "WINS",
    rank: "RANK",
    board: "TO BOARD",
    namePlaceholder: "YOUR NAME",
    roomPlaceholder: "ROOM CODE",
    enterLobby: "JOIN ROOM",
    lobbyInitiation: "Preparing lobby...",
    matchInitiation: "Start game",
    arcade: "AVAILABLE GAMES",
    ongoingGames: "ONGOING SESSIONS",
    howToPlay: "HOW TO PLAY",
    hallOfFame: "HALL OF FAME",
    step1: "1. Open this page on your TV to HOST.",
    step2: "2. Scan the QR code on your PHONE.",
    step3: "3. Use your phone as the controller!",
    capacityLabel: "MAXIMUM PLAYERS",
    maxLabel: "MAX",
    player: "Player",
    players: "PLAYERS",
    capacity: "CAPACITY",
    footer: "LUNARIS Arcade v1.0.4",
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
    dixit_desc:
      "A dreamlike game of imagination. Spin a story around mysterious art and see who can find the truth.",
    pioupiou_title: "PiouPiou",
    pioupiou_desc:
      "A fast-paced tactical game for the family. Lay eggs and hatch chicks while dodging the sneaky fox.",
    themind_title: "The Mind",
    themind_desc:
      "Can you beat the game without a single word? Become one with your team and play cards in perfect harmony.",
    themind_level: "LEVEL {level}",
    themind_lives: "LIVES",
    themind_emps: "THROWING STARS",
    themind_syncing: "CONCENTRATING...",
    themind_playing: "PLAYING",
    themind_victory: "VICTORY",
    themind_game_over: "GAME OVER",
    justone_title: "Just One",
    justone_desc:
      "A clever word game of teamwork and deduction. Give unique clues to help the guesser, but don't get canceled out!",
    justone_mystery_word: "MYSTERY WORD",
    justone_clue_placeholder: "Enter single-word clue...",
    justone_guess_placeholder: "Enter final guess...",
    justone_standby: "Wait for clues",
    justone_validation: "COMPARE CLUES",
    justone_confirm_data: "CONFIRM",
    justone_pass: "PASS",
    justone_correct: "CORRECT",
    justone_wrong: "WRONG",
    incangold_title: "Incan Gold",
    incangold_desc:
      "A push-your-luck game of temple exploration. How deep will you go for gems?",
    incangold_round: "Round {round} / 5",
    incangold_path: "Expedition Path",
    incangold_stay: "GO DEEPER",
    incangold_leave: "GET OUT",
    incangold_gems: "GEMS",
    incangold_banked: "BANKED",
    incangold_in_temple: "IN TEMPLE",
    incangold_at_camp: "AT CAMP",
    incangold_decide: "TIME TO DECIDE!",
    incangold_exploring: "Exploring...",
    incangold_results: "EXPEDITION SUMMARY",
    incangold_expedition_complete: "Expedition Complete",
    incangold_hall_of_riches: "The Hall of Riches",
    incangold_adventurer: "Adventurer",
    incangold_cave_n: "Cave {n}",
    incangold_total_wealth: "Total Wealth",
    incangold_close_rules: "Close Rules",
    incangold_game_rules: "Game Rules",
    incangold_next_cave: "Next Cave →",
    incangold_time_to_decide: "Time to Decide",
    incangold_continue_exploration: "Continue Exploration",
    incangold_enter_cave: "Enter the Cave",
    incangold_venture_deeper: "Venture Deeper",
    incangold_expedition_ends: "Expedition Ends",
    incangold_wealth_found: "Total Wealth Found",
    incangold_swallowed_by_cave: "Swallowed by Cave",
    incangold_danger: "Danger",
    incangold_gems_label: "Gems",
    incangold_left: "Left:",
    incangold_threat_level: "Threat Level",
    incangold_path_gems: "Path Gems",
    incangold_in_the_cave: "In the Cave",
    incangold_exit_bonus: "Exit Bonus: +{n}",
    incangold_at_base_camp: "At Base Camp",
    incangold_lost_gems: "Lost {n} Gems",
    incangold_the_dilemma: "The Dilemma",
    incangold_checking_fists: "Checking fists...",
    incangold_locked: "LOCKED",
    incangold_host_advances: "Host advances after choices",
    incangold_rules_title: "Rules of Expedition",
    incangold_goal_title: "The Goal",
    incangold_goal_desc:
      "Bring back the most rubies and diamonds from 5 cave expeditions. The richest adventurer wins.",
    incangold_gems_rules_title: "Diamonds & Rubies",
    incangold_gems_rules_desc:
      "Divide treasures equally among all adventurers in the cave. Any remainder stays on the card to be collected by those who leave later.",
    incangold_dangers_rules_title: "Dangers",
    incangold_dangers_rules_desc:
      "A danger card appearing for the first time is safe. If the SAME danger appears a second time, everyone flees empty-handed!",
    incangold_dilemma_rules_title: "The Dilemma",
    incangold_dilemma_rules_desc:
      "Before each card, you must decide: STAY to go deeper for more loot, or LEAVE to return to camp and bank your current treasure.",
    incangold_leaving_rules_title: "Leaving the Cave",
    incangold_leaving_rules_desc:
      "If you leave, you bank everything found this round PLUS you pick up all leftover gems currently sitting on cards on the path.",
    incangold_safety_rules_title: "Safety First",
    incangold_safety_rules_desc:
      "If several players leave at once, they divide the path gems equally. The remainder stays for the next brave soul.",
    incangold_final_stats: "Final Statistics",
    incangold_rank: "Rank",
    incangold_back_to_arcade: "BACK TO ARCADE",
    incangold_in_hand: "In Hand",
    incangold_chest_total: "Chest Total",
    incangold_resting_camp: "Resting at Camp",
    incangold_safe_reach: "Safe from the cave's reach",
    incangold_expedition_result: "Expedition Result",
    incangold_waiting_reveal: "Waiting for the reveal",
    incangold_secret_choice: "A secret choice must be made",
    incangold_risk_loot: "Risk the current loot",
    incangold_bank_now: "Bank everything now",
    incangold_on_path_bonus: "+{n} ON PATH",
    incangold_artifacts: "Artifacts",
    incangold_choice_leave: "Camp",
    incangold_choice_stay: "Torch",
    incangold_title_alt: "DIAMANT",
    shared_tech_group: "LUNARIS TECH GROUP",
    shared_waiting: "WAITING...",
    timeattack_title: "Time Attack",
    timeattack_desc:
      "Test your internal clock to the millisecond. 10 rounds of high-pressure rhythmic challenges.",
    sushinode_title: "Sushi Go",
    sushinode_desc:
      "The pick-and-pass card game. Build the best sushi plate by drafting the perfect combination of dishes.",
    dixit_score: "SCORE",
    dixit_clue_placeholder: "Your clue...",
    dixit_phase_clue: "CHOOSE CARTE & INDICE",
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
    madeBy: "Created by LUNARIS",
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
    themind_link_integrity: "Link Integrity",
    themind_stable: "Stable",
    themind_terminated: "Terminated",
    themind_transmission_lives: "Transmission Lives",
    themind_briefing_title: "Frequency Alignment",
    themind_briefing_desc:
      "Data transmission is restricted. You must synchronize your internal frequencies to play cards in ascending order without verbal cues. One misstep compromises the neural link. Trust the silence. Trust your team.",
    themind_calibrating: "Calibrating psychic nodes...",
    themind_uplink_active: "Uplink Active",
    themind_frequency_refined: "Frequency Refined",
    themind_level_cleared: "Level {level} Cleared",
    themind_sync_next: "Sync Next Link",
    themind_uplink_request_sent: "Uplink Request Signal Sent",
    themind_establishing_freq: "Establishing Collective Frequency...",
    themind_system_purged: "Neural System Purged",
    themind_freq_stabilized: "Harmonic Frequency Achieved",

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
    justone_briefing_title: "Hive Mind Protocol",
    justone_briefing_desc:
      "We must transmit the target concept to the Infiltrator without triggering the security overrides. Submit one word as a clue. If your clue matches another agent's, the system will delete both before transmission. Be original, but be precise.",
    justone_initializing_links: "Initializing neural links...",
    justone_signal_stream: "Signal Stream {round} / 13",
    justone_transmission_success: "Transmission Successful",
    justone_security_override: "Security Override",
    justone_uplink_complete: "UPLINK COMPLETE",

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
    dixit_briefing_title: "The Art of Illusion",
    dixit_briefing_desc:
      "Words are blunt instruments. We communicate through imagery, metaphor, and intuition. As the Storyteller, craft a clue ambiguous enough to fool some, but precise enough to guide your true allies. As an Agent, decipher the vision to find the true source.",
    dixit_phase_incubation: "Incubation",
    dixit_phase_deciphering: "Deciphering",
    dixit_champion_title: "The Master Illusionist",
    dixit_illusion_dissipated: "Illusion Dissipated",

    pioupiou_match_telemetry: "GAME STATUS",
    pioupiou_resolution: "WINNER",
    pioupiou_encryption: "PHASE",
    pioupiou_secure: "ACTIVE",
    pioupiou_henhouse_integrity: "Henhouse Integrity",
    pioupiou_fox_infiltration: "Fox Infiltration!",
    pioupiou_champion_title: "The Henhouse Champion",
    pioupiou_analyzing_strategy: "Analyzing strategy...",
    pioupiou_tactical_feed: "Tactical Feed",
    pioupiou_henhouse_defense: "Henhouse Defense",
    pioupiou_briefing_desc:
      "The fox is lurking. You must gather resources—Roosters, Chickens, and Nests—to secure your eggs and hatch three chicks before your rivals. Deploy your defense strategies and protect the coop at all costs.",
    pioupiou_securing_perimeters: "Securing nesting perimeters...",

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

    timeattack_victory_lap: "Victory Lap",
    timeattack_current_phase: "Current Phase",
    timeattack_round: "Round",
    timeattack_target: "Target",
    timeattack_eyes_on_phone: "EYES ON PHONE",
    timeattack_end_input_window: "End Input Window",
    timeattack_round_results: "Round Results",
    timeattack_target_duration: "Target Duration",
    timeattack_actual: "Actual",
    timeattack_delta: "Variance",
    timeattack_reward: "Reward",
    timeattack_next_round: "Next Round",
    timeattack_final_ranking: "Final Ranking",
    timeattack_sync_wave_masters: "The Sync Wave Masters",
    timeattack_return_to_arcade: "Return to Arcade",
    timeattack_back_to_main_menu: "Back to Main Menu",
    timeattack_start_round: "Start Round",
    timeattack_sync_wave_v1: "Sync Wave v1.0",
    timeattack_s_and: "s and",
    timeattack_ms: "ms",
    timeattack_personal_timer: "Personal Timer",
    timeattack_locked: "LOCKED",
    timeattack_waiting_reveal: "Waiting for reveal...",
    timeattack_done: "DONE",
    timeattack_hold: "HOLD",
    timeattack_release: "RELEASE",
    timeattack_start: "START",
    timeattack_stop: "STOP",
    timeattack_hold_to_start: "Hold to start timer",
    timeattack_tap_to_start: "Tap to start timer",
    timeattack_release_at_target: "Release at target",
    timeattack_tap_to_stop: "Tap to stop clock",
    timeattack_time_recorded: "Time Recorded",
    timeattack_final_results: "Final Results",
    timeattack_leave_game: "Leave Game",
    timeattack_waiting_next_round: "Waiting for Next Round...",
    timeattack_current_goal: "Current Goal",
    timeattack_instructions: "Instructions",
    timeattack_goal: "GOAL",
    timeattack_how: "HOW",
    timeattack_briefing_title: "Temporal Precision",
    timeattack_briefing_desc:
      "Reaction time is the only currency in this simulation. You will be given target intervals. Synchronize your actions with the system clock to achieve absolute precision. Milliseconds determine the victor.",
    timeattack_syncing_oscillators: "Syncing temporal oscillators...",
    timeattack_masters: "The Time Masters",
    timeattack_integrity_verified: "Simulation Integrity Verified",
    timeattack_global_champion: "Global Champion",
    timeattack_extraction_sequences: "Data Extraction Sequences",
    timeattack_round_victor: "Round Victor",
    timeattack_transmission_decrypted: "Transmission Decrypted",
    timeattack_neural_link_readiness: "Neural Link Readiness",
    timeattack_sync_all_freq: "Synchronize all frequencies to engage protocol",
    timeattack_objective_sequence: "Objective Sequence",
    timeattack_extraction_decrypted: "Transmission Decrypted",
    timeattack_calibrating: "Calibrating...",
    timeattack_transmitting: "TRANSMITTING...",
    timeattack_transmission_locked: "TRANSMISSION LOCKED",
    timeattack_analyzing_variance: "Analyzing temporal variance...",
    timeattack_arcade_rankings: "Arcade Rankings",
    timeattack_round_protocol: "Round {round} Protocol",
    timeattack_round_1_name: "The Warmup",
    timeattack_round_1_goal: "Record a duration of exactly 5.00 seconds.",
    timeattack_round_1_how:
      "Tap START on your phone to begin your personal clock. Tap STOP when you think 5 seconds have passed. A guide timer will appear on the TV for 2 seconds to help you calibrate.",
    timeattack_round_2_name: "Micro-Fraction",
    timeattack_round_2_goal: "Record the randomized duration.",
    timeattack_round_2_how:
      "Tap START then STOP on your phone. NO TIMER will be shown on the TV. Rely purely on your internal rhythm.",
    timeattack_round_3_name: "The Metronome",
    timeattack_round_3_goal: "Match the rhythm.",
    timeattack_round_3_how:
      "Tap START then STOP. The TV will show distracting visual artifacts. Don't let them break your concentration!",
    timeattack_round_4_name: "Reaction Flash",
    timeattack_round_4_goal: "Pure reaction speed.",
    timeattack_round_4_how:
      "Tap START then STOP as fast as physically possible. A flash on the TV will signal when to begin.",
    timeattack_round_5_name: "The Perfect Third",
    timeattack_round_5_goal: "Record exactly 3.33 seconds.",
    timeattack_round_5_how:
      "No guide timer. This round requires extreme precision. The non-standard target will challenge your counting rhythm.",
    timeattack_round_6_name: "The Long Shot",
    timeattack_round_6_goal: "Record the long-form target.",
    timeattack_round_6_how:
      "Tap START then STOP. The TV will glitch and distort. Focus intensely on your internal count.",
    timeattack_round_7_name: "Time Bomb",
    timeattack_round_7_goal: "Hold for the target time.",
    timeattack_round_7_how:
      "PRESS AND HOLD to start the fuse. RELEASE at the target time.",
    timeattack_round_7_warning:
      "WARNING: If you release AFTER the target, the bomb EXPLODES and you lose 20% of your total game score!",
    timeattack_round_8_name: "The Heartbeat",
    timeattack_round_8_goal: "Match a slow pulse of 0.75 seconds.",
    timeattack_round_8_how:
      "Tap START then STOP. The TV will flicker rapidly to disrupt your visual perception of time.",
    timeattack_round_9_name: "Binary Pulse",
    timeattack_round_9_goal: "Record exactly 1.01 seconds.",
    timeattack_round_9_how:
      "A high-precision offset challenge. No guide timer. Rely purely on muscle memory.",
    timeattack_round_10_name: "Meltdown",
    timeattack_round_10_goal: "FINAL CHALLENGE. Hold for exactly 4.04 seconds.",
    timeattack_round_10_how:
      "PRESS AND HOLD. The TV will glitch violently. Make it count!",
    timeattack_round_10_penalty:
      "If you release LATE, you lose 30% of your total score.",
    timeattack_start_protocol: "START PROTOCOL",
    timeattack_extract_data: "EXTRACT DATA",
    timeattack_next_sequence: "NEXT SEQUENCE",
  },
  fr: {
    title: "LUNARIS",
    subtitle: "CENTRE ARCADE",
    game: "JEUX",
    wins: "VICTOIRES",
    rank: "RANG",
    board: "AU PLATEAU",
    namePlaceholder: "VOTRE NOM",
    roomPlaceholder: "CODE SALLE",
    enterLobby: "REJOINDRE",
    lobbyInitiation: "Préparation du salon...",
    matchInitiation: "Démarrer la partie",
    arcade: "JEUX DISPONIBLES",
    ongoingGames: "SESSIONS EN COURS",
    howToPlay: "COMMENT JOUER",
    hallOfFame: "TABLEAU D'HONNEUR",
    step1: "1. Ouvrez cette page sur TV pour HÉBERGER.",
    step2: "2. Scannez le QR sur MOBILE.",
    step3: "3. Jouez avec votre mobile !",
    capacityLabel: "CAPACITÉ MAXIMUM",
    maxLabel: "MAX",
    player: "Joueur",
    players: "JOUEURS",
    capacity: "CAPACITY",
    footer: "LUNARIS Arcade v1.0.4",
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
    dixit_desc:
      "Un jeu d'imagination onirique. Racontez des histoires autour d'œuvres d'art mystérieuses et trouvez la vérité.",
    pioupiou_title: "PiouPiou",
    pioupiou_desc:
      "Un jeu tactique rapide pour toute la famille. Faites éclore vos poussins tout en évitant le renard rusé.",
    themind_title: "The Mind",
    themind_desc:
      "Pouvez-vous gagner sans dire un mot ? Ne faites qu'un avec votre équipe et jouez vos cartes en parfaite harmonie.",
    themind_level: "NIVEAU {level}",
    themind_lives: "VIES",
    themind_emps: "SHURIKENS",
    themind_syncing: "CONCENTRATION...",
    themind_playing: "EN JEU",
    themind_victory: "VICTOIRE",
    themind_game_over: "FIN DE PARTIE",
    justone_title: "Just One",
    justone_desc:
      "Un jeu de mots malin basé sur la coopération. Donnez des indices uniques pour aider le devineur sans être éliminé !",
    justone_mystery_word: "MOT MYSTÈRE",
    justone_clue_placeholder: "Entrez un indice...",
    justone_guess_placeholder: "Entrez votre réponse...",
    justone_standby: "Attente des indices",
    justone_validation: "COMPARER LES INDICES",
    justone_confirm_data: "CONFIRMER",
    justone_pass: "PASSER",
    justone_correct: "CORRECT",
    justone_wrong: "ERREUR",
    incangold_title: "Incan Gold",
    incangold_desc:
      "Un jeu d'exploration de temple et de prise de risque. Jusqu'où irez-vous pour des gemmes ?",
    incangold_round: "Manche {round} / 5",
    incangold_path: "Chemin de l'Expédition",
    incangold_stay: "CONTINUER",
    incangold_leave: "SORTIR",
    incangold_gems: "GEMMES",
    incangold_banked: "EN SÉCURITÉ",
    incangold_in_temple: "DANS LE TEMPLE",
    incangold_at_camp: "AU CAMP",
    incangold_decide: "C'EST L'HEURE DE DÉCIDER !",
    incangold_exploring: "Exploration en cours...",
    incangold_results: "RÉSUMÉ DE L'EXPÉDITION",
    incangold_expedition_complete: "Expedition Terminée",
    incangold_hall_of_riches: "Le Temple des Richesses",
    incangold_adventurer: "Aventurier",
    incangold_cave_n: "Grotte {n}",
    incangold_total_wealth: "Richesse Totale",
    incangold_close_rules: "Fermer les Règles",
    incangold_game_rules: "Règles du Jeu",
    incangold_next_cave: "Prochaine Grotte →",
    incangold_time_to_decide: "L'Heure du Choix",
    incangold_continue_exploration: "Continuer l'Exploration",
    incangold_enter_cave: "Entrer dans la Grotte",
    incangold_venture_deeper: "S'aventurer Plus Loin",
    incangold_expedition_ends: "Fin de l'Expédition",
    incangold_wealth_found: "Trésors Découverts",
    incangold_swallowed_by_cave: "Englouti par la Grotte",
    incangold_danger: "Danger",
    incangold_gems_label: "Gemmes",
    incangold_left: "Restant:",
    incangold_threat_level: "Niveau de Menace",
    incangold_path_gems: "Gemmes du Chemin",
    incangold_in_the_cave: "Dans la Grotte",
    incangold_exit_bonus: "Bonus de Sortie: +{n}",
    incangold_at_base_camp: "Au Camp de Base",
    incangold_lost_gems: "{n} Gemmes Perdues",
    incangold_the_dilemma: "Le Dilemme",
    incangold_checking_fists: "Vérification des poings...",
    incangold_locked: "VERROUILLÉ",
    incangold_host_advances: "L'hôte avance après les choix",
    incangold_rules_title: "Règles de l'Expédition",
    incangold_goal_title: "L'Objectif",
    incangold_goal_desc:
      "Rapportez le plus de rubis et de diamants de 5 expéditions. L'aventurier le plus riche gagne.",
    incangold_gems_rules_title: "Diamants & Rubis",
    incangold_gems_rules_desc:
      "Divisez les trésors également entre tous les aventuriers dans la grotte. Le reste reste sur la carte pour les suivants.",
    incangold_dangers_rules_title: "Dangers",
    incangold_dangers_rules_desc:
      "Une carte danger apparaissant pour la première fois est sans risque. Si le MÊME danger apparaît deux fois, tout le monde fuit les mains vides !",
    incangold_dilemma_rules_title: "Le Dilemme",
    incangold_dilemma_rules_desc:
      "Avant chaque carte, vous devez décider : CONTINUER pour plus de trésors, ou SORTIR pour rentrer au camp et mettre votre butin en sécurité.",
    incangold_leaving_rules_title: "Quitter la Grotte",
    incangold_leaving_rules_desc:
      "Si vous sortez, vous encaissez tout ce que vous avez trouvé ce tour-ci PLUS toutes les gemmes laissées sur le chemin.",
    incangold_safety_rules_title: "La Sécurité d'Abord",
    incangold_safety_rules_desc:
      "Si plusieurs joueurs sortent en même temps, they divisent les gemmes du chemin également. Le reste attend le prochain brave.",
    incangold_final_stats: "Statistiques Finales",
    incangold_rank: "Rang",
    incangold_back_to_arcade: "RETOUR À L'ARCADE",
    incangold_in_hand: "En Main",
    incangold_chest_total: "Total du Coffre",
    incangold_resting_camp: "Repos au Camp",
    incangold_safe_reach: "À l'abri de la grotte",
    incangold_expedition_result: "Résultat de l'Expédition",
    incangold_waiting_reveal: "En attente du résultat",
    incangold_secret_choice: "Un choix secret doit être fait",
    incangold_risk_loot: "Risquer le butin actuel",
    incangold_bank_now: "Tout encaisser maintenant",
    incangold_on_path_bonus: "+{n} SUR LE CHEMIN",
    incangold_artifacts: "Artéfacts",
    incangold_choice_leave: "Camp",
    incangold_choice_stay: "Torche",
    incangold_title_alt: "DIAMANT",
    shared_tech_group: "GROUPE TECH LUNARIS",
    shared_waiting: "EN ATTENTE...",
    timeattack_title: "Time Attack",
    timeattack_desc:
      "Testez votre horloge interne à la milliseconde près. 10 manches de défis rythmiques sous haute pression.",
    sushinode_title: "Sushi Go",
    sushinode_desc:
      "Le jeu de cartes rapide. Composez le meilleur plateau de sushis en choisissant les meilleures combinaisons de plats.",
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
    madeBy: "Créé par LUNARIS",
    unknown_predator: "Un Prédateur",
    waiting_for_sequence: "EN ATTENTE",

    themind_shurikens: "SHURIKENS",
    themind_team_stats: "ÉTAT DES JOUEURS",
    themind_hand_size: "CARDS REMAINING",
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
    themind_link_integrity: "Link Integrity",
    themind_stable: "Stable",
    themind_terminated: "Terminated",
    themind_transmission_lives: "Transmission Lives",
    themind_briefing_title: "Frequency Alignment",
    themind_briefing_desc:
      "Data transmission is restricted. You must synchronize your internal frequencies to play cards in ascending order without verbal cues. One misstep compromises the neural link. Trust the silence. Trust your team.",
    themind_calibrating: "Calibrating psychic nodes...",
    themind_uplink_active: "Uplink Active",
    themind_frequency_refined: "Frequency Refined",
    themind_level_cleared: "Level {level} Cleared",
    themind_sync_next: "Sync Next Link",
    themind_uplink_request_sent: "Uplink Request Signal Sent",
    themind_establishing_freq: "Establishing Collective Frequency...",
    themind_system_purged: "Neural System Purged",
    themind_freq_stabilized: "Harmonic Frequency Achieved",

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
    justone_briefing_title: "Hive Mind Protocol",
    justone_briefing_desc:
      "We must transmit the target concept to the Infiltrator without triggering the security overrides. Submit one word as a clue. If your clue matches another agent's, the system will delete both before transmission. Be original, but be precise.",
    justone_initializing_links: "Initializing neural links...",
    justone_signal_stream: "Signal Stream {round} / 13",
    justone_transmission_success: "Transmission Successful",
    justone_security_override: "Security Override",
    justone_uplink_complete: "UPLINK COMPLETE",

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
    dixit_briefing_title: "The Art of Illusion",
    dixit_briefing_desc:
      "Words are blunt instruments. We communicate through imagery, metaphor, and intuition. As the Storyteller, craft a clue ambiguous enough to fool some, but precise enough to guide your true allies. As an Agent, decipher the vision to find the true source.",
    dixit_phase_incubation: "Incubation",
    dixit_phase_deciphering: "Deciphering",
    dixit_champion_title: "Le Maître Illusionniste",
    dixit_illusion_dissipated: "Illusion Dissipated",

    pioupiou_match_telemetry: "ÉTAT DU JEU",
    pioupiou_resolution: "GAGNANT",
    pioupiou_encryption: "PHASE",
    pioupiou_secure: "ACTIF",
    pioupiou_henhouse_integrity: "Henhouse Integrity",
    pioupiou_fox_infiltration: "Fox Infiltration!",
    pioupiou_champion_title: "The Henhouse Champion",
    pioupiou_analyzing_strategy: "Analyzing strategy...",
    pioupiou_tactical_feed: "Tactical Feed",
    pioupiou_henhouse_defense: "Henhouse Defense",
    pioupiou_briefing_desc:
      "The fox is lurking. You must gather resources—Roosters, Chickens, and Nests—to secure your eggs and hatch three chicks before your rivals. Deploy your defense strategies and protect the coop at all costs.",
    pioupiou_securing_perimeters: "Securing nesting perimeters...",

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

    timeattack_victory_lap: "Tour d'honneur",
    timeattack_current_phase: "Phase Actuelle",
    timeattack_round: "Tour",
    timeattack_target: "Cible",
    timeattack_eyes_on_phone: "YEUX SUR TÉLÉPHONE",
    timeattack_end_input_window: "Fin de Saisie",
    timeattack_round_results: "Résultats du Tour",
    timeattack_target_duration: "Durée Cible",
    timeattack_actual: "Réel",
    timeattack_delta: "Écart",
    timeattack_reward: "Récompense",
    timeattack_next_round: "Tour Suivant",
    timeattack_final_ranking: "Classement Final",
    timeattack_sync_wave_masters: "Les Maîtres de Sync Wave",
    timeattack_return_to_arcade: "Retour à l'Arcade",
    timeattack_back_to_main_menu: "Menu Principal",
    timeattack_start_round: "Démarrer Tour",
    timeattack_sync_wave_v1: "Sync Wave v1.0",
    timeattack_s_and: "s et",
    timeattack_ms: "ms",
    timeattack_personal_timer: "Chrono Personnel",
    timeattack_locked: "VERROUILLÉ",
    timeattack_waiting_reveal: "Attente révélation...",
    timeattack_done: "TERMINÉ",
    timeattack_hold: "MAINTENIR",
    timeattack_release: "RELÂCHER",
    timeattack_start: "START",
    timeattack_stop: "STOP",
    timeattack_current_goal: "Objectif Actuel",
    timeattack_instructions: "Instructions",
    timeattack_hold_to_start: "Maintenir pour démarrer",
    timeattack_tap_to_start: "Appuyer pour démarrer",
    timeattack_release_at_target: "Relâcher à la cible",
    timeattack_tap_to_stop: "Appuyer pour arrêter",
    timeattack_time_recorded: "Temps Enregistré",
    timeattack_final_results: "Résultats Finaux",
    timeattack_leave_game: "Quitter le Jeu",
    timeattack_waiting_next_round: "Attente tour suivant...",
    timeattack_goal: "BUT",
    timeattack_how: "COMMENT",
    timeattack_briefing_title: "Temporal Precision",
    timeattack_briefing_desc:
      "Reaction time is the only currency in this simulation. You will be given target intervals. Synchronize your actions with the system clock to achieve absolute precision. Milliseconds determine the victor.",
    timeattack_syncing_oscillators: "Syncing temporal oscillators...",
    timeattack_masters: "The Time Masters",
    timeattack_integrity_verified: "Simulation Integrity Verified",
    timeattack_global_champion: "Global Champion",
    timeattack_extraction_sequences: "Data Extraction Sequences",
    timeattack_round_victor: "Round Victor",
    timeattack_transmission_decrypted: "Transmission Decrypted",
    timeattack_neural_link_readiness: "Neural Link Readiness",
    timeattack_sync_all_freq: "Synchronize all frequencies to engage protocol",
    timeattack_objective_sequence: "Objective Sequence",
    timeattack_extraction_decrypted: "Transmission Decrypted",
    timeattack_calibrating: "Calibrating...",
    timeattack_transmitting: "TRANSMITTING...",
    timeattack_transmission_locked: "TRANSMISSION LOCKED",
    timeattack_analyzing_variance: "Analyzing temporal variance...",
    timeattack_arcade_rankings: "Arcade Rankings",
    timeattack_round_protocol: "Round {round} Protocol",
    timeattack_round_1_name: "The Warmup",
    timeattack_round_1_goal: "Enregistrez exactement 5,00 secondes.",
    timeattack_round_1_how:
      "Appuyez sur START. Arrêtez à 5,00s. Le chrono TV disparaît après 2s.",
    timeattack_round_2_name: "Micro-Fraction",
    timeattack_round_2_goal: "Enregistrez la durée aléatoire.",
    timeattack_round_2_how: "START puis STOP. Pas de chrono sur TV.",
    timeattack_round_3_name: "Le Métronome",
    timeattack_round_3_goal: "Suivez le rythme.",
    timeattack_round_3_how: "START puis STOP. Ignorez les distractions TV.",
    timeattack_round_4_name: "Flash Réaction",
    timeattack_round_4_goal: "Vitesse pure.",
    timeattack_round_4_how: "START puis STOP le plus vite possible au signal.",
    timeattack_round_5_name: "Le Tiers Parfait",
    timeattack_round_5_goal: "Exactement 3,33 secondes.",
    timeattack_round_5_how: "Grande précision requise. Pas d'aide visuelle.",
    timeattack_round_6_name: "Le Long Courrier",
    timeattack_round_6_goal: "Cible longue durée.",
    timeattack_round_6_how: "Maintenez votre rythme malgré les glitches TV.",
    timeattack_round_7_name: "Bombe à Retardement",
    timeattack_round_7_goal: "Maintenez jusqu'à la cible.",
    timeattack_round_7_how: "MAINTENEZ pour amorcer. RELÂCHEZ à la cible.",
    timeattack_round_7_warning:
      "ATTENTION : Si vous relâchez TROP TARD, ça explose (-20% score) !",
    timeattack_round_8_name: "Le Battement",
    timeattack_round_8_goal: "Pulsation de 0,75 secondes.",
    timeattack_round_8_how: "Flicker visuel sur TV.",
    timeattack_round_9_name: "Pouls Binaire",
    timeattack_round_9_goal: "Exactement 1,01 secondes.",
    timeattack_round_9_how: "Mémoire musculaire pure.",
    timeattack_round_10_name: "Fusion",
    timeattack_round_10_goal: "DÉFI FINAL. Maintenez 4,04s.",
    timeattack_round_10_how: "MAINTENEZ. Glitch violent. Ne ratez pas !",
    timeattack_round_10_penalty: "En cas de retard, -30% du score total.",
    timeattack_start_protocol: "LANCER LE PROTOCOLE",
    timeattack_extract_data: "EXTRACTION DES DONNÉES",
    timeattack_next_sequence: "SÉQUENCE SUIVANTE",
  },
  de: {
    title: "LUNARIS",
    subtitle: "ARCADE-ZENTRUM",
    game: "SPIELE",
    wins: "SIEGE",
    rank: "RANG",
    board: "ZUM BRETT",
    namePlaceholder: "DEIN NAME",
    roomPlaceholder: "RAUMCODE",
    enterLobby: "BEITRETEN",
    lobbyInitiation: "Lobby bereit...",
    matchInitiation: "Spiel starten",
    arcade: "SPIELE",
    ongoingGames: "AKTIVE SPIELE",
    howToPlay: "SO WIRD GESPIELT",
    hallOfFame: "HALL OF FAME",
    step1: "1. Seite auf TV öffnen.",
    step2: "2. QR-Code scannen.",
    step3: "3. Handy als Controller nutzen!",
    capacityLabel: "KAPAZITÄT",
    maxLabel: "MAX",
    player: "Spieler",
    players: "SPIELER",
    capacity: "CAPACITY",
    footer: "LUNARIS Arcade v1.0.4",
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
    dixit_desc:
      "Ein traumhaftes Spiel der Fantasie. Erzähle Geschichten zu geheimnisvollen Bildern und finde die Wahrheit heraus.",
    pioupiou_title: "PiouPiou",
    pioupiou_desc:
      "Ein schnelles taktisches Spiel für die ganze Familie. Brüte Küken aus und nimm dich vor dem schlauen Fuchs in Acht.",
    themind_title: "The Mind",
    themind_desc:
      "Könnt ihr das Spiel ohne ein einziges Wort besiegen? Werdet eins mit eurem Team und spielt die Karten im Einklang.",
    themind_level: "LEVEL {level}",
    themind_lives: "LEBEN",
    themind_emps: "WURFSTERNE",
    themind_syncing: "KONZENTRATION...",
    themind_playing: "SPIELT",
    themind_victory: "SIEG",
    themind_game_over: "ENDE",
    justone_title: "Just One",
    justone_desc:
      "Ein cleveres Wortspiel um Teamwork. Gib einzigartige Hinweise, um das Wort zu erraten, aber vermeide Dopplungen!",
    justone_mystery_word: "GEHEIMWORT",
    justone_clue_placeholder: "Hinweis eingeben...",
    justone_guess_placeholder: "Antwort eingeben...",
    justone_standby: "Warten auf Hinweise",
    justone_validation: "VERGLEICHEN",
    justone_confirm_data: "BESTÄTIGEN",
    justone_pass: "PASS",
    justone_correct: "RICHTIG",
    justone_wrong: "FALSCH",
    incangold_title: "Incan Gold",
    incangold_desc:
      "Ein Push-Your-Luck-Spiel zur Tempelexpedition. Wie tief wagst du dich für Edelsteine?",
    incangold_round: "Runde {round} / 5",
    incangold_path: "Expeditionspfad",
    incangold_stay: "WEITER GEHEN",
    incangold_leave: "SORTIR",
    incangold_gems: "JUWELEN",
    incangold_banked: "GESICHERT",
    incangold_in_temple: "IM TEMPEL",
    incangold_at_camp: "IM LAGER",
    incangold_decide: "ZEIT FÜR DIE ENTSCHEIDUNG!",
    incangold_exploring: "Erkundung läuft...",
    incangold_results: "EXPEDITIONS-ZUSAMMENFASSUNG",
    incangold_expedition_complete: "Expedition Abgeschlossen",
    incangold_hall_of_riches: "Die Halle der Reichtümer",
    incangold_adventurer: "Abenteurer",
    incangold_cave_n: "Höhle {n}",
    incangold_total_wealth: "Gesamtvermögen",
    incangold_close_rules: "Regeln Schließen",
    incangold_game_rules: "Spielregeln",
    incangold_next_cave: "Nächste Höhle →",
    incangold_time_to_decide: "Zeit der Entscheidung",
    incangold_continue_exploration: "Erkundung Fortsetzen",
    incangold_enter_cave: "In die Höhle Gehen",
    incangold_venture_deeper: "Tiefer Wagen",
    incangold_expedition_ends: "Expedition Beendet",
    incangold_wealth_found: "Gefundene Schätze",
    incangold_swallowed_by_cave: "Verschlungen von der Höhle",
    incangold_danger: "Gefahr",
    incangold_gems_label: "Juwelen",
    incangold_left: "Verbleibend:",
    incangold_threat_level: "Bedrohungsstufe",
    incangold_path_gems: "Pfad-Juwelen",
    incangold_in_the_cave: "In der Höhle",
    incangold_exit_bonus: "Ausgangs-Bonus: +{n}",
    incangold_at_base_camp: "Im Basislager",
    incangold_lost_gems: "{n} Juwelen Verloren",
    incangold_the_dilemma: "Das Dilemma",
    incangold_checking_fists: "Fäuste werden geprüft...",
    incangold_locked: "GESPERRT",
    incangold_host_advances: "Gastgeber fährt nach Wahl fort",
    incangold_rules_title: "Expeditionsregeln",
    incangold_goal_title: "Das Ziel",
    incangold_goal_desc:
      "Bringe aus 5 Höhlenexpeditionen die meisten Rubine und Diamanten zurück. Der reichste Abenteurer gewinnt.",
    incangold_gems_rules_title: "Diamanten & Rubine",
    incangold_gems_rules_desc:
      "Teile Schätze gleichmäßig unter allen Abenteurern in der Höhle auf. Der Rest bleibt für Spätere auf der Karte.",
    incangold_dangers_rules_title: "Gefahren",
    incangold_dangers_rules_desc:
      "Eine zum ersten Mal erscheinende Gefahrenkarte ist sicher. Erscheint dieselbe Gefahr ein zweites Mal, fliehen alle mit leeren Händen!",
    incangold_dilemma_rules_title: "Das Dilemma",
    incangold_dilemma_rules_desc:
      "Vor jeder Karte musst du entscheiden: WEITERGEHEN für mehr Beute, oder ZURÜCKKEHREN ins Lager, um deinen Schatz zu sichern.",
    incangold_leaving_rules_title: "Die Höhle Verlassen",
    incangold_leaving_rules_desc:
      "Wenn du gehst, sicherst du alles aus dieser Runde PLUS alle auf dem Pfad verbliebenen Juwelen.",
    incangold_safety_rules_title: "Sicherheit Zuerst",
    incangold_safety_rules_desc:
      "Wenn mehrere Spieler gleichzeitig gehen, teilen sie die Pfad-Juwelen gleichmäßig auf. Der Rest bleibt für den Nächsten.",
    incangold_final_stats: "Endgültige Statistiken",
    incangold_rank: "Rang",
    incangold_back_to_arcade: "ZURÜCK ZUR ARCADE",
    incangold_in_hand: "In der Hand",
    incangold_chest_total: "Truhen-Gesamt",
    incangold_resting_camp: "Rasten im Lager",
    incangold_safe_reach: "Sicher vor der Höhle",
    incangold_expedition_result: "Expeditionsergebnis",
    incangold_waiting_reveal: "Warten auf Enthüllung",
    incangold_secret_choice: "Eine geheime Wahl muss getroffen werden",
    incangold_risk_loot: "Die aktuelle Beute riskieren",
    incangold_bank_now: "Alles jetzt sichern",
    incangold_on_path_bonus: "+{n} AUF DEM PFAD",
    incangold_artifacts: "Artefakte",
    incangold_choice_leave: "Camp",
    incangold_choice_stay: "Fackel",
    incangold_title_alt: "DIAMANT",
    shared_tech_group: "LUNARIS TECH GRUPPE",
    shared_waiting: "WARTEN...",
    timeattack_title: "Time Attack",
    timeattack_desc:
      "Teste deine innere Uhr auf die Millisekunde genau. 10 Runden voller rhythmischer Herausforderungen.",
    sushinode_title: "Sushi Go",
    sushinode_desc:
      "Das schnelle Kartenspiel. Stelle den besten Sushi-Teller zusammen, indem du die perfekte Kombination wählst.",
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
    madeBy: "Erstellt von LUNARIS",
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
    themind_link_integrity: "Link Integrity",
    themind_stable: "Stable",
    themind_terminated: "Terminated",
    themind_transmission_lives: "Transmission Lives",
    themind_briefing_title: "Frequency Alignment",
    themind_briefing_desc:
      "Data transmission is restricted. You must synchronize your internal frequencies to play cards in ascending order without verbal cues. One misstep compromises the neural link. Trust the silence. Trust your team.",
    themind_calibrating: "Calibrating psychic nodes...",
    themind_uplink_active: "Uplink Active",
    themind_frequency_refined: "Frequency Refined",
    themind_level_cleared: "Level {level} Cleared",
    themind_sync_next: "Sync Next Link",
    themind_uplink_request_sent: "Uplink Request Signal Sent",
    themind_establishing_freq: "Establishing Collective Frequency...",
    themind_system_purged: "Neural System Purged",
    themind_freq_stabilized: "Harmonic Frequency Achieved",

    justone_guesser: "RATENDER",
    justone_clue_submitted: "BEREIT",
    justone_awaiting_clues: "WARTEN...",
    justone_validated: "OK",
    justone_accepted: "JA",
    justone_rejected: "NEIN",
    justone_total_score: "SCORE",
    justone_round_count: "RUNDE",
    justone_ambiguity_detected: "AMBIGUÏTÉ DÉTECTÉE",
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
    justone_briefing_title: "Hive Mind Protocol",
    justone_briefing_desc:
      "We must transmit the target concept to the Infiltrator without triggering the security overrides. Submit one word as a clue. If your clue matches another agent's, the system will delete both before transmission. Be original, but be precise.",
    justone_initializing_links: "Initializing neural links...",
    justone_signal_stream: "Signal Stream {round} / 13",
    justone_transmission_success: "Transmission Successful",
    justone_security_override: "Security Override",
    justone_uplink_complete: "UPLINK COMPLETE",

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
    dixit_briefing_title: "The Art of Illusion",
    dixit_briefing_desc:
      "Words are blunt instruments. We communicate through imagery, metaphor, and intuition. As the Storyteller, craft a clue ambiguous enough to fool some, but precise enough to guide your true allies. As an Agent, decipher the vision to find the true source.",
    dixit_phase_incubation: "Incubation",
    dixit_phase_deciphering: "Deciphering",
    dixit_champion_title: "Der Illusionist Champion",
    dixit_illusion_dissipated: "Illusion Dissipated",

    pioupiou_match_telemetry: "STATUS",
    pioupiou_resolution: "GEWINNER",
    pioupiou_encryption: "PHASE",
    pioupiou_secure: "AKTIV",
    pioupiou_henhouse_integrity: "Henhouse Integrity",
    pioupiou_fox_infiltration: "Fox Infiltration!",
    pioupiou_champion_title: "The Henhouse Champion",
    pioupiou_analyzing_strategy: "Analyzing strategy...",
    pioupiou_tactical_feed: "Tactical Feed",
    pioupiou_henhouse_defense: "Henhouse Defense",
    pioupiou_briefing_desc:
      "The fox is lurking. You must gather resources—Roosters, Chickens, and Nests—to secure your eggs and hatch three chicks before your rivals. Deploy your defense strategies and protect the coop at all costs.",
    pioupiou_securing_perimeters: "Securing nesting perimeters...",

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
    timeattack_victory_lap: "Ehrenrunde",
    timeattack_current_phase: "Aktuelle Phase",
    timeattack_round: "Runde",
    timeattack_target: "Ziel",
    timeattack_eyes_on_phone: "AUGEN AUFS HANDY",
    timeattack_end_input_window: "Eingabe beenden",
    timeattack_round_results: "Rundenergebnisse",
    timeattack_target_duration: "Zieldauer",
    timeattack_actual: "Tatsächlich",
    timeattack_delta: "Abweichung",
    timeattack_reward: "Belohnung",
    timeattack_next_round: "Nächste Runde",
    timeattack_final_ranking: "Endrangliste",
    timeattack_sync_wave_masters: "Die Sync Wave Meister",
    timeattack_return_to_arcade: "Zurück zur Arcade",
    timeattack_back_to_main_menu: "Hauptmenü",
    timeattack_start_round: "Runde starten",
    timeattack_sync_wave_v1: "Sync Wave v1.0",
    timeattack_s_and: "s und",
    timeattack_ms: "ms",
    timeattack_personal_timer: "Chrono Personnel",
    timeattack_locked: "GESPERRT",
    timeattack_waiting_reveal: "Warten auf Reveal...",
    timeattack_done: "FERTIG",
    timeattack_hold: "HALTEN",
    timeattack_release: "LOSLASSEN",
    timeattack_start: "START",
    timeattack_stop: "STOP",
    timeattack_hold_to_start: "Halten zum Starten",
    timeattack_tap_to_start: "Tippen zum Starten",
    timeattack_release_at_target: "Loslassen beim Ziel",
    timeattack_tap_to_stop: "Tippen zum Stoppen",
    timeattack_time_recorded: "Zeit erfasst",
    timeattack_final_results: "Endergebnisse",
    timeattack_leave_game: "Spiel verlassen",
    timeattack_waiting_next_round: "Warten auf nächste Runde...",
    timeattack_current_goal: "Aktuelles Ziel",
    timeattack_instructions: "Anleitung",
    timeattack_goal: "ZIEL",
    timeattack_how: "WIE",
    timeattack_briefing_title: "Temporal Precision",
    timeattack_briefing_desc:
      "Reaction time is the only currency in this simulation. You will be given target intervals. Synchronize your actions with the system clock to achieve absolute precision. Milliseconds determine the victor.",
    timeattack_syncing_oscillators: "Syncing temporal oscillators...",
    timeattack_masters: "The Time Masters",
    timeattack_integrity_verified: "Simulation Integrity Verified",
    timeattack_global_champion: "Global Champion",
    timeattack_extraction_sequences: "Data Extraction Sequences",
    timeattack_round_victor: "Round Victor",
    timeattack_transmission_decrypted: "Transmission Decrypted",
    timeattack_neural_link_readiness: "Neural Link Readiness",
    timeattack_sync_all_freq: "Synchronize all frequencies to engage protocol",
    timeattack_objective_sequence: "Objective Sequence",
    timeattack_extraction_decrypted: "Transmission Decrypted",
    timeattack_calibrating: "Calibrating...",
    timeattack_transmitting: "TRANSMITTING...",
    timeattack_transmission_locked: "TRANSMISSION LOCKED",
    timeattack_analyzing_variance: "Analyzing temporal variance...",
    timeattack_arcade_rankings: "Arcade Rankings",
    timeattack_round_protocol: "Round {round} Protocol",
    timeattack_round_1_name: "Das Aufwärmen",
    timeattack_round_1_goal: "Enregistrez exactement 5,00 secondes.",
    timeattack_round_1_how:
      "Tippe auf START. Stoppe bei 5,00s. Der TV-Timer verschwindet nach 2s.",
    timeattack_round_2_name: "Mikro-Fraktion",
    timeattack_round_2_goal: "Enregistrez la durée aléatoire.",
    timeattack_round_2_how: "START dann STOP. Kein TV-Timer.",
    timeattack_round_3_name: "The Metronome",
    timeattack_round_3_goal: "Suivez le rythme.",
    timeattack_round_3_how: "START dann STOP. Ignorez les distractions TV.",
    timeattack_round_4_name: "Reaktions-Flash",
    timeattack_round_4_goal: "Reine Geschwindigkeit.",
    timeattack_round_4_how:
      "START dann STOP so schnell wie möglich beim Signal.",
    timeattack_round_5_name: "Das perfekte Drittel",
    timeattack_round_5_goal: "Genau 3,33 Sekunden.",
    timeattack_round_5_how: "Hohe Präzision erforderlich. Keine Hilfe.",
    timeattack_round_6_name: "Der Weitschuss",
    timeattack_round_6_goal: "Langzeit-Ziel.",
    timeattack_round_6_how: "Halte deinen Rhythmus trotz TV-Glitches.",
    timeattack_round_7_name: "Zeitbombe",
    timeattack_round_7_goal: "Halten bis zum Ziel.",
    timeattack_round_7_how: "HALTEN zum Aktivieren. LOSLASSEN beim Ziel.",
    timeattack_round_7_warning:
      "WARNUNG: Bei Verspätung explodiert es (-20% Score)!",
    timeattack_round_8_name: "Der Herzschlag",
    timeattack_round_8_goal: "Puls von 0,75 Sekunden.",
    timeattack_round_8_how: "TV flackert zur Ablenkung.",
    timeattack_round_9_name: "Binärer Puls",
    timeattack_round_9_goal: "Genau 1,01 Sekunden.",
    timeattack_round_9_how: "Pures Muskelgedächtnis.",
    timeattack_round_10_name: "Kernschmelze",
    timeattack_round_10_goal: "FINALE. Halte 4,04s.",
    timeattack_round_10_how: "HALTEN. Heftige Glitches. Nicht verpassen!",
    timeattack_round_10_penalty: "Bei Verspätung -30% Gesamtpunktzahl.",
    timeattack_start_protocol: "PROTOKOLL STARTEN",
    timeattack_extract_data: "DATEN EXTRAHIEREN",
    timeattack_next_sequence: "NÄCHSTE SEQUENZ",
  },
  fa: {
    title: "LUNARIS",
    subtitle: "مرکز بازی",
    game: "بازی",
    wins: "برد",
    rank: "رتبه",
    board: "رفتن به بازی",
    namePlaceholder: "نام شما",
    roomPlaceholder: "کد اتاق",
    enterLobby: "ورود به اتاق",
    lobbyInitiation: "آماده‌سازی...",
    matchInitiation: "شروع بازی",
    arcade: "بازی‌ها",
    ongoingGames: "بازی‌های در جریان",
    howToPlay: "راهنمای بازی",
    hallOfFame: "تالار مشاهیر",
    step1: "۱. این صفحه را در تلویزیون باز کنید.\u200F",
    step2: "۲. کد اتاق را در گوشی وارد کنید.\u200F",
    step3: "۳. از گوشی به عنوان دسته استفاده کنید!\u200F",
    capacityLabel: "ظرفیت حداکثر",
    maxLabel: "حداکثر",
    player: "بازیکن",
    players: "بازیکن",
    capacity: "CAPACITY",
    footer: "LUNARIS نسخه ۱.۰.۴",
    noOngoing: "بازی فعالی وجود ندارد.\u200F",
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
    noRoosters: "خروسی نداری!\u200F",
    accept: "تسلیم تخم",
    gameOver: "پایان بازی",
    winner: "برنده",
    victory: "پیروزی!\u200F",
    champion: "قهرمان",
    exit: "خروج",
    lobby: "لابی",
    results: "نتایج دور",
    storyteller: "قصه‌گو",
    dixit_round_summary: "خلاصه دور",
    dixit_title: "Dixit",
    dixit_desc:
      "بازی رویایی قدرت تخیل. با استفاده از نقاشی‌های انتزاعی داستانی بسازید و ببینید چه کسی حقیقت را پیدا می‌کند.\u200F",
    pioupiou_title: "PiouPiou",
    pioupiou_desc:
      "یک بازی تاکتیکی و سریع برای خانواده. جوجه‌ها را از تخم بیرون بیاورید و مراقب روباه حیله‌گر باشید.\u200F",
    themind_title: "The Mind",
    themind_desc:
      "آیا می‌توانید بدون حتی یک کلمه برنده شوید؟ با تیم خود یکی شوید و کارت‌ها را در هماهنگی کامل بازی کنید.\u200F",
    themind_level: "مرحله {level}",
    themind_lives: "جان‌ها",
    themind_emps: "ستاره‌ها",
    themind_syncing: "تمرکز...",
    themind_playing: "در حال بازی",
    themind_victory: "پیروزی",
    themind_game_over: "باخت",
    justone_title: "Just One",
    justone_desc:
      "یک بازی کلمات هوشمندانه. سرنخ‌های منحصر به فرد بدهید تا هم‌تیمی‌تان کلمه را حدس بزند، اما مراقب سرنخ‌های تکراری باشید!\u200F",
    justone_mystery_word: "کلمه رمز",
    justone_clue_placeholder: "سرنخ...",
    justone_guess_placeholder: "حدس نهایی...",
    justone_standby: "در انتظار سرنخ‌ها",
    justone_validation: "مقایسه سرنخ‌ها",
    justone_confirm_data: "تایید",
    justone_pass: "رد شدن",
    justone_correct: "درست",
    justone_wrong: "اشتباه",
    incangold_title: "طلای اینکا",
    incangold_desc:
      "یک بازی هیجان‌انگیز از اکتشاف معبد و شانس. چقدر برای به دست آوردن جواهرات پیش می‌روید؟",
    incangold_round: "دور {round} از ۵",
    incangold_path: "مسیر اکتشاف",
    incangold_stay: "ادامه اکتشاف",
    incangold_leave: "بازگشت به کمپ",
    incangold_gems: "جواهرات",
    incangold_banked: "ذخیره شده",
    incangold_in_temple: "داخل معبد",
    incangold_at_camp: "در کمپ",
    incangold_decide: "زمان تصمیم‌گیری!",
    incangold_exploring: "در حال جستجو...",
    incangold_results: "خلاصه اکتشاف",
    incangold_expedition_complete: "اکتشاف به پایان رسید",
    incangold_hall_of_riches: "تالار ثروت",
    incangold_adventurer: "ماجراجو",
    incangold_cave_n: "غار {n}",
    incangold_total_wealth: "کل ثروت",
    incangold_close_rules: "بستن قوانین",
    incangold_game_rules: "قوانین بازی",
    incangold_next_cave: "غار بعدی ←",
    incangold_time_to_decide: "زمان تصمیم‌گیری",
    incangold_continue_exploration: "ادامه اکتشاف",
    incangold_enter_cave: "ورود به غار",
    incangold_venture_deeper: "پیشروی بیشتر",
    incangold_expedition_ends: "پایان اکتشاف",
    incangold_wealth_found: "ثروت کشف شده",
    incangold_swallowed_by_cave: "بلعیده شده توسط غار",
    incangold_danger: "خطر",
    incangold_gems_label: "جواهرات",
    incangold_left: "باقیمانده:",
    incangold_threat_level: "سطح تهدید",
    incangold_path_gems: "جواهرات مسیر",
    incangold_in_the_cave: "داخل غار",
    incangold_exit_bonus: "امتیاز خروج: +{n}",
    incangold_at_base_camp: "در کمپ اصلی",
    incangold_lost_gems: "{n} جواهر از دست رفته",
    incangold_the_dilemma: "دوراهی سرنوشت",
    incangold_checking_fists: "در حال بررسی دست‌ها...",
    incangold_locked: "نهایی شد",
    incangold_host_advances: "میزبان پس از انتخاب‌ها ادامه می‌دهد",
    incangold_rules_title: "قوانین اکتشاف",
    incangold_goal_title: "هدف بازی",
    incangold_goal_desc:
      "بیشترین یاقوت و الماس را از ۵ سفر اکتشافی به دست آورید. ثروتمندترین ماجراجو برنده است.",
    incangold_gems_rules_title: "الماس‌ها و یاقوت‌ها",
    incangold_gems_rules_desc:
      "گنجینه‌ها را به طور مساوی بین همه ماجراجویان در غار تقسیم کنید. باقیمانده روی کارت می‌ماند تا توسط کسانی که دیرتر خارج می‌شوند جمع‌آوری شود.",
    incangold_dangers_rules_title: "خطرها",
    incangold_dangers_rules_desc:
      "کارت خطری که برای اولین بار ظاهر می‌شود بی‌آزار است. اگر همان خطر برای بار دوم ظاهر شود، همه با دست خالی فرار می‌کنند!",
    incangold_dilemma_rules_title: "دوراهی",
    incangold_dilemma_rules_desc:
      "قبل از هر کارت، باید تصمیم بگیرید: ماندن برای غنیمت بیشتر، یا خروج برای بازگشت به کمپ و ذخیره گنجینه فعلی.",
    incangold_leaving_rules_title: "خروج از غار",
    incangold_leaving_rules_desc:
      "اگر خارج شوید، تمام آنچه در این دور پیدا کرده‌اید را ذخیره می‌کنید به علاوه تمام جواهرات باقیمانده در مسیر.",
    incangold_safety_rules_title: "اول ایمنی",
    incangold_safety_rules_desc:
      "اگر چندین بازیکن همزمان خارج شوند، جواهرات مسیر را مساوی تقسیم می‌کنند. باقیمانده برای نفر بعدی می‌ماند.",
    incangold_final_stats: "آمار نهایی",
    incangold_rank: "رتبه",
    incangold_back_to_arcade: "بازگشت به آرکید",
    incangold_in_hand: "در دست",
    incangold_chest_total: "مجموع صندوق",
    incangold_resting_camp: "استراحت در کمپ",
    incangold_safe_reach: "ایمن از خطرات غار",
    incangold_expedition_result: "نتیجه اکتشاف",
    incangold_waiting_reveal: "در انتظار رونمایی",
    incangold_secret_choice: "یک تصمیم مخفی باید گرفته شود",
    incangold_risk_loot: "ریسک روی غنایم فعلی",
    incangold_bank_now: "ذخیره همه غنایم",
    incangold_on_path_bonus: "+{n} در مسیر",
    incangold_artifacts: "اشیاء باستانی",
    incangold_choice_leave: "کمپ",
    incangold_choice_stay: "مشعل",
    incangold_title_alt: "دیامانت",
    shared_tech_group: "گروه تکنولوژی لوناریس",
    shared_waiting: "در انتظار...",
    timeattack_title: "Time Attack",
    timeattack_desc:
      "ساعت درونی خود را تا میلی‌ثانیه به چالش بکشید. ۱۰ مرحله هیجان‌انگیز از چالش‌های ریتمیک.\u200F",
    sushinode_title: "Sushi Go",
    sushinode_desc:
      "بازی انتخاب و پاس دادن کارت. با انتخاب بهترین ترکیب از غذاها، خوشمزه‌ترین سینی سوشی را بسازید.\u200F",
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
    dixit_st_fail_all: "همه کارت شما را پیدا کردند\u200F",
    dixit_st_fail_none: "هیچ‌کس کارت شما را پیدا نکرد\u200F",
    dixit_found_original: "کارت اصلی را پیدا کردی",
    dixit_found_original_all: "همه کارت اصلی را پیدا کردند\u200F",
    dixit_found_original_none: "فقط شما کارت اصلی را پیدا کردید\u200F",
    dixit_others_fooled: "رای‌ها به کارت شما",
    dixit_all_or_none: "همه یا هیچ‌کس حدس زد",
    rank_out_of: "{rank} از {total}",
    LOG_LAY_EGG: "{player} تخم گذاشت! 🥚",
    LOG_HATCH: "{player} به دنیا آورد! 🐣",
    LOG_DISCARD: "{player} انداخت {card} ♻️",
    LOG_INVALID: "نامعتبر! 🚫",
    LOG_FOX_SUCCESS: "{player} دزدید از {target}! 🦊",
    LOG_FOX_BLOCKED: "{target} دفاع کرد! 🐓🐓\u200F",
    finalHand: "دست نهایی",
    waitingPlayers: "انتظار بازیکنان",
    minPlayersRequired: "{count} بازیکن لازم است\u200F",
    testingNote: "",
    action: "عملیات",
    nearlyWinning: "نزدیک پیروزی!\u200F",
    noEggsToSteal: "تخمی نیست!\u200F",
    yourTurn: "نوبت شما",
    chicken: "جوجه",
    rooster: "خروس",
    fox: "روباه",
    nest: "لانه",
    lastEvents: "گزارش‌ها",
    noEvents: "گزارشی نیست\u200F",
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
    madeBy: "ساخته شده توسط LUNARIS",
    unknown_predator: "یک شکارچی",
    waiting_for_sequence: "در انتظار حرکت",

    themind_shurikens: "ستاره‌ها",
    themind_team_stats: "وضعیت تیم",
    themind_hand_size: "کارت‌های باقی‌مانده",
    themind_discard_pile: "کارت‌های سوخته",
    themind_awaiting_play: "انتظار بازی",
    themind_secured_by: "بازی توسط",
    themind_ready_for_next: "مرحله تمام! آماده؟\u200F",
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
    themind_link_integrity: "Link Integrity",
    themind_stable: "Stable",
    themind_terminated: "Terminated",
    themind_transmission_lives: "Transmission Lives",
    themind_briefing_title: "Frequency Alignment",
    themind_briefing_desc:
      "Data transmission is restricted. You must synchronize your internal frequencies to play cards in ascending order without verbal cues. One misstep compromises the neural link. Trust the silence. Trust your team.",
    themind_calibrating: "Calibrating psychic nodes...",
    themind_uplink_active: "Uplink Active",
    themind_frequency_refined: "Frequency Refined",
    themind_level_cleared: "Level {level} Cleared",
    themind_sync_next: "Sync Next Link",
    themind_uplink_request_sent: "Uplink Request Signal Sent",
    themind_establishing_freq: "Establishing Collective Frequency...",
    themind_system_purged: "Neural System Purged",
    themind_freq_stabilized: "Harmonic Frequency Achieved",

    justone_guesser: "حدس‌زننده",
    justone_clue_submitted: "سرنخ ثبت شد",
    justone_awaiting_clues: "انتظار سرنخ...",
    justone_validated: "تایید شده",
    justone_accepted: "قبول",
    justone_rejected: "رد",
    justone_total_score: "امتیاز کل",
    justone_round_count: "دور",
    justone_ambiguity_detected: "ابهام",
    justone_target_word: "کلمه بود\u200F",
    justone_consensus_required: "رای به سرنخ",
    justone_all_canceled: "حذف همه",
    justone_session_ended: "پایان",
    justone_submit_clue: "ثبت سرنخ",
    justone_execute_guess: "حدس زدن",
    justone_waiting_sync: "در انتظار بقیه...",
    justone_decryption_input: "حدس",
    justone_clue_input: "سرنخ",
    justone_helper: "یار کمکی",
    justone_briefing_title: "Hive Mind Protocol",
    justone_briefing_desc:
      "We must transmit the target concept to the Infiltrator without triggering the security overrides. Submit one word as a clue. If your clue matches another agent's, the system will delete both before transmission. Be original, but be precise.",
    justone_initializing_links: "Initializing neural links...",
    justone_signal_stream: "Signal Stream {round} / 13",
    justone_transmission_success: "Transmission Successful",
    justone_security_override: "Security Override",
    justone_uplink_complete: "UPLINK COMPLETE",

    dixit_participants: "بازیکنان",
    dixit_clue_received: "سرنخ این است\u200F",
    dixit_awaiting_st: "انتظار قصه‌گو...",
    dixit_match_live: "بازی فعال",
    dixit_current_phase: "فاز فعلی",
    dixit_integrity: "پیشرفت دور",
    dixit_node_owner: "بازی توسط",
    dixit_received_guesses: "رای‌ها ({count})",
    dixit_guessers: "حدس‌زننده‌ها",
    dixit_wait_others_action: "انتظار بقیه",
    dixit_briefing_title: "The Art of Illusion",
    dixit_briefing_desc:
      "Words are blunt instruments. We communicate through imagery, metaphor, and intuition. As the Storyteller, craft a clue ambiguous enough to fool some, but precise enough to guide your true allies. As an Agent, decipher the vision to find the true source.",
    dixit_phase_incubation: "Incubation",
    dixit_phase_deciphering: "Deciphering",
    dixit_champion_title: "استاد توهم‌پرداز",
    dixit_illusion_dissipated: "Illusion Dissipated",

    pioupiou_match_telemetry: "وضعیت",
    pioupiou_resolution: "برنده",
    pioupiou_encryption: "فاز",
    pioupiou_secure: "فعال",
    pioupiou_henhouse_integrity: "Henhouse Integrity",
    pioupiou_fox_infiltration: "Fox Infiltration!",
    pioupiou_champion_title: "The Henhouse Champion",
    pioupiou_analyzing_strategy: "Analyzing strategy...",
    pioupiou_tactical_feed: "Tactical Feed",
    pioupiou_henhouse_defense: "Henhouse Defense",
    pioupiou_briefing_desc:
      "The fox is lurking. You must gather resources—Roosters, Chickens, and Nests—to secure your eggs and hatch three chicks before your rivals. Deploy your defense strategies and protect the coop at all costs.",
    pioupiou_securing_perimeters: "Securing nesting perimeters...",

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
    timeattack_victory_lap: "دور افتخار",
    timeattack_current_phase: "فاز فعلی",
    timeattack_round: "دور",
    timeattack_target: "هدف",
    timeattack_eyes_on_phone: "نگاه به گوشی",
    timeattack_end_input_window: "اتمام مهلت",
    timeattack_round_results: "نتایج دور",
    timeattack_target_duration: "مدت زمان هدف",
    timeattack_actual: "ثبت شده",
    timeattack_delta: "اختلاف",
    timeattack_reward: "امتیاز",
    timeattack_next_round: "دور بعدی",
    timeattack_final_ranking: "رده‌بندی نهایی",
    timeattack_sync_wave_masters: "استادان هماهنگی زمانی",
    timeattack_return_to_arcade: "بازگشت به صفحه اصلی",
    timeattack_back_to_main_menu: "منوی اصلی",
    timeattack_start_round: "شروع دور",
    timeattack_sync_wave_v1: "نسخه ۱.۰",
    timeattack_s_and: "ثانیه و",
    timeattack_ms: "میلی‌ثانیه",
    timeattack_personal_timer: "زمان‌سنج شخصی",
    timeattack_locked: "ثبت شد",
    timeattack_waiting_reveal: "در انتظار نتایج...\u200F",
    timeattack_done: "تمام",
    timeattack_hold: "نگه دارید",
    timeattack_current_goal: "هدف فعلی",
    timeattack_instructions: "دستورالعمل",
    timeattack_release: "رها کنید",
    timeattack_start: "شروع",
    timeattack_stop: "توقف",
    timeattack_hold_to_start: "نگه دارید تا شروع شود",
    timeattack_tap_to_start: "بزنید تا شروع شود",
    timeattack_release_at_target: "در زمان هدف رها کنید",
    timeattack_tap_to_stop: "در زمان هدف بزنید",
    timeattack_time_recorded: "زمان ثبت شد",
    timeattack_final_results: "نتایج نهایی",
    timeattack_leave_game: "خروج از بازی",
    timeattack_waiting_next_round: "در انتظار دور بعد...\u200F",
    timeattack_goal: "هدف",
    timeattack_how: "روش",
    timeattack_briefing_title: "Temporal Precision",
    timeattack_briefing_desc:
      "Reaction time is the only currency in this simulation. You will be given target intervals. Synchronize your actions with the system clock to achieve absolute precision. Milliseconds determine the victor.",
    timeattack_syncing_oscillators: "Syncing temporal oscillators...",
    timeattack_masters: "The Time Masters",
    timeattack_integrity_verified: "Simulation Integrity Verified",
    timeattack_global_champion: "Global Champion",
    timeattack_extraction_sequences: "Data Extraction Sequences",
    timeattack_round_victor: "Round Victor",
    timeattack_transmission_decrypted: "Transmission Decrypted",
    timeattack_neural_link_readiness: "Neural Link Readiness",
    timeattack_sync_all_freq: "Synchronize all frequencies to engage protocol",
    timeattack_objective_sequence: "Objective Sequence",
    timeattack_extraction_decrypted: "Transmission Decrypted",
    timeattack_calibrating: "Calibrating...",
    timeattack_transmitting: "TRANSMITTING...",
    timeattack_transmission_locked: "TRANSMISSION LOCKED",
    timeattack_analyzing_variance: "Analyzing temporal variance...",
    timeattack_arcade_rankings: "Arcade Rankings",
    timeattack_round_protocol: "Round {round} Protocol",
    timeattack_round_1_name: "گرم کردن",
    timeattack_round_1_goal: "دقیقاً ۵.۰۰ ثانیه را ثبت کنید.\u200F",
    timeattack_round_1_how:
      "دکمه شروع را بزنید. در ۵ ثانیه متوقف کنید. زمان‌سنج تلویزیون بعد از ۲ ثانیه محو می‌شود.\u200F",
    timeattack_round_2_name: "Micro-Fraction",
    timeattack_round_2_goal: "زمان تصادفی را حدس بزنید.\u200F",
    timeattack_round_2_how:
      "شروع و سپس توقف. بدون نمایش زمان در تلویزیون.\u200F",
    timeattack_round_3_name: "The Metronome",
    timeattack_round_3_goal: "ریتم را حفظ کنید.\u200F",
    timeattack_round_3_how:
      "شروع و سپس توقف. به پارازیت‌های تلویزیون بی‌توجه باشید.\u200F",
    timeattack_round_4_name: "Reaction Flash",
    timeattack_round_4_goal: "سرعت مطلق.\u200F",
    timeattack_round_4_how:
      "بلافاصله بعد از سیگنال تلویزیون شروع و توقف کنید.\u200F",
    timeattack_round_5_name: "The Perfect Third",
    timeattack_round_5_goal: "دقیقاً ۳.۳۳ ثانیه.\u200F",
    timeattack_round_5_how: "دقت بسیار بالا لازم است. بدون هیچ کمکی.\u200F",
    timeattack_round_6_name: "The Long Shot",
    timeattack_round_6_goal: "زمان طولانی.\u200F",
    timeattack_round_6_how:
      "ریتم خود را علیرغم اختلالات تلویزیون حفظ کنید.\u200F",
    timeattack_round_7_name: "Time Bomb",
    timeattack_round_7_goal: "نگه داشتن تا هدف.\u200F",
    timeattack_round_7_how:
      "نگه دارید تا بمب فعال شود. در زمان هدف رها کنید.\u200F",
    timeattack_round_7_warning:
      "هشدار: اگر دیر رها کنید، بمب منفجر می‌شود (-۲۰٪ امتیاز)!\u200F",
    timeattack_round_8_name: "The Heartbeat",
    timeattack_round_8_goal: "پالس ۰.۷۵ ثانیه‌ای.\u200F",
    timeattack_round_8_how: "تلویزیون برای حواس‌پرتی چشمک می‌زند.\u200F",
    timeattack_round_9_name: "Binary Pulse",
    timeattack_round_9_goal: "دقیقاً ۱.۰۱ ثانیه.\u200F",
    timeattack_round_9_how: "فقط بر حافظه عضلانی خود تکیه کنید.\u200F",
    timeattack_round_10_name: "Meltdown",
    timeattack_round_10_goal: "چالش نهایی. نگه داشتن ۴.۰۴ ثانیه.\u200F",
    timeattack_round_10_how: "نگه دارید. اختلالات شدید. اشتباه نکنید!\u200F",
    timeattack_round_10_penalty:
      "در صورت تاخیر، ۳۰٪ از کل امتیاز کسر می‌شود.\u200F",
    timeattack_start_protocol: "شروع پروتکل",
    timeattack_extract_data: "استخراج داده‌ها",
    timeattack_next_sequence: "توالی بعدی",
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
 * Surgical fix for punctuation detachment in RTL text within LTR containers.
 */
export function fixPersianPunctuation(text: string, lang: Language): string {
  if (lang === "fa" && text && !text.endsWith("\u200F")) {
    return text + "\u200F";
  }
  return text;
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
  // Surgical fix for punctuation detachment in RTL text within LTR containers
  return fixPersianPunctuation(result, lang || "en");
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
