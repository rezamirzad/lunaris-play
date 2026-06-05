import json
import random

def generate_clues_for_batch(batch_size):
    # This is a simulation structure.
    # In a real scenario, this script would interface with an LLM API 
    # to fetch content for each batch of words.
    
    dataset = []
    
    # 1500 words target
    for i in range(1500):
        word = {"en": f"Word_{i}", "fr": f"Mot_{i}", "de": f"Wort_{i}", "fa": f"کلمه_{i}"}
        
        entry = {
            "word": word,
            "clues": {
                "en": [f"E_clue_{i}_{j}" for j in range(60)],
                "fr": [f"F_clue_{i}_{j}" for j in range(60)],
                "de": [f"D_clue_{i}_{j}" for j in range(60)],
                "fa": [f"Fa_clue_{i}_{j}" for j in range(60)] # Will be replaced with real Farsi content
            },
            "difficulty": random.choice(["easy", "medium", "hard"])
        }
        dataset.append(entry)
        
    return dataset

# For demonstration, generate a subset of 100
full_dataset = generate_clues_for_batch(100)
with open('full_dataset.json', 'w', encoding='utf-8') as f:
    json.dump(full_dataset, f, ensure_ascii=False, indent=2)

print("Dataset generated successfully in full_dataset.json")
