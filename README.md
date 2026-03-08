# AI Resume Analyzer

Full-stack resume analysis app with authentication, PDF upload, Gemini-powered evaluation, and a live dashboard fed by backend API aggregation.

---

<img width="600" height="600" alt="Screenshot (423)" src="https://github.com/user-attachments/assets/9dbb7144-9ecd-470e-9439-c76be45a4a20" />
<img width="400" height="400" alt="Screenshot (424)" src="https://github.com/user-attachments/assets/d4984407-49d4-48d7-b072-a1bdc4a55b23" />
<img width="400" height="400" alt="Screenshot (425)" src="https://github.com/user-attachments/assets/9c4d66c4-1e25-4d97-aa3f-3bf1d63d1ee3" />
<img width="400" height="400" alt="Screenshot (426)" src="https://github.com/user-attachments/assets/1b19340d-6109-465c-bf14-b1367a411712" />

## Features

- User signup and login with JWT token generation.
- Secure password hashing using `bcrypt` with long-password-safe preprocessing.
- Resume upload endpoint (PDF only).
- AI resume analysis via Google Gemini.
- Smart Gemini model fallback (auto-selects a supported model if configured model is unavailable).
- Dashboard metrics sourced from real backend data (`/dashboard-data`), not hardcoded frontend values.

## Tech Stack

- Backend: FastAPI, PyMongo, PyPDF2, Google Generative AI SDK, bcrypt, python-dotenv
- Frontend: React, Vite, Axios, Recharts
- Database: MongoDB (Atlas)

## Project Structure

```text
AI-resume-analyzer/
	backend/
		main.py
		auth.py
		database.py
		gemini_ai.py
		routes/
			auth_routes.py
			resume_routes.py
		utils/
			pdf_parser.py
	frontend/
		src/
			App.jsx
			api.js
			pages/
				Login.jsx
				Signup.jsx
				Dashboard.jsx
				UploadResume.jsx
```

## Prerequisites

- Python 3.10+
- Node.js 18+
- npm 9+
- MongoDB Atlas connection string
- Gemini API key

## Backend Setup

Run in a terminal from project root:

```powershell
cd backend
python -m venv .venv
.\.venv\Scripts\activate
pip install fastapi "uvicorn[standard]" pymongo python-dotenv PyPDF2 google-generativeai bcrypt "python-jose[cryptography]" python-multipart
```

Create or update `backend/.env`:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-2.5-flash
JWT_SECRET_KEY=replace-with-a-strong-secret
```

Important:

- MongoDB URL is currently defined in `backend/database.py` (`MONGO_URL`).
- Replace it with your own connection string before running.
- For production, move `MONGO_URL` to environment variables.

Start backend server:

```powershell
uvicorn main:app --reload
```

Backend URLs:

- API base: `http://127.0.0.1:8000`
- Swagger docs: `http://127.0.0.1:8000/docs`

## Frontend Setup

Run in a second terminal from project root:

```powershell
cd frontend
npm install
npm run dev
```

Frontend URL:

- Vite dev server: `http://localhost:5173` (or next available port like `5174`)

The backend CORS config allows localhost loopback ports, so alternate Vite ports still work.

## API Endpoints

### `GET /health`

Returns backend health status.

### `POST /signup`

Request body:

```json
{
	"email": "user@example.com",
	"password": "StrongPassword123!"
}
```

### `POST /login`

Request body:

```json
{
	"email": "user@example.com",
	"password": "StrongPassword123!"
}
```

Response:

```json
{
	"token": "<jwt_token>"
}
```

### `POST /upload-resume`

- `multipart/form-data`
- field name: `file`
- accepts: `.pdf` only

Response shape:

```json
{
	"analysis": {
		"score": 75,
		"skills": ["Python", "FastAPI"],
		"missing_skills": ["Docker"],
		"suggestions": ["Add quantified project outcomes"],
		"model_used": "gemini-2.5-flash"
	}
}
```

### `GET /dashboard-data`

Aggregates real data from stored resume analyses and returns:

- `overall_score`
- `ats_pass_rate`
- `versions_uploaded`
- `issues_found`
- `latest_analysis`
- chart arrays: `radar_data`, `keyword_data`, `trend_data`, `section_data`, `activity_data`
- `action_items`

## How Dashboard Data Works

- Every upload stores `{ filename, analysis, created_at }` in MongoDB.
- `GET /dashboard-data` calculates dashboard metrics from recent history.
- `Dashboard.jsx` fetches `/dashboard-data` on load.
- After a successful upload, `UploadResume.jsx` triggers a dashboard refresh so charts and counters update immediately.

## Troubleshooting

- `AI analysis is unavailable`:
	- Check `GEMINI_API_KEY` in `backend/.env`.
	- Restart backend after editing `.env`.

- Gemini model error (404/not found):
	- The app auto-falls back to supported models.
	- If needed, set `GEMINI_MODEL=gemini-2.5-flash`.

- `Only PDF files are supported`:
	- Upload a `.pdf` file only.

- Frontend cannot reach backend:
	- Ensure backend is running on port `8000`.
	- Confirm frontend uses `VITE_API_BASE_URL` or defaults to `http://localhost:8000`.

- Exit code `1` after `uvicorn --reload` or `npm run dev`:
	- If you stopped with Ctrl+C or timeout, this can be expected.

## Security Notes

- Never commit real API keys or database credentials.
- Rotate keys immediately if they are exposed.
- Use environment variables for all secrets in production.
