import csv
import re
import string
import os
from collections import Counter

# Common stop words to exclude
STOP_WORDS = {
    'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at',
    'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her', 'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their',
    'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him',
    'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only',
    'come', 'its', 'over', 'think', 'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even', 'new', 'want',
    'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'was', 'were', 'been', 'being', 'am', 'are', 'had', 'has', 'having', 'do',
    'does', 'did', 'doing', 'will', 'would', 'shall', 'should', 'may', 'might', 'must', 'can', 'could', 'ought', 'need', 'dare', 'used'
}

def is_word_variation(word1, word2):
    """Check if one word is a variation of another (e.g., 'squirrel' and 'squirrels')."""
    # Remove common suffixes
    suffixes = ['s', 'es', 'ed', 'ing', 'er', 'est']
    base1 = word1
    base2 = word2
    
    for suffix in suffixes:
        if word1.endswith(suffix):
            base1 = word1[:-len(suffix)]
        if word2.endswith(suffix):
            base2 = word2[:-len(suffix)]
    
    return base1 == base2

def clean_text(text):
    """Clean the text by removing punctuation and converting to lowercase."""
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    # Convert to lowercase
    text = text.lower()
    # Split into words and filter out stop words (exact matches only)
    words = [word for word in text.split() if word not in STOP_WORDS and len(word) > 1]
    return words

def handle_word_variations(word_counter):
    """Handle word variations by keeping only the most frequent version."""
    # Convert to list of tuples for easier manipulation
    words = list(word_counter.items())
    words.sort(key=lambda x: x[1], reverse=True)  # Sort by frequency
    
    # Create a set of words to keep
    words_to_keep = set()
    
    # Process each word
    for i, (word, count) in enumerate(words):
        if word in words_to_keep:
            continue
            
        # Keep this word and mark its variations as processed
        words_to_keep.add(word)
        for j, (other_word, other_count) in enumerate(words):
            if i != j and is_word_variation(word, other_word):
                # If the variation has a higher count, replace the current word
                if other_count > count:
                    words_to_keep.remove(word)
                    words_to_keep.add(other_word)
                    break
    
    # Create new counter with only kept words
    new_counter = Counter()
    for word, count in words:
        if word in words_to_keep:
            new_counter[word] = count
    
    return new_counter

def calculate_word_frequencies(input_file, output_file):
    """
    Calculate word frequencies from the 'Note Squirrel & Park Stories' column
    in the CSV file and write the results to a new CSV file.
    """
    word_counter = Counter()
    
    try:
        with open(input_file, 'r', encoding='utf-8') as csv_file:
            csv_reader = csv.DictReader(csv_file)
            
            # Check if the required column exists
            if 'Note Squirrel & Park Stories' not in csv_reader.fieldnames:
                print(f"Error: 'Note Squirrel & Park Stories' column not found in {input_file}")
                return
            
            # Process each row
            for row in csv_reader:
                story_text = row['Note Squirrel & Park Stories']
                if story_text:
                    words = clean_text(story_text)
                    word_counter.update(words)
        
        # Handle word variations
        word_counter = handle_word_variations(word_counter)
        
        # Write the word frequencies to a CSV file
        with open(output_file, 'w', newline='', encoding='utf-8') as out_file:
            csv_writer = csv.writer(out_file)
            csv_writer.writerow(['Word', 'Frequency'])
            
            # Sort by frequency (highest first) and take top 80
            for word, count in word_counter.most_common(80):
                csv_writer.writerow([word, count])
        
        print(f"Word frequencies have been written to {output_file}")
    
    except Exception as e:
        print(f"An error occurred: {e}")

if __name__ == "__main__":
    # Get the directory of the script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    # Get the parent directory (project root)
    project_root = os.path.dirname(script_dir)
    
    # Define paths relative to the project root
    input_file = os.path.join(project_root, "data", "stories.csv")
    output_file = os.path.join(project_root, "data", "word_frequencies.csv")
    
    calculate_word_frequencies(input_file, output_file)
