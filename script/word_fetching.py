import csv
import re
import string
import os
from collections import Counter

def clean_text(text):
    """Clean the text by removing punctuation and converting to lowercase."""
    # Remove punctuation
    text = text.translate(str.maketrans('', '', string.punctuation))
    # Convert to lowercase
    text = text.lower()
    # Split into words
    words = text.split()
    return words

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
        
        # Write the word frequencies to a CSV file
        with open(output_file, 'w', newline='', encoding='utf-8') as out_file:
            csv_writer = csv.writer(out_file)
            csv_writer.writerow(['Word', 'Frequency'])
            
            # Sort by frequency (highest first)
            for word, count in word_counter.most_common():
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
