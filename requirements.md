# MindEase: Stress Relief Application Requirements

## 1. Project Overview
**MindEase** is a web-based stress-relief application designed to help users manage stress through gamified activities, mood tracking, guided breathing exercises, and educational resources.

---

## 2. Functional Requirements

### 2.1 User Management & Security
- **Authentication**: Secure user registration (signup) and login using email and password.
- **Session Management**: JWT-based session handling with secure, httpOnly cookies.
- **Security**: Password hashing using `bcryptjs`.
- **First-time Experience**: Prompt users to set a personalized username upon their first login.
- **Account Security**: Facility to change user passwords.
- **Authorized Access**: Restrict access to personalized features (Dashboard, Games, Journal, etc.) to logged-in users only.
- **Logout**: Securely clear session tokens upon logout.

### 2.2 Personalized Dashboard
- **Welcome Interface**: Display a personalized greeting based on the user's name.
- **Navigation**: Central hub for accessing all core application features (Relaxation, Assessment, Games, Journal).
- **Proactive Tips**: Quick access to stress-relief advice via a floating "Tips" button.

### 2.3 Gamified Activities (Relaxation Games)
- **Game Suite**:
    - **Emoji Memory Match**: A memory-enhancing game where users find pairs of emojis.
    - **Bubble Pop**: A relaxing manual dexterity game requiring users to click appearing bubbles.
    - **Catch the Clouds**: A reaction-time game where users catch falling clouds using a "basket" (keyboard-controlled).
- **Progress Tracking**: Persistent high-score recording for each game stored in the database.
- **Audio Control**: Toggleable background calm music during gameplay.
- **Timer Mechanics**: Time-limited sessions to encourage focused relaxation.

### 2.4 Mood Journal & Analytics
- **Entry Logging**: Allow users to log their current mood (Happy, Neutral, Sad, Angry, Anxious, Relaxed) along with optional notes.
- **Historical View**: Display a reverse-chronological list of past mood entries with timestamps.
- **Mood Analytics**: Visual representation of mood distribution (pie chart) using `Chart.js` to help users identify patterns over time.

### 2.5 Relaxation & Breathing Techniques
- **Guided Breathing**: Interactive animation for "Inhale, Hold, Exhale" cycles.
- **Customization**:
    - User-defined duration (minutes).
    - Choice of background ambience (Forest, Ocean, Piano, etc.).
- **Focus Dot Mini-game**: A simple reaction-based game integrated into the relaxation flow to help with grounding.

### 2.6 Self-Assessment & Education
- **Stress Quiz**: A 10-question self-assessment to help users understand their current stress levels.
- **Result Interpretation**: Immediate feedback and recommendations based on quiz scores.
- **Educational Tips**: A dedicated section with science-backed tips for managing stress (e.g., 4-7-8 breathing, gratitude reflection).

---

## 3. Technical Requirements

### 3.1 Backend (Server-Side)
- **Environment**: Node.js runtime.
- **Framework**: Express.js for RESTful API routing and static file serving.
- **Database**: MySQL for persistent storage of user data, game scores, and mood logs.
- **Authentication**: `jsonwebtoken` (JWT) for secure, stateless authentication.
- **Middleware**:
    - `cookie-parser` for cookie-based auth.
    - `body-parser` / `express.json` for request processing.
    - Custom authentication guards for protected routes.
    - Cache-control headers to prevent unauthorized "Back" button navigation post-logout.

### 3.2 Frontend (Client-Side)
- **Technologies**: Vanilla HTML5, CSS3, and modern JavaScript (ES6+).
- **Graphics**: HTML5 Canvas API for interactive games.
- **Data Visualization**: `Chart.js` library for mood statistics.
- **Styling**: Modern CSS with gradients, flexbox/grid layouts, and responsive design principles.
- **Typography**: Integration of high-quality web fonts (e.g., Poppins).

### 3.3 Infrastructure & Deployment
- **Port**: Application runs on port `3000` by default.
- **Environment Variables**: Use of environment variables for sensitive keys (e.g., JWT Secret).

---

## 4. UI/UX Requirements
- **Aesthetic**: A calming, premium design using soft color palettes (pastel greens, blues).
- **Responsiveness**: Layout must adapt gracefully to different screen sizes.
- **Feedback Loop**: Clear visual and auditory feedback (alerts, transitions, score updates).
- **Simplicity**: Minimalistic navigation to reduce cognitive load on stressed users.
