import pypdf
import re
import json
import csv
import os

pdf_path = r'C:\Users\dania.shabih\.gemini\antigravity\brain\d494e8d8-800e-4704-926e-80e36d355be5\.user_uploaded\media_1793880076710_38b5725c.pdf'
reader = pypdf.PdfReader(pdf_path)

session_ranges = [
    {'session': 1, 'title': 'Search Engines', 'q_pages': (2, 8), 'ans_page': 9, 'expected': 54},
    {'session': 2, 'title': 'Search Engine Optimization and Its Components', 'q_pages': (10, 16), 'ans_page': 17, 'expected': 54},
    {'session': 3, 'title': 'On-page Optimization', 'q_pages': (18, 24), 'ans_page': 25, 'expected': 58},
    {'session': 4, 'title': 'Off-page Optimization', 'q_pages': (26, 32), 'ans_page': 33, 'expected': 58},
    {'session': 5, 'title': 'Mobile SEO', 'q_pages': (34, 40), 'ans_page': 41, 'expected': 54},
    {'session': 6, 'title': 'SEO Content Strategy and Local SEO Content', 'q_pages': (42, 48), 'ans_page': 49, 'expected': 56},
    {'session': 7, 'title': 'SEO Internationalization and Localization', 'q_pages': (50, 55), 'ans_page': 56, 'expected': 50},
    {'session': 8, 'title': 'SEO Tools and Google Analytics', 'q_pages': (57, 63), 'ans_page': 64, 'expected': 58},
]

def clean_text(text):
    text = text.replace('\xa0', ' ')
    text = re.sub(r'[ \t]+', ' ', text)
    return text.strip()

scripts_dir = os.path.dirname(__file__)

for s_info in session_ranges:
    sess_num = s_info['session']
    title = s_info['title']
    expected = s_info['expected']
    
    # 1. Answer Key
    ans_text = reader.pages[s_info['ans_page'] - 1].extract_text()
    ans_pairs = re.findall(r'(\d+)\s+([A-D])', ans_text)
    ans_map = {int(num): letter for num, letter in ans_pairs}
    
    # 2. Extract Question Pages
    combined_q_text = ""
    for p in range(s_info['q_pages'][0], s_info['q_pages'][1] + 1):
        page_text = reader.pages[p - 1].extract_text()
        page_text = re.sub(r'SEO Session-wise Quizzes\s*\|\s*Page\s*\d+', '', page_text)
        page_text = re.sub(r'Session\s*\d+:\s*.*?\n', '', page_text)
        page_text = re.sub(r'Quiz\s*[-–—]\s*\d+\s*questions', '', page_text)
        combined_q_text += "\n" + page_text

    # Parse questions
    q_blocks = re.split(r'\n\s*(\d+)\.\s+', combined_q_text)
    parsed_questions = []
    
    for i in range(1, len(q_blocks), 2):
        q_num = int(q_blocks[i])
        block = q_blocks[i+1]
        
        opt_matches = list(re.finditer(r'\b([A-D])\)\s*', block))
        if len(opt_matches) < 4:
            print(f"Warning: Session {sess_num} Q{q_num} has only {len(opt_matches)} option matches!")
            continue
            
        q_text = clean_text(block[:opt_matches[0].start()])
        opt_A = clean_text(block[opt_matches[0].end():opt_matches[1].start()])
        opt_B = clean_text(block[opt_matches[1].end():opt_matches[2].start()])
        opt_C = clean_text(block[opt_matches[2].end():opt_matches[3].start()])
        opt_D = clean_text(block[opt_matches[3].end():])
        opt_D = re.sub(r'\s+', ' ', opt_D).strip()
        
        options = [opt_A, opt_B, opt_C, opt_D]
        correct_letter = ans_map.get(q_num)
        letter_idx = {'A': 0, 'B': 1, 'C': 2, 'D': 3}.get(correct_letter, 0)
        correct_answer = options[letter_idx]
        
        parsed_questions.append({
            'questionNumber': q_num,
            'questionText': q_text,
            'options': options,
            'correctLetter': correct_letter,
            'correctAnswer': correct_answer,
            'explanation': f"Correct answer is {correct_letter}) {correct_answer}."
        })
        
    print(f"Session {sess_num} ('{title}'): Parsed {len(parsed_questions)} questions (expected {expected})")
    
    # Save JSON
    session_json = {
        'category': 'SEO',
        'session': sess_num,
        'title': f"Session {sess_num}: {title}",
        'totalQuestions': len(parsed_questions),
        'questions': [
            {
                'questionText': q['questionText'],
                'options': q['options'],
                'correctAnswer': q['correctAnswer'],
                'explanation': q['explanation']
            }
            for q in parsed_questions
        ]
    }
    
    json_path = os.path.join(scripts_dir, f"seo_session{sess_num}.json")
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(session_json, f, indent=2, ensure_ascii=False)
        
    # Save CSV
    csv_path = os.path.join(scripts_dir, f"seo_session{sess_num}.csv")
    with open(csv_path, 'w', encoding='utf-8', newline='') as f:
        writer = csv.writer(f)
        writer.writerow(['category', 'session', 'question_text', 'option1', 'option2', 'option3', 'option4', 'correct_answer'])
        for q in parsed_questions:
            writer.writerow([
                'SEO',
                sess_num,
                q['questionText'],
                q['options'][0],
                q['options'][1],
                q['options'][2],
                q['options'][3],
                q['correctAnswer']
            ])
            
print("All JSON and CSV files generated successfully.")
