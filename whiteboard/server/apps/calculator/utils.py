import google.generativeai as genai
import ast
import json
from PIL import Image
from constants import GEMINI_API_KEY

genai.configure(api_key=GEMINI_API_KEY)

def analyze_image(img: Image, dict_of_vars: dict):
    model = genai.GenerativeModel(model_name="gemini-2.5-flash")
    dict_of_vars_str = json.dumps(dict_of_vars, ensure_ascii=False)
    prompt = (
        f"You have been given an image with some mathematical expressions, equations, or graphical problems, and you need to solve them. "
        f"IMPORTANT: Only analyze the most recently drawn equation/expression in the image. "
        f"Ignore any previous answers or drawings that might appear in the image. "
        f"Focus only on the newest, freshest marks in the image. "
        f"Note: Use the PEMDAS rule for solving mathematical expressions. PEMDAS stands for the Priority Order: Parentheses, Exponents, Multiplication and Division (from left to right), Addition and Subtraction (from left to right). Parentheses have the highest priority, followed by Exponents, then Multiplication and Division, and lastly Addition and Subtraction. "
        f"For example: "
        f"Q. 2 + 3 * 4 "
        f"(3 * 4) => 12, 2 + 12 = 14. "
        f"Q. 2 + 3 + 5 * 4 - 8 / 2 "
        f"5 * 4 => 20, 8 / 2 => 4, 2 + 3 => 5, 5 + 20 => 25, 25 - 4 => 21. "
        f"YOU CAN HAVE FIVE TYPES OF EQUATIONS/EXPRESSIONS IN THIS IMAGE, AND ONLY ONE CASE SHALL APPLY EVERY TIME: "
        f"Following are the cases: "
        f"1. Simple mathematical expressions like 2 + 2, 3 * 4, 5 / 6, 7 - 8, etc.: In this case, solve and return the answer in the format of a LIST OF ONE DICT [{{'expr': given expression, 'result': calculated answer}}]. "
        f"2. Set of Equations like x^2 + 2x + 1 = 0, 3y + 4x = 0, 5x^2 + 6y + 7 = 12, etc.: In this case, solve for the given variable, and the format should be a COMMA SEPARATED LIST OF DICTS, with dict 1 as {{'expr': 'x', 'result': 2, 'assign': True}} and dict 2 as {{'expr': 'y', 'result': 5, 'assign': True}}. This example assumes x was calculated as 2, and y as 5. Include as many dicts as there are variables. "
        f"3. Assigning values to variables like x = 4, y = 5, z = 6, etc.: In this case, assign values to variables and return another key in the dict called {{'assign': True}}, keeping the variable as 'expr' and the value as 'result' in the original dictionary. RETURN AS A LIST OF DICTS. "
        f"4. Analyzing Graphical Math problems, which are word problems represented in drawing form, such as cars colliding, trigonometric problems, problems on the Pythagorean theorem, adding runs from a cricket wagon wheel, etc. These will have a drawing representing some scenario and accompanying information with the image. PAY CLOSE ATTENTION TO DIFFERENT COLORS FOR THESE PROBLEMS. You need to return the answer in the format of a LIST OF ONE DICT [{{'expr': given expression, 'result': calculated answer}}]. "
        f"5. Detecting Abstract Concepts that a drawing might show, such as love, hate, jealousy, patriotism, or a historic reference to war, invention, discovery, quote, etc. USE THE SAME FORMAT AS OTHERS TO RETURN THE ANSWER, where 'expr' will be the explanation of the drawing, and 'result' will be the abstract concept. "
        f"Analyze the equation or expression in this image and return the answer according to the given rules: "
        f"Make sure to use extra backslashes for escape characters like \\f -> \\\\f, \\n -> \\\\n, etc. "
        f"Here is a dictionary of user-assigned variables. If the given expression has any of these variables, use its actual value from this dictionary accordingly: {dict_of_vars_str}. "
        f"DO NOT USE BACKTICKS OR MARKDOWN FORMATTING. "
        f"PROPERLY QUOTE THE KEYS AND VALUES IN THE DICTIONARY FOR EASIER PARSING WITH Python's ast.literal_eval."
        
    )
    response = model.generate_content([prompt, img])
    print(response.text)
    answers = []
    try:
        answers = ast.literal_eval(response.text)
    except Exception as e:
        print(f"Error in parsing response from Gemini API: {e}")
    print('returned answer ', answers)
    for answer in answers:
        if 'assign' in answer:
            answer['assign'] = True
        else:
            answer['assign'] = False
    return answers
    

def get_explanation(img: Image, question: str, history: list[dict]):
    model = genai.GenerativeModel(model_name="gemini-2.5-flash")
    
    # Build chat history
    chat = model.start_chat(history=[])
    for msg in history:
        if msg['role'] == 'user':
            chat.send_message(msg['content'])
        else:
            chat.send_message(msg['content'])
    
    # prompt = (
    #     f"Provide a detailed step-by-step explanation for this problem.\n"
    #     f"Requirements:\n"
    #     f"- Use clear mathematical notation\n"
    #     f"- Format LaTeX equations with $ for inline and $$ for display\n"
    #     f"- Separate steps with newlines\n"
    #     f"- Keep explanations concise but complete\n"
    #     f"- Reference the image when appropriate\n\n"
    #     f"User's question: {question}\n\n"
    #     f"Explain the solution:"
    # )

    prompt = (
        "Provide a detailed step-by-step mathematical explanation with the following strict formatting rules:\n\n"
        "1. STRUCTURE REQUIREMENTS:\n"
        "- Begin with a clear statement of the problem\n"
        "- Use numbered steps for each part of the solution\n"
        "- End with a clear final answer\n"
        "- Separate steps with blank lines for readability\n\n"
        "2. MATHEMATICAL NOTATION:\n"
        "- For inline math: wrap with single dollar signs like $x^2$\n"
        "- For display math: wrap with double dollar signs like $$\\int f(x) dx$$\n"
        "- Always escape special characters (e.g., tan^{-1} not tan^-1)\n"
        "- Use proper LaTeX notation for all symbols\n\n"
        "3. CONTENT REQUIREMENTS:\n"
        "- Explain each transformation clearly\n"
        "- Show intermediate steps\n"
        "- Highlight key mathematical rules used\n"
        "- Keep technical language precise but accessible\n\n"
        "4. FORMAT EXAMPLE:\n"
        "To solve the integral $$\\int \\tan^{-1}(x) \\, dx$$, we use integration by parts.\n\n"
        "**Step 1: Choose u and dv.**\n"
        "Let $u = \\tan^{-1}(x)$\n"
        "Let $dv = dx$\n\n"
        "**Step 2: Differentiate and integrate.**\n"
        "$$du = \\frac{1}{1+x^2} dx$$\n"
        "$$v = x$$\n\n"
        "[...additional steps...]\n\n"
        "The final result is:\n"
        "$$\\int \\tan^{-1}(x) \\, dx = x \\tan^{-1}(x) - \\frac{1}{2}\\ln(1+x^2) + C$$\n\n"
        "Now explain this problem:\n"
        f"User's question: {question}"
    )
    
    response = chat.send_message([prompt, img])
    return response.text

