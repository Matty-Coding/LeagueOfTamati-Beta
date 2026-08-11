# Backend — League of Tamati

Backend del progetto **League of Tamati**: una wiki interattiva e gioco a quiz su League of Legends, con autenticazione utenti, gioco real-time con amici e classifica globale.

Costruito con **FastAPI** + **SQLAlchemy async** + **SQLite** (sviluppo) / **PostgreSQL** (produzione).

---

## Struttura del progetto

```
backend/
├── app/
│   ├── core/
│   │   ├── config.py         # Configurazione centralizzata con pydantic-settings
│   │   ├── email.py          # Configurazione FastMail e invio email di attivazione
│   │   └── security.py       # Hashing password, JWT, CSRF, token di attivazione
│   ├── db/
│   │   └── database.py       # Engine async, sessione, Base dichiarativa, get_db
│   ├── models/
│   │   └── user_model.py     # Modello SQLAlchemy — tabella users
│   ├── schemas/
│   │   ├── auth_schema.py    # UserCreate, UserLogin, LoginResponse
│   │   └── user_schema.py    # UserResponse e schemi CRUD profilo utente
│   ├── routes/
│   │   ├── auth_route.py     # /auth — register, login, refresh, activate
│   │   └── wiki_route.py     # /wiki — dati campioni dal JSON locale
│   ├── services/
│   │   ├── auth_service.py   # Logica registrazione, attivazione, login, refresh
│   │   └── user_service.py   # Query DB per utente — by id, email, username
│   ├── utils/                # Utility interne all'app
│   └── main.py               # Entry point — istanza FastAPI, middleware, router
├── shared/
│   ├── logger.py             # Logger centralizzato condiviso tra app e scripts
│   └── data/
│       └── en_US.json        # Dati campioni normalizzati generati da riot_api.py
├── scripts/
│   ├── riot_api.py           # Fetch, filtraggio ed esportazione dati Riot
│   ├── extract_and_validate.py  # Estrazione e validazione dati dal JSON
│   └── validate_data.py      # Smoke test — verifica che tutti gli URL immagine rispondano 200
├── alembic/                  # Migrations database
├── logs/                     # File di log (esclusi da git)
├── alembic.ini
├── .env                      # Variabili d'ambiente (escluso da git)
├── .env.example              # Template variabili d'ambiente
└── requirements.txt
```

---

## Installazione

```bash
pip install -r requirements.txt
```

---

## Pacchetti utilizzati

### Framework e server

| Pacchetto | Funzione |
|---|---|
| `fastapi` | Framework web async per la costruzione delle API REST e WebSocket |
| `uvicorn` | Server ASGI — avvia l'applicazione FastAPI |

### Database

| Pacchetto | Funzione |
|---|---|
| `sqlalchemy` | ORM — definizione dei modelli e interazione con il database |
| `alembic` | Gestione delle migrations — aggiorna lo schema del DB in modo controllato |
| `aiosqlite` | Driver async per SQLite in sviluppo |
| `asyncpg` | Driver async per PostgreSQL in produzione (da installare in prod) |

### Validazione e configurazione

| Pacchetto | Funzione |
|---|---|
| `pydantic` | Validazione automatica dei dati in entrata e uscita dalle route |
| `pydantic[email]` | Aggiunge il tipo `EmailStr` per validare il formato delle email |
| `pydantic-settings` | Legge le variabili d'ambiente dal file `.env` tramite una classe `Settings` |

### Sicurezza

| Pacchetto | Funzione |
|---|---|
| `bcrypt` | Hashing delle password — usato direttamente senza passlib |
| `python-jose[cryptography]` | Generazione e verifica dei JWT (access token e refresh token) |
| `itsdangerous` | Generazione token CSRF e token di attivazione account firmati |

### Email

| Pacchetto | Funzione |
|---|---|
| `fastapi-mail` | Invio email transazionali — usato per l'attivazione account |

### Script

| Pacchetto | Funzione |
|---|---|
| `requests` | HTTP client sincrono usato in [**scripts/riot_api.py**](./scripts/riot_api.py) per fetchare le API di Riot |

---

## Variabili d'ambiente

Il file `.env` va creato nella root di `backend/` copiando [**.env.example**](.env.example).

```env
APP_NAME=League Of Tamati
DEBUG=True
DATABASE_URL=sqlite+aiosqlite:///./league.sqlite3

SECRET_KEY=
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE=30
REFRESH_TOKEN_EXPIRE=7

CSRF_SECRET_KEY=
ACTIVATION_SECRET_KEY=

MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_FROM=
MAIL_PORT=587
MAIL_SERVER=smtp.gmail.com
MAIL_STARTTLS=True
MAIL_SSL_TLS=False
USE_CREDENTIALS=True
VALIDATE_CERTS=True

FRONTEND_URL=http://localhost:5173
ALLOWED_HOSTS=["*"]
```

In produzione `DATABASE_URL` diventerà:

```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost/dbname
```

### Perché pydantic-settings

`pydantic-settings` legge il `.env` automaticamente tramite la classe `Settings` definita in `app/core/config.py` — senza chiamate esplicite a `load_dotenv()`. Ogni variabile è tipizzata: se manca o ha il tipo sbagliato, il server non parte e lancia un errore chiaro.

L'istanza `settings = Settings()` viene creata una sola volta grazie al sistema di import di Python (singleton tramite modulo) e importata ovunque nel progetto:

```python
from app.core.config import settings
```

---

## Sicurezza — sistema di autenticazione

### Flusso completo

```
REGISTRAZIONE
  POST /auth/register
    → valida email e username univoci
    → salva utente con password hashata (bcrypt), is_active=False
    → genera token di attivazione firmato (itsdangerous)
    → invia email con link di attivazione
    → risponde 201

  GET /auth/activate?token=...
    → verifica token (max 24h)
    → imposta is_active=True

LOGIN
  POST /auth/login
    → verifica credenziali (username + password)
    → verifica is_active
    → genera access token JWT (30 min)
    → genera refresh token JWT (7 giorni) con CSRF nel payload
    → genera CSRF token (itsdangerous)
    → setta cookie httpOnly con refresh token
    → ritorna access token nel body
    → ritorna CSRF token nell'header X-CSRF-Token

REFRESH
  POST /auth/refresh
    → legge refresh token dal cookie httpOnly (automatico)
    → legge CSRF token dall'header X-CSRF-Token
    → verifica JWT e confronta CSRF nel payload con quello ricevuto
    → token rotation — genera nuovi access, refresh e CSRF token
    → aggiorna cookie e header
    → ritorna nuovo access token

LOGOUT
  POST /auth/logout
    → cancella il cookie refresh token
```

### Perché questa architettura

| Token | Dove vive | Perché |
|---|---|---|
| Access token | Memoria React (body response) | Vita breve, non persiste, non accessibile da altri siti |
| Refresh token | Cookie httpOnly | JS non può leggerlo — protetto da XSS |
| CSRF token | Header response + memoria React | Protegge il refresh da attacchi CSRF — un sito malevolo non può leggere gli header |

Il CSRF è integrato nel payload del refresh token — il server ha un'unica fonte di verità per validare l'autenticità della richiesta. Con la **token rotation** ad ogni refresh i token vecchi vengono invalidati, rendendo praticamente impossibile l'uso di token rubati.

### Hashing password

`passlib` è stata sostituita con `bcrypt` diretto per incompatibilità con le versioni recenti:

```python
bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
```

---

## Database e migrations

### Connessione async

Il progetto usa `create_async_engine` di SQLAlchemy con driver `aiosqlite` (sviluppo) per mantenere tutto il codice non bloccante, coerente con FastAPI.

La sessione viene iniettata nelle route tramite la dependency `get_db`:

```python
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

Nelle route si usa con `Depends`:

```python
async def register(user: UserCreate, db: AsyncSession = Depends(get_db)):
```

### Alembic — workflow migrations

> `create_all` non va usato in produzione — non aggiorna tabelle esistenti.
> Tutte le modifiche allo schema passano da Alembic.

```bash
# Creare una nuova migration dopo aver modificato un modello
alembic revision --autogenerate -m "descrizione"

# Applicare le migrations
alembic upgrade head

# Tornare indietro di una migration
alembic downgrade -1
```

---

## Schemas — separazione delle responsabilità

Gli schemi Pydantic sono divisi in due file con responsabilità distinte:

📄 [**auth_schema.py**](./app/schemas/auth_schema.py) — tutto ciò che riguarda il flusso di autenticazione:
- `UserCreate` — dati registrazione (username, email, password)
- `UserLogin` — dati login (username, password)
- `LoginResponse` — risposta login (user + access token)

📄 [**user_schema.py**](./app/schemas/user_schema.py) — tutto ciò che riguarda il profilo utente:
- `UserResponse` — rappresentazione pubblica dell'utente (mai esporre hashed_password)

### Modelli vs Schemas

In FastAPI la distinzione è netta — a differenza di Flask-SQLAlchemy dove spesso coincidevano:

- 📁 [**models/**](./app/models/) → classi SQLAlchemy che mappano le tabelle del DB
- 📁 [**schemas/**](./app/schemas/) → classi Pydantic che definiscono la forma dei dati HTTP

---

## Avvio del server

```bash
uvicorn app.main:app --reload
```

Documentazione interattiva disponibile su:
- Swagger UI → `http://127.0.0.1:8000/docs`
- ReDoc → `http://127.0.0.1:8000/redoc`

---

## Architettura — separazione delle responsabilità

| Layer | Responsabilità |
|---|---|
| 📁 [**routes/**](./app/routes/) | Riceve la request, chiama il service, ritorna la response |
| 📁 [**services/**](./app/services/) | Logica di business — query DB, controlli, trasformazioni |
| 📁 [**models/**](./app/models/) | Definizione delle tabelle SQLAlchemy |
| 📁 [**schemas/**](./app/schemas/) | Validazione dati in entrata e forma dei dati in uscita con Pydantic |
| 📁 [**core/**](./app/core/) | Configurazione, sicurezza, email |
| 📁 [**scripts/**](./scripts/) | Script autonomi non importati dall'app |
| 📁 [**shared/**](./shared/) | Codice condiviso tra [**app/**](./app/) e [**scripts/**](./scripts/extract_and_validate.py) — logger, dati statici |

---

## Scripts

### [**riot_api.py**](./scripts/riot_api.py)

Script **autonomo** che non viene mai importato dall'app. Va eseguito manualmente o schedulato ogni patch (circa ogni 2 settimane).

Fetcha i dati dei campioni dalle API ufficiali di Riot Games (Data Dragon) tramite una classe OOP `ApiLeague`, li normalizza con `ExtractApiContent` ed esporta in [**shared/data/en_US.json**](./shared/data/en_US.json).

I dati prodotti includono per ogni campione: id, nome, titolo, lore, tag, abilità (passive + Q/W/E/R) e skin con tutti gli URL delle immagini dalla CDN di Riot.

**Nota — eccezione Fiddlesticks:** le API di Riot restituiscono l'id del campione come `Fiddlesticks` ma gli URL delle skin usano `FiddleSticks` (Splash Art aggiornate). Lo script gestisce questa anomalia con un cambio runtime dell'id in quella casistica.

### [**validate_data.py**](./scripts/validate_data.py)

Script di smoke test che verifica che ogni URL immagine nel JSON generato risponda con status 200. Usa richieste HEAD in una Sessione per minimizzare il traffico. Va eseguito dopo `riot_api.py` per validare l'integrità dei dati prima del deploy.

### [**extract_and_validate.py**](./scripts/extract_and_validate.py)

Assicurarsi di trovarsi nella cartella backend.

```bash
python -m scripts.extract_and_validate.py
```

Per verificare l'avanzamento in tempo reale dello script:
- 📄 [**log**](./logs/api_data.log) per l'estrazione, elaborazione ed esportazione del JSON;
- 📄 [**log**](./logs/validate_data.log) per la validazione di ogni URL presente nel JSON;
- 📄 [**log**](./logs/extract_and_validate.log) per i step completi (es. validating data...)

---

## Note

- Il file `.env` è escluso da git — non committare mai credenziali
- La cartella `logs/` è esclusa da git
- In sviluppo si usa SQLite — in produzione PostgreSQL con `asyncpg`
- `secure=False` sui cookie — in sviluppo funziona su HTTP, in produzione richiede HTTPS
