import json
import random

# Sample of 5 words to test the structure
words = [
    {"en": "Apple", "fr": "Pomme", "de": "Apfel", "fa": "سیب"},
    {"en": "Ocean", "fr": "Océan", "de": "Ozean", "fa": "اقیانوس"},
    {"en": "Castle", "fr": "Château", "de": "Schloss", "fa": "قلعه"},
    {"en": "Dragon", "fr": "Dragon", "de": "Drache", "fa": "اژدها"},
    {"en": "Moon", "fr": "Lune", "de": "Mond", "fa": "ماه"}
]

# This is a simulation. In a real scenario, we would use an LLM API.
# Here I create structure to populate the Convex database.
def generate_sample_data():
    data = []
    for word in words:
        entry = {
            "word": word,
            "clues": {
                "en": [f"E_{word['en']}_{i}" for i in range(55)],
                "fr": [f"F_{word['fr']}_{i}" for i in range(55)],
                "de": [f"D_{word['de']}_{i}" for i in range(55)],
                "fa": [f"Farsi_Clue_{i}" for i in range(55)] # Placeholder
            },
            "difficulty": random.choice(["easy", "medium", "hard"])
        }
        data.append(entry)
    return data

print(json.dumps(generate_sample_data(), indent=2))
