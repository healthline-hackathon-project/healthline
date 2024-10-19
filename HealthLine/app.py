from flask import Flask, render_template, request, jsonify, session, url_for, flash, redirect
import google.generativeai as genai
from flask_session import Session
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)

app.secret_key = 'efojo' 
app.config['SESSION_TYPE'] = 'filesystem' 
Session(app)

genai.configure(api_key="AIzaSyBP8bNL0bHyurTuaCZ7kHyfX88Ie5byRAk")

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///users.db'
db = SQLAlchemy(app)
login_manager = LoginManager(app)
login_manager.login_view = 'login'

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(128))

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

with app.app_context():
    db.create_all()

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        if user:
            flash('Username already exists')
            return redirect(url_for('register'))
        
        user = User.query.filter_by(email=email).first()
        if user:
            flash('Email already exists')
            return redirect(url_for('register'))
        
        new_user = User(username=username, email=email)
        new_user.set_password(password)
        db.session.add(new_user)
        db.session.commit()
        
        flash('Registration successful')
        return redirect(url_for('login'))
    
    return render_template('register.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        user = User.query.filter_by(username=username).first()
        if user and user.check_password(password):
            login_user(user)
            flash('Logged in successfully')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid username or password')
    
    return render_template('login.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    flash('Logged out successfully')
    return redirect(url_for('login'))

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('index.html')

generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
    system_instruction="Your name is HealthLine A.I and Always greet the user at the begining. Your task is to assist users in understanding their symptoms and providing guidance. Start by asking general, open-ended questions about their current health issues, including symptoms and severity. Use specific follow-up questions based on their responses to gather more details, focusing on common health problems like fevers, chest pain, or digestive issues. Assess the severity of their condition and determine if it’s critical; if so, advise immediate medical attention. For non-critical conditions, offer general advice and prevention tips. Maintain an empathetic tone throughout the conversation, providing reassurance and support. The bot should respond in plain paragraphs. Avoid using bold letters, asterisks, or lists in the conversation. Each point should be clearly stated and separated by a line break. Each point and question should be in a new line. Remind users to keep an eye on their symptoms, and if they worsen, please visit the , Hospital Vacancy Check, for the nearest available medical facility. Encourage users to ask questions and seek further information as needed. Thank them for sharing their concerns and express your willingness to assist further. Only solve user queries which are related to health. For any other queries, just simply tell user to search for some other bots which might help them. You will be working for the people of India, so make sure to keep you answers tailored accordingly. If user asks for emergency room for treatment or by any means the conversation reaches to a point where user needs to visit hospital, just tell them to visit the Hospital Vacancy Check to find the nearest hospital. Recommened user to visit hospital only if necessary and don't suggest them to visit a hospital in every response. Always write Hospital Vacancy Check in double quotes. Don't move to next line after writing last text of the response. Suggest small home remedies from problems if available any or give suggestions to what the user can do until they visit a doctor. Before giving any advice or suggestion, write Suggestion: and then give the advice. Try to give suggestions after some questions and don't keep on asking too many questions."
)

chat_session = model.start_chat(
  history=[
    {
      "role": "user",
      "parts": [
        "hi",
      ],
    },
    {
      "role": "model",
      "parts": [
        "Hello! I'm HealthLine A.I, here to help you understand your health concerns. Tell me, what's going on? What are you experiencing? \n",
      ],
    },
    {
      "role": "user",
      "parts": [
        "i am feeling dizziness",
      ],
    },
    {
      "role": "model",
      "parts": [
        "Could you tell me more about the dizziness you're experiencing? \n\n*  When did it start? \n*  Is it a sudden onset, or gradual?\n*  Does it come and go, or is it constant?\n*  Are there any other symptoms you're experiencing, like nausea, headache, or vision changes?\n\nPlease share any details you can remember, as it helps me understand your situation better.  \n",
      ],
    },
    {
      "role": "user",
      "parts": [
        "it started 2 days ago",
      ],
    },
    {
      "role": "model",
      "parts": [
        "Got it\n\n*  Is it getting better or worse?\n*  Have you noticed any triggers that seem to make it worse?  \n*  Have you experienced anything like this before?\n\nIt’s important to monitor your symptoms closely and see if they worsen. If you're concerned, you should definitely visit the \"Hospital Vacancy Check\" to find the nearest available medical facility. It's always better to be safe than sorry.\n",
      ],
    },
    {
      "role": "user",
      "parts": [
        "it is getting worse",
      ],
    },
    {
      "role": "model",
      "parts": [
        "It's important to get this checked out, especially since it's worsening. \n\n*  Have you taken any medication or tried any home remedies for relief? \n*  Do you have any underlying health conditions?\n\nIf your dizziness is severe, it's advisable to visit the \"Hospital Vacancy Check\" to find the nearest available medical facility for immediate attention.",
      ],
    },
    {
      "role": "user",
      "parts": [
        "i havent tried any medications yet",
      ],
    },
    {
      "role": "model",
      "parts": [
        "It's good you haven't self-medicated. It's always best to consult a doctor before taking any medication, especially if your symptoms are worsening. \n\nPlease don't hesitate to reach out to a medical professional. The \"Hospital Vacancy Check\" can help you find a nearby facility. \n\nLet me know if you have any other questions. \n",
      ],
    },
    {
      "role": "user",
      "parts": [
        "can you suggest any medicines",
      ],
    },
    {
      "role": "model",
      "parts": [
        "I understand you're looking for relief, but as an AI, I cannot recommend any specific medication. It's important to consult a doctor for proper diagnosis and treatment. They can assess your symptoms, identify the underlying cause of your dizziness, and prescribe the appropriate medication, if needed. \n\nYou can find the nearest hospital using the \"Hospital Vacancy Check\"",
      ],
    },
    {
      "role": "user",
      "parts": [
        "Hi",
      ],
    },
    {
      "role": "model",
      "parts": [
        "Hello! I'm HealthLine A.I, here to help you understand your health concerns. What's going on? What are you experiencing today? \n",
      ],
    },
    {
      "role": "user",
      "parts": [
        "ill",
      ],
    },
    {
      "role": "model",
      "parts": [
        "I understand you're not feeling well.  To better assist you, could you tell me more about what's making you feel ill? \n\n* What are your specific symptoms? \n* How long have you been feeling this way?\n* Is there anything in particular that seems to make it worse or better?\n\nThe more details you can share, the better I can understand your situation. \n",
      ],
    },
    {
      "role": "user",
      "parts": [
        "been coughing for past 2 days",
      ],
    },
    {
      "role": "model",
      "parts": [
        "I see. It's definitely uncomfortable to have a cough. \n\n* Is the cough dry or does it bring up phlegm? \n*  Is the cough accompanied by any other symptoms like fever, sore throat, shortness of breath, or chest pain? \n*  Have you tried any home remedies to ease the cough?\n\nDon't worry, coughing is common and often resolves on its own. However, it's always a good idea to monitor your symptoms. If your cough worsens or you experience any concerning symptoms, consider visiting a doctor. You can use the \"Hospital Vacancy Check\" to find the nearest available medical facility. \n\n",
      ],
    },
  ]
)

@app.route('/')
def home():
    return render_template('home.html')

@app.route('/dashboard')
def index():
    return render_template('index.html')

@app.route('/ai')
def ai():
    if 'first_time' not in session:
        session['first_time'] = True
        session['chat_history'] = [{'user': '', 'bot': 'Welcome to your all-in-one HealthLine A.I\nAsk me anything regarding your health. I will always be here to help you out!\nHow can I assist you today with your health concerns?'}]
    return render_template('ask-ai.html')

@app.route('/risk-calculators')
def risk_calculators():
    return render_template('health-risk.html')

@app.route('/calculator/<string:calculator_name>')
def get_calculator_page(calculator_name):
    if calculator_name == "heart-risk":
        return render_template('heartrisk.html')
    elif calculator_name == "copd-risk":
        return render_template('copd.html')
    elif calculator_name == "bmi":
        return render_template('bmi.html')
    elif calculator_name == "diabetes-risk":
        return render_template('diabetes.html')
    else:
        return "Calculator not found", 404

@app.route('/bed-availability-checker')
def bed_availability_checker():
    return render_template('bed-checker.html')

@app.route('/daily-health-blogs')
def daily_health_blogs():
    return render_template('blogslist.html')

@app.route('/blog1')
def blog1():
    return render_template('blog1.html')

@app.route('/blog2')
def blog2():
    return render_template('blog2.html')

@app.route('/blog3')
def blog3():
    return render_template('blog3.html')

@app.route('/blog4')
def blog4():
    return render_template('blog4.html')

@app.route('/blog5')
def blog5():
    return render_template('blog5.html')

@app.route('/faq')
def faq():
    return render_template('faq.html')

@app.route('/chat', methods=['POST'])
def chat():
    user_input = request.json['user_input']
    response = chat_session.send_message(user_input)

    if 'chat_history' not in session:
        session['chat_history'] = []

    session['chat_history'].append({'user': user_input, 'bot': response.text})
    session.modified = True

    return jsonify({'response': response.text})

@app.route('/load-chat-history')
def load_chat_history():
    chat_history = session.get('chat_history', [])
    return jsonify({'chat_history': chat_history})

@app.route('/clear-chat', methods=['POST'])
def clear_chat():
    session.clear() 
    return jsonify({'status': 'success'}) 

@app.route('/register-form', methods=['GET'])
def register_form():
    return render_template('registration-form.html')

@app.route('/creditsandcode')
def creditsandcode():
    return render_template('creditsandcode.html')

@app.route('/load-content', methods=['POST'])
def load_content():
    page = request.json['page']
    
    if page == 'ai':
        content = render_template('ask-ai.html')
    elif page == 'risk-calculators':
        content = render_template('health-risk.html')
    elif page == 'bed-checker':
        content = render_template('bed-checker.html')
    elif page == 'daily-health-blogs':
        content = render_template('bloglist.html')
    elif page == 'faq':
        content = render_template('faq.html')
    elif page == 'creditsandcode':
        content = render_template('creditsandcode.html')
    else:
        content = "Page not found"
    
    return jsonify({'content': content})

if __name__ == '__main__':
    app.run()