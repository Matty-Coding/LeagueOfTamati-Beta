# League of Tamati 

---

## 1. Cosa ho costruito e perché questo documento

League of Tamati è una wiki interattiva su League of Legends con autenticazione completa, quiz, classifiche e un sistema di amicizie tra utenti. L'ho costruita per un motivo preciso: volevo smettere di "sapere a grandi linee" come funziona un backend moderno e async, e iniziare a saperlo *davvero*, mettendo le mani su un progetto con una superficie complessa quanto basta da farmi sbattere contro problemi reali (autenticazione sicura, N+1 query, race condition sui token, gestione dello stato lato frontend).

Ho già un file di questo tipo per Django, scritto quando l'ho studiato. Questo è l'equivalente per FastAPI, con l'aggiunta che qui il framework lo racconto attraverso un progetto che ho effettivamente portato avanti, non solo attraverso la teoria.

---

## 2. Perché FastAPI e non Flask o Django

Flask è stato il primo, learning curve leggera mi ha permesso di toccare con mano il mondo delle web app.

In seguito ho studiato Django, che mi ha permesso di applicare tutti i concetti che avevo già appreso in modo più rapido e con meno possibilità di errore in quanto Django ha praticamente tutto già pronto. Inoltre mentre studiavo Django ho notato che la *libertà* che avevo nello sviluppo con Flask veniva a mancare quasi del tutto.

Fast Api era quello che mi mancava, ho deciso di affrontarlo solo ora, in seguito ad un corso che includeva Typescript + React, l'approccio per completare il full stack conoscendo già Python è stato naturale.

Prima di toccare con mano questo framework, sapevo soltanto che lavorava in modo asincrono di natura e che forniva una documentazione automatica per quanto riguarda le API.

Studiandolo ho potuto notare anche, a differenza degli altri due, questo framework non gestisce il rendering server side, il che è perfetto per unirci un'interfaccia moderna e responsiva sviluppata in modo separato e senza interferenza, distiguendo cosi le due entità backend e frontend.

- **Pydantic** per la validazione dei dati (le annotazioni di tipo Python diventano regole di validazione e, allo stesso tempo, documentazione automatica);
- **async/await nativo**, quindi un endpoint che aspetta il database non blocca il resto del server.

Sviluppando, mi sono reso conto lavoro in meno ho dovuto affrontare grazia a Pydantic lato Python e Typescript nel frontend.

Essendo la prima volta che sviluppo un progetto full stack moderno di questo tipo, ho affrontato ragionamenti che prima non mi ponevo neanche, risparmiare su una richiesta in più creando una response più completa e dettagliata, gestire in modo assoluto e con la sicurezza tutto lato server, lasciando all'interfaccia il solo compito di mostrare a schermo dei dati.

---

## 3. Struttura del progetto

```
backend/
  app/
    main.py            # crea l'app FastAPI, registra middleware, CORS, router
    core/              # config, sicurezza, invio email, rate limiting
    db/
      database.py      # engine async, AsyncSession, base dichiarativa
    models/            # User, Profile, Friendship, ...
    schemas/           # Pydantic: request/response
    routes/            # endpoint, organizzati per dominio
    services/          # logica degli endpoint
    utils/             # funzioni d'utilità generale

frontend/
  src/
    services/          # chiamate API usando istanza di Axios
    hooks/             # custom hooks
    context/           # AuthProvider e stato globale
    components/       
    pages/
    types/             # contratti associati al backend
```

Il criterio con cui ho diviso `routes` da `services` è semplice: **le route ricevono la richiesta e restituiscono la risposta, i services contengono la logica**. Questo mi permette di leggere un endpoint in 5 righe e capire subito cosa fa, senza scorrere 40 righe di logica mischiata alla gestione HTTP, inoltre mi permette di creare anche endpoint che applicano logiche miste in modo ordinato e perfettamente scalabile.

---

## 4. Le librerie che uso, e a cosa servono davvero

Questa è la parte che in Django davo per scontata (c'era già tutto), mentre qui ho dovuto scegliere pezzo per pezzo, come facevo con Flask, ma con la nuova sensazione che tutto era realmente moderno:

| Libreria | A cosa serve nel progetto |
|---|---|
| `SQLAlchemy` (async) + `aiosqlite` | ORM e driver database, in versione asincrona |
| `Alembic` | Migrazioni dello schema database |
| `pydantic` / `pydantic-settings` | Validazione dati e lettura tipizzata delle variabili d'ambiente |
| `python-jose` | Creazione e verifica dei JWT (access token) |
| `itsdangerous` | Token firmati per attivazione account e CSRF |
| `bcrypt` (diretto, non `passlib`) | Hashing delle password |
| `fastapi-mail` | Invio email di attivazione |
| `slowapi` | Rate limiting sugli endpoint sensibili |

---

## 5. Variabili d'ambiente: lette in autonomia con `pydantic-settings`

In Flask/Django ero abituato a leggere manualmente e in modo singolo le variabili d'ambiente, ora grazie a questa libreria mi è bastato configurarle nel modo corretto e vengono caricate ed integrate automaticamente.

Con `pydantic-settings` definisco una classe `Settings` che eredita da `BaseSettings`, con un campo tipizzato per ogni variabile che mi serve:

```python
# app/core/config.py
from pydantic_settings import BaseSettings, SettingsConfigDict
from pathlib import Path
from pydantic import EmailStr


class Settings(BaseSettings):

    # app name & debug
    APP_NAME: str
    DEBUG: bool

    # database
    DATABASE_URL: str

    # email credentials
    MAIL_USERNAME: str
    MAIL_PASSWORD: str
    MAIL_FROM: EmailStr

    # email config
    MAIL_PORT: int = 587
    MAIL_SERVER: str = "smtp.gmail.com"
    MAIL_STARTTLS: bool = True
    MAIL_SSL_TLS: bool = False
    USE_CREDENTIALS: bool = True
    VALIDATE_CERTS: bool = True

    # security
    SECRET_KEY: str
    ALGORITHM: str
    ACCESS_TOKEN_EXPIRE: int
    REFRESH_TOKEN_EXPIRE: int
    CSRF_SECRET_KEY: str
    ACTIVATION_SECRET_KEY: str
    RESET_PASSWORD_SECRET_KEY: str

    # frontend url
    FRONTEND_URL: str

    # cors
    ALLOWED_HOSTS: list[str] = [
        "http://localhost:5173",
        "https://league-of-tamati-beta.vercel.app"
    ]

    # models
    model_config = SettingsConfigDict(
        env_file=Path(__file__).parent.parent.parent / ".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()  
```

---

## 6. Come FastAPI gestisce gli endpoint

Un endpoint in FastAPI è una funzione Python decorata con un metodo HTTP, ricorda molto la sintassi di Flask:

```python
from fastapi import APIRouter, HTTPException
from app.utils.champion import get_data
from app.schemas.wiki import Champion

router = APIRouter(
    prefix="/wiki",
    tags=["Wiki"],
    responses={404: {"description": "Not found"}},
)


@router.get("/", response_model=list[Champion])
def get_wiki():
    return get_data()


@router.get("/{champion_id}", response_model=Champion)
def get_champion_details(champion_id: str):
    data = get_data()

    champion_data = next(
        (champion for champion in data if champion["id"] == champion_id),
        None
    )

    if not champion_data:
        raise HTTPException(status_code=404, detail="Champion not found")

    return champion_data
```

```python
from pydantic import BaseModel


class Spell(BaseModel):
    id: str
    name: str
    description: str
    imageUrl: str


class Skin(BaseModel):
    name: str
    imageUrl: str


class Champion(BaseModel):
    id: str
    name: str
    title: str
    imageUrl: str
    lore: str
    tags: list[str]
    spells: list[Spell]
    skins: list[Skin]
```

Ci sono tre cose in questa singola riga che in Flask/Django avrei dovuto gestire "a mano" o con strumenti diversi:


1. **`champion_id: str`** — è un path parameter, e FastAPI lo valida e lo converte automaticamente in base al tipo dichiarato (se dichiarassi `champion_id: int` e arrivasse una stringa non numerica, l'endpoint risponderebbe da solo con un 422, senza che io scriva un controllo esplicito).
2. **`response_model=Champion`** — la risposta viene filtrata e validata contro questo schema Pydantic. Anche se l'oggetto che ritorno avesse campi in più, il client riceve solo quello che `Champion` dichiara. Questo è anche il meccanismo che genera la documentazione automatica su `/docs`.
3. **`db: AsyncSession = Depends(get_db)`**.


Ho cercato di creare quanti più response_model possibili, non per allungare il codice ma per garantire al meglio le logiche e la sicurezza dei dati sensibili, oltre la comodità di creare l'istanza della classe in modo preciso.
Questo ovviamente applicato anche alla requests in entrata, dove serviva ho fatto in modo di avere uno schema preciso dei dati che dovevano arrivare a quell'endpoint, in qualsiasi altro caso risulterebbe errore a priori.

---

## 7. Il sistema delle dipendenze di FastAPI (`Depends`)

Questa è la parte che, arrivando da Django, mi ha richiesto il salto mentale più grande. Django risolve l'autenticazione con un decoratore (`@login_required`) o con un middleware globale. FastAPI non ha equivalenti built-in: usa invece un **sistema di dependency injection** basato sulla funzione `Depends`.

L'idea di fondo: una dipendenza è una funzione qualsiasi che FastAPI chiama *prima* della tua funzione endpoint, e il cui valore di ritorno viene passato come parametro. Le dipendenze possono a loro volta dipendere da altre dipendenze (dependency chaining), e FastAPI costruisce il grafo di risoluzione da solo.

Nel progetto uso questo pattern in due punti chiave:

**`get_db`** — una dipendenza "yield", cioè che usa `yield` invece di `return`:

```python
async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
```

Tutto quello che sta *prima* dello `yield` viene eseguito prima che l'endpoint parta (apertura della sessione), tutto quello che sta *dopo* — se ci fosse, es. dentro un `try/finally` — viene eseguito dopo che l'endpoint ha finito, **anche se l'endpoint ha sollevato un'eccezione**. È lo stesso principio di un context manager, ma applicato al ciclo di vita di una richiesta HTTP.

**`get_current_user`** — la dipendenza che protegge le rotte private:

```python
# app/core/dependencies.py

from fastapi import Depends, HTTPException, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from app.db.database import get_db
from app.services.user import get_user_by_id
from app.core.security import check_access_token

security = HTTPBearer()


async def get_current_user(
    db: AsyncSession = Depends(get_db),
    credentials: HTTPAuthorizationCredentials = Depends(security),
):

    payload = check_access_token(credentials.credentials)

    if not payload:
        raise HTTPException(status_code=401, detail="Invalid token")

    db_user = await get_user_by_id(db, int(payload["sub"]))

    if not db_user:
        raise HTTPException(status_code=401, detail="User not found")

    if not db_user.is_active:
        raise HTTPException(status_code=401, detail="Account not activated")

    return db_user
```

Notare che `get_current_user` dipende a sua volta da `get_db`: è dependency chaining. E la uso in ogni route protetta con `Depends(get_current_user)` nella firma della funzione.


Un dettaglio importante sulla cache: per default, **ogni dipendenza viene chiamata una sola volta per richiesta**, anche se più endpoint (o più dipendenze annidate) la richiedono. Se due parametri diversi della stessa funzione dipendessero entrambi da `get_current_user`, FastAPI non la eseguirebbe due volte.


Inoltre si può applicare la dipendenza anche in modo "globale" per quel router specifico, proteggendo ad esempio tutti gli endpoint con prefisso `/profile`
---

## 8. Validazione dei dati con Pydantic

Ogni payload che entra nell'app (registrazione, login, aggiornamento profilo) passa da uno schema definito in `app/schemas/`. La cosa che uso più spesso sono i **validator personalizzati**, per esempio sulla password (obbligo di maiuscole, minuscole, numeri, caratteri speciali):

```python
# app/schemas/auth.py

from pydantic import BaseModel, EmailStr, field_validator
from app.schemas.user import UserResponse
from re import match


class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

    @field_validator("username")
    @classmethod
    def validate_username(cls, value: str) -> str:
        username_regex = r"^\w{3,20}$"
        if not match(username_regex, value):
            raise ValueError(
                "Username must be between 3 and 20 characters long and contain no spaces or special characters"
            )

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        password_regex = r"^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9])(?=.*[!@#.%^&?*])[A-Za-z0-9!@#.%^&?*]{8,}$"
        if not match(password_regex, value):
            raise ValueError(
                "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number and one special character"
            )

        return value


class RegisterResponse(BaseModel):
    message: str
    email: EmailStr


class UserLogin(BaseModel):
    username: str  # username is unique
    password: str


class LoginResponse(BaseModel):
    user: UserResponse
    access_token: str


class ResendActivationPayload(BaseModel):
    email: EmailStr
```

Un principio architetturale che ho adottato e che voglio ricordarmi: **i `services` sollevano `ValueError` per gli errori di dominio, e sono le `routes` a tradurli in `HTTPException`**. In questo modo i services restano indipendenti da FastAPI.


```python
# app/routes/auth.py

@router.post("/login", status_code=200, response_model=LoginResponse)
@limiter.limit("5/minute")
async def login(
    request: Request,
    user: UserLogin,
    response: Response,
    db: AsyncSession = Depends(get_db),
):
    try:
        tokens = await login_user(db, user)     # funzione del service
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))   # codice http specifico dell'errore

    set_tokens(response, tokens["refresh_token"], tokens["csrf_token"])

    current_rank = await get_current_rank(db, tokens["user"].id)

    return {
        "user": {
            "id": tokens["user"].id,
            "username": tokens["user"].username,
            "email": tokens["user"].email,
            "is_active": tokens["user"].is_active,
            "avatar": tokens["user"].profile.avatar,
            "background": tokens["user"].profile.background,
            "extreme_game_record": tokens["user"].profile.extreme_game_record,
            "current_rank": current_rank
        },
        "access_token": tokens["access_token"],
    }
```

---

## 9. Database asincrono con SQLAlchemy 2.0

Ho scelto SQLAlchemy 2 con `create_async_engine` e `AsyncSession` per restare coerente con la natura async di FastAPI: se usassi un driver sincrono, ogni query bloccherebbe l'intero event loop, vanificando il vantaggio di avere un framework asincrono.

### Il problema N+1 e `selectinload`

Quando carico un utente insieme al suo profilo (o una lista di amicizie insieme ai dati dell'amico), uso `selectinload` per fare eager loading della relazione, invece di lasciare che SQLAlchemy faccia una query separata per ogni riga (il classico problema N+1: 1 query per la lista + N query, una per ogni elemento correlato).

```python
# app/services/friendship.py

async def _get_friendship_with_relations(db: AsyncSession, friendship_id: int) -> Friendship | None:
    """
    Get friendship with relations
    """

    result = await db.execute(
        select(Friendship)
        .where(Friendship.id == friendship_id)
        .options(
            selectinload(Friendship.requester).selectinload(User.profile),
            selectinload(Friendship.receiver).selectinload(User.profile),
        )
    )
    return result.scalar_one_or_none()
```

In questo modo in una sola query associo la relazione One to One tra i modelli User e Profile, permettendomi una volta estratto il valore di lavorare sul singolo oggetto, evitando quindi ulteriori chiamate al db.

### Calcoli fatti dal database invece che da Python

Durante il calcolo della posizione in classifica dell'utente loggato mi sono posto un quesito:

*Come e dove conviene calcolare il valore effettivo?*

```python
async def get_current_rank(db: AsyncSession, user_id: int) -> int:
    db_user = await get_user_by_id(db, user_id)

    if not db_user:
        raise ValueError("User not found")

    record_score = db_user.profile.extreme_game_record

    result = await db.execute(
        select(func.count(Profile.id))
        .where(Profile.extreme_game_record > record_score)
    )

    current_rank = result.scalar()

    return current_rank + 1
```

Inizialmente avevo estratto tutti i record di User con Profile annesso, tuttavia questo richiedeva in primo luogo ordinare la sequenza ricevuta in ordine decrescente, con chiave di ordinamento il punteggio della modalità e successivamente un ciclo in Python per estrarre in base all'ID del player il suo index + 1, che sarebbe stato equivalente alla sua posizione.

Come appena visto invece, alla fine ho optato per calcolare tutto direttamente nel db, sviluppando quindi un nuovo criterio di approccio a queste domande, se qualcosa la può fare il db, la faccio fare al db, anche per garantire eventuale atomicità in altri contesti. Evito di separare un calcolo che potrei fare tutto insieme in un unico posto.

---

## 10. Migrazioni con Alembic

Con questa libreria ogni cambiamento allo schema (nuova colonna, nuova tabella, vincolo aggiunto) diventa una revisione versionata, applicabile e — soprattutto — **annullabile**.

```bash
alembic revision --autogenerate -m "aggiunta colonna 'ultimo accesso' al modello user"
alembic upgrade head
```

---

## 11. Sicurezza: come ho progettato l'autenticazione

Questa è la parte a cui ho dedicato più tempo, e il flusso è questo:

1. Registrazione (`POST /auth/register`) → account creato con `is_active=False`.
2. Email di attivazione inviata via `fastapi-mail`, con un token firmato da `itsdangerous` (non un JWT: qui mi serviva un token con scadenza semplice, non un payload strutturato da verificare lato client).
3. Login → password verificata con `bcrypt`.
4. **Access token JWT** (`python-jose`), a vita breve, usato per autenticare le chiamate API.
5. **Refresh token** in un cookie `HttpOnly` — non leggibile da JavaScript, quindi protetto da furto via XSS.
6. **CSRF token** inviato nell'header `X-CSRF-Token` — necessario perché il cookie `HttpOnly` da solo non basta a proteggere da richieste cross-site.

Il punto che voglio ricordarmi bene è **perché servono sia il cookie HttpOnly sia il CSRF token insieme**, e non uno dei due soltanto:

- Se il refresh token fosse leggibile da JS (invece che in un cookie HttpOnly), un attacco XSS potrebbe rubarlo direttamente.
- Se invece mi fidassi solo del cookie HttpOnly senza CSRF token, il browser allegherebbe automaticamente il cookie anche a richieste innescate da un sito malevolo (CSRF) — il cookie da solo non dimostra che la richiesta parte davvero dal mio frontend.
- Il CSRF token, per essere efficace, deve essere leggibile da JS (per essere messo nell'header) ma verificato lato server contro un valore che il sito malevolo non può conoscere.

```python
from itsdangerous import URLSafeTimedSerializer
from app.core.config import settings
from datetime import datetime, timedelta, timezone
from jose import jwt
import bcrypt
from fastapi import Response

# ====================================
# ========  hash password  ===========
# ====================================


def generate_hashed_password(password: str) -> str:
    """
    Returns hashed password
    """

    return bcrypt.hashpw(
        password.encode("utf-8"),
        bcrypt.gensalt()
    ).decode("utf-8")


def check_hashed_password(password: str, hashed: str) -> bool:
    """
    Checks if password is correct
    """

    return bcrypt.checkpw(
        password.encode("utf-8"),
        hashed.encode("utf-8")
    )


def generate_reset_password_token(user_id: int, email: str) -> str:
    """
    Returns reset password token
    """

    serializer = URLSafeTimedSerializer(settings.RESET_PASSWORD_SECRET_KEY)

    data = {
        "user_id": user_id,
        "email": email
    }
    return serializer.dumps(data, salt="reset-password")


def check_reset_password_token(token: str) -> dict | None:
    """
    Checks if reset password token is valid, returns dict with user_id and email
    """

    serializer = URLSafeTimedSerializer(settings.RESET_PASSWORD_SECRET_KEY)
    try:
        # 10 minutes
        return serializer.loads(token, salt="reset-password", max_age=60 * 10)
    except Exception:
        return None

# ====================================
# =============  JWT  ================
# ====================================


def generate_access_token(data: dict) -> str:
    """
    Returns access token
    """

    expire = (
        datetime.now(timezone.utc) +
        timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE)
    )
    return jwt.encode(
        {**data, "exp": expire},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def check_access_token(token: str) -> dict | None:
    """
    Decodes access token and returns payload
    """

    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except Exception:
        return None


def generate_refresh_token(data: dict, csrf_token: str) -> str:
    """
    Returns refresh token including csrf token in payload
    """

    expire = (
        datetime.now(timezone.utc) +
        timedelta(days=settings.REFRESH_TOKEN_EXPIRE)
    )
    return jwt.encode(
        {**data, "exp": expire, "csrf_token": csrf_token},
        settings.SECRET_KEY,
        algorithm=settings.ALGORITHM
    )


def check_refresh_token(token: str) -> dict | None:
    """
    Decodes refresh token and returns payload
    """

    try:
        return jwt.decode(
            token,
            settings.SECRET_KEY,
            algorithms=[settings.ALGORITHM]
        )
    except Exception:
        return None

# ====================================
# =============  CSRF  ===============
# ====================================


def generate_csrf_token(user_id: str) -> str:
    serializer = URLSafeTimedSerializer(settings.CSRF_SECRET_KEY)
    return serializer.dumps(user_id, salt="csrf")


def check_csrf_token(token: str) -> str | None:
    serializer = URLSafeTimedSerializer(settings.CSRF_SECRET_KEY)
    try:
        # during as long as refresh token is valid
        # matching the expiration of the refresh token
        max_age_seconds = 60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE
        return serializer.loads(token, salt="csrf", max_age=max_age_seconds)
    except Exception:
        return None

# =============================================
# =============  account activation  ==========
# =============================================


def generate_activation_token(user_id: int, email: str) -> str:
    """
    Returns activation token
    """

    serializer = URLSafeTimedSerializer(settings.ACTIVATION_SECRET_KEY)

    data = {
        "user_id": user_id,
        "email": email
    }
    return serializer.dumps(data, salt="activation")


def check_activation_token(token: str) -> dict | None:
    """
    Checks if activation token is valid, returns dict with user_id and email
    """

    serializer = URLSafeTimedSerializer(settings.ACTIVATION_SECRET_KEY)
    try:
        # 1 hour
        return serializer.loads(token, salt="activation", max_age=60 * 60)
    except Exception:
        return None


# ============================================
# ==============  token utility  =============
# ============================================

def set_tokens(response: Response, refresh_token: str, csrf_token: str) -> None:
    """
    Sets refresh token in cookie and csrf token in header of response
    """

    response.set_cookie(
        key="refresh_token",
        value=refresh_token,
        httponly=True,
        secure=True,     # True in production
        samesite="none",
        max_age=60 * 60 * 24 * settings.REFRESH_TOKEN_EXPIRE
    )

    response.headers["X-CSRF-Token"] = csrf_token
```

In questo file ho racchiuso tutte le funzioni utilizzate per la sicurezza dell'intera applicazione, più una funzione per impostare i cookie in modo centralizzato, facile da cambiare quando è il momento di deployare.


### Rate limiting con `slowapi`

Uso `slowapi` per limitare gli endpoint sensibili (login, registrazione). Un dettaglio tecnico su cui mi sono scontrato: la struttura composita della storage key e come esporre `Retry-After` / `unlock_at` nella risposta 429, in modo che il frontend sappia esattamente quando ritentare.

```python
# app/core/limiter.py
from slowapi import Limiter
from fastapi.responses import JSONResponse
from slowapi.util import get_remote_address
from datetime import datetime, timezone
import time
from app.schemas.limiter import RateLimitError

limiter = Limiter(key_func=get_remote_address)


async def custom_rate_limit_handler(request, exc):
    """
    Custom rate limit handler returns 429 status code with reset time
    """

    limit_item, key_parts = request.state.view_rate_limit

    # reset timer + remaining attempts as a tuple
    reset_time, _ = request.app.state.limiter.limiter.get_window_stats(
        limit_item, *key_parts)

    # convert timestamp to datetime
    unlock_at = datetime.fromtimestamp(reset_time, tz=timezone.utc)

    payload = RateLimitError(
        error="Too many requests. Try again later.",
        unlock_at=unlock_at
    )

    return JSONResponse(
        status_code=429,
        content=payload.model_dump(mode="json"),
        headers={
            # str of max value (0 or any int value)
            # handling negative values from response
            "Retry-After": str(max(0, int(reset_time - time.time())))
        }
    )
```

Qui ho dovuto gestire un errore sovrascrivendo la risposta che arrivava dalla libreria stessa. Dal momento che volevo modificare l'interfaccia in modo appropiato quando l'utente riceve un blocco momentaneo, ho dovuto esporre il retry-after insieme al timestamp effettivo per poter calcolare il tempo rimanente.
A livello di interfaccia vengono disattivati i vari button di submit e mostrato un timer di tempo mancante, il tutto per far capire all'utente cosa sta succedendo.

Ho imparato nell'ultimo corso quando ho trattato la logica del frontend con js, ts, React l'importanza di rispecchiare a pieno lo stato del server non lasciare mai l'utente sospeso, in nessun caso.

---

## 12. Modelli e relazioni

Il modello `User` ha i campi base (username, email, password hash, `is_active`). Il `Profile` è collegato a `User` e contiene campi come avatar, background, statistiche. Le amicizie vivono in una tabella `Friendship` separata, con un `CheckConstraint` per impedire che un utente possa mandare una richiesta di amicizia a se stesso.

```python
# app/models/user.py

from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import String, ForeignKey, DateTime, func, UniqueConstraint, CheckConstraint, Integer
from sqlalchemy.orm import Mapped, mapped_column, relationship
from datetime import datetime
from app.models.game import ExtremeGame

from app.db.database import Base

if TYPE_CHECKING:
    from app.models.game import ExtremeGame


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # unique + index
    username: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    email: Mapped[str] = mapped_column(String(100), unique=True, index=True)

    hashed_password: Mapped[str] = mapped_column(String(256))
    is_active: Mapped[bool] = mapped_column(default=False)

    # ONE TO ONE relationship with Profile table
    profile: Mapped["Profile"] = relationship(
        "Profile", back_populates="user", uselist=False)

    # ONE TO MANY relationship with Friendship table
    friendships: Mapped[list["Friendship"]] = relationship(
        "Friendship", foreign_keys="Friendship.requester_id",
        back_populates="requester")

    friend_requests_received: Mapped[list["Friendship"]] = relationship(
        "Friendship", foreign_keys="Friendship.receiver_id",
        back_populates="receiver")

    # ONE TO ONE relationship with ExtremeGame table
    extreme_game: Mapped["ExtremeGame"] = relationship(
        "ExtremeGame", back_populates="user", uselist=False)


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # foreign key to user id
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True, unique=True)

    avatar: Mapped[str] = mapped_column(
        String(256), nullable=False, default="https://ddragon.leagueoflegends.com/cdn/16.13.1/img/champion/Aatrox.png")

    background: Mapped[str] = mapped_column(
        String(256), nullable=False, default="https://ddragon.leagueoflegends.com/cdn/img/champion/splash/Aatrox_0.jpg"
    )

    extreme_game_record: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0)

    # last seen at default on create
    last_seen_at: Mapped[datetime] = mapped_column(
        DateTime, server_default=func.now())

    # ONE TO ONE relationship with User table
    user: Mapped["User"] = relationship("User", back_populates="profile")


class Friendship(Base):
    __tablename__ = "friendships"

    __table_args__ = (
        # unique constraint requester > receiver to avoid spam friend requests on the same user
        UniqueConstraint("requester_id", "receiver_id",
                         name="unique_friendship"),

        # check constraint to avoid sending a friend request to yourself
        CheckConstraint("requester_id != receiver_id", name="different_users"),
    )

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)

    # foreign key to user id (requester)
    # CASCADE deletes the friendship if the user is deleted
    requester_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"))

    # foreign key to user id (receiver)
    # CASCADE deletes the friendship if the user is deleted
    receiver_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"))

    # status of the friendship request
    # default to pending (other states: accepted, rejected)
    # server default and not default to give default value directly in db
    status: Mapped[str] = mapped_column(
        String(20), server_default="pending", nullable=False)

    # relationship to User table MANY TO ONE
    requester: Mapped["User"] = relationship(
        "User", foreign_keys=[requester_id], back_populates="friendships")

    # relationship to User table MANY TO ONE
    receiver: Mapped["User"] = relationship(
        "User", foreign_keys=[receiver_id], back_populates="friend_requests_received")
```

---

## 13. Script di supporto e dati esterni

Il progetto non è solo API: una parte alimenta la wiki con dati reali presi dalle API di Riot Games.

- `scripts/riot_api.py` — scarica e normalizza i dati dei campioni;
- `scripts/validate_data.py` — controlla che gli URL delle immagini siano validi;
- `scripts/extract_and_validate.py` — orchestratore dell'intero flusso.

Sono dati prevalentemente statici, quindi all'occorrenza eseguo nuovamente gli script e automaticamente tutto è aggiornato in tempo reale. Anche qui ho pensato bene all'efficienza se pur gli script vengono eseguiti raramente, ad esempio utilizzare una sessioni di richieste, estrarre solo i dati che poi realmente utilizzo ed esportarli in un json locale per migliorare efficienza. Questa necessità è nata dal fatto che la modalità di gioco prevede l'utilizzo costante di questi dati ed è a tempo, quindi devo garantire la minor perdita di tempo possibile da parte del server per gestire l'intero flusso.


Leggere un file locale è decisamente più rapido che prendere dati da un API per poi mostrarli, inoltre qualora queste API avessero dei problemi, la mia applicazione risulta comunque autonoma.


```python
from pathlib import Path
import json
from typing import Any
from functools import lru_cache
from re import sub, escape

FILE_PATH = Path(__file__).parent.parent.parent / \
    "shared" / "data" / "en_US.json"


# caching in memory when function is called for the first time
@lru_cache(maxsize=1)
def get_data() -> list[dict[str, Any]]:
    """
    Returns data of champions.
    """

    with open(FILE_PATH, "r", encoding="utf-8") as file:
        return json.load(file)


@lru_cache(maxsize=1)
def get_choices() -> list[str]:
    """
    Returns list of choices, where each choice is in formatted string like:

    "champion_id_champion_name_ability_id"

    ["Aatrox_Aatrox_passive", "Aatrox_Aatrox_q", "Nunu_Nunu & Willump_e"]
    """

    return [f"{champ["id"]}_{champ["name"]}_{spell["id"]}" for champ in get_data() for spell in champ["spells"]]


# exceptions
CHAMPION_NAME_OVERRIDE = {
    "JarvanIV": ["Jarvan IV", "Jarvan"],
    "Nunu": ["Nunu & Willump", "Nunu e Willump", "Willump", "Nunu"],
    "Renata": ["Renata Glasc", "Renata"],
    "Smolder": ["Smolders", "Smolder"],
    "KogMaw": ["Kog'Maw", "KogMaw", "Kogmaw"],
}


def get_censored_ability(champion_id: str, champion_name: str, ability_description: str) -> str:
    """
    Return censored ability.

    Example

    "Lucian quickly dashes a short distance."

    Returns

    "??? quickly dashes a short distance."
    """

    censored = ability_description

    # exception found
    if champion_id in CHAMPION_NAME_OVERRIDE:
        for name in CHAMPION_NAME_OVERRIDE[champion_id]:
            censored = sub(r"\b" + escape(name) + r"\b", "??????", censored)

    else:
        censored = sub(r"\b" + escape(champion_name) +
                       r"\b", "??????", censored)

    return censored


@lru_cache(maxsize=1)
def format_champions_data() -> dict[str, dict[str, Any]]:
    """
    Return formatted dict of champions data, also spells formatted as a dict

    champion_id: {

        "abilities": {

            "ability_id": {
                "name": ...,
                "description": ...
            },
            ...
        },
        ...
    }
    """

    champions_data = {}

    for champ in get_data():
        champ_copy = dict(champ)
        champ_copy["spells"] = {spell["id"]: spell for spell in champ["spells"]}

        champions_data[champ["id"]] = champ_copy

    return champions_data
```

Ho inoltre cachato i vari valori estratti dal file, in modo che siano effettivamente caricati solo la prima volta, migliorando ulteriormente l'efficienza globale del server.


---

## 14. Il frontend: perché React + TypeScript + Vite + Tailwind

Sul frontend arrivavo da JavaScript vanilla e basi di React. Le scelte fatte in questo progetto:

- **React** per costruire un'interfaccia a componenti che consuma le API in modo dichiarativo;
- **TypeScript** per avere errori di tipo a compile-time invece che scoprirli a runtime — importante soprattutto quando la forma delle risposte API cambia (essendo il progetto interamente personale ho avuto anche possibilità di associare il contratto typescript esattamente con il response_model pydantic);
- **Vite** come build tool, per un dev server veloce con hot module replacement;
- **Tailwind CSS** per lo styling utility-first, senza dover gestire fogli CSS separati per ogni componente;
- **react-router** per il routing lato client;
- **axios** per le chiamate HTTP, con la possibilità di configurare interceptors globali (fondamentale per il refresh automatico del token).
- **react-icons** per l'integrazione di icone, già impostate come componenti React.
- **toastify** per mostrare messaggi con un toast (es. login avvenuto con successo).
- **swiper** per implementare un carosello evitando di scrivere interamente la logica.

### Struttura reale delle cartelle

La separazione, nomi a parte è la medesima applicata al backend.

---

## 15. Gestione dello stato di autenticazione: `AuthProvider`

Uso la **Context API** con `useReducer` per lo stato globale di autenticazione (utente corrente, access token). L'ho preferito a `useState` sparso perché con `useReducer` le transizioni di stato (login riuscito, logout, refresh del token, errore di autenticazione) sono azioni esplicite e centralizzate in un reducer, invece di aggiornamenti sparsi in più `setState`.

```tsx
// src/context/auth.provider.tsx
import { useEffect, useReducer, type JSX, type ReactNode } from "react";
import type { AuthState, AuthAction } from "../types/auth";
import { AuthContext } from "./auth.context";
import { refreshTokenRequest } from "../services/auth";
import Spinner from "../components/spinner";
import { authActionsRef, authRef } from "../apis/interceptors";

const initialState: AuthState = {
  user: null,
  accessToken: null,
  csrfToken: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "LOGIN":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        csrfToken: action.payload.csrfToken,
        isAuthenticated: true,
        isLoading: false,
      };

    case "LOGOUT":
      return {
        ...initialState,
        isLoading: false,
      };
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };

    case "REFRESH_TOKEN":
      return {
        ...state,
        accessToken: action.payload.accessToken,
        csrfToken: action.payload.csrfToken,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
      };

    case "UPDATE_USER":
      if (!state.user) return state;
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };

    default:
      return state;
  }
}

export function AuthProvider({
  children,
}: {
  children: ReactNode;
}): JSX.Element {
  const [state, dispatch] = useReducer(authReducer, initialState);

  useEffect(() => {
    authRef.current = {
      accessToken: state.accessToken,
      csrfToken: state.csrfToken,
    };
  }, [state.accessToken, state.csrfToken]);

  useEffect(() => {
    authActionsRef.current = {
      refreshToken: (accessToken, csrfToken, user) =>
        dispatch({
          type: "REFRESH_TOKEN",
          payload: { accessToken, csrfToken, user },
        }),
      logout: () => dispatch({ type: "LOGOUT" }),
    };
  }, []);

  useEffect(() => {
    const checkExistingSession = async () => {
      try {
        const response = await refreshTokenRequest();

        dispatch({
          type: "REFRESH_TOKEN",
          payload: {
            accessToken: response.access_token,
            csrfToken: response.csrf_token,
            user: response.user,
          },
        });
      } catch {
        dispatch({ type: "LOGOUT" });
      }
    };

    checkExistingSession();
  }, []);

  return (
    <AuthContext.Provider value={{ state, dispatch }}>
      {state.isLoading ? <Spinner /> : children}
    </AuthContext.Provider>
  );
}
```

### Custom hooks

Ho un hook per dominio, che incapsula la chiamata API più lo stato locale (loading, error, dati):

| Hook | Cosa ritorna | Responsabilità principale |
|---|---|---|
| `useAuth` | `user`, `accessToken`, `isAuthenticated`, `isLoading`, `dispatch` | Espone lo stato di `AuthProvider` (via Context) a qualsiasi componente, senza prop-drilling |
| `useChampions` | `champions`, `loading`, `error` | Fetch dei dati della wiki, con cache in `sessionStorage` a scadenza (vedi sotto) |
| `useCooldown` | `secondsLeft`, `isActive` | Timer/cooldown riutilizzabile, es. per bloccare il submit dopo un rate limit (429) fino a `unlock_at` |
| `useFriendlist` | `friendships`, `loading`, `error`, `sendRequest`, `respondToRequest`, `removeFriendship`, `refetch` | Gestisce la lista amicizie; aggiorna lo stato **localmente** dopo un'azione invece di rifare fetch; aspetta `isLoading` di `useAuth()` prima della fetch iniziale |

Tutto questo mi ha permesso di centralizzare e avare disponibile localmente nel client i vari dati aggiornati in tempo reale, anche tra le varie pagine e le varie componenti, evitando mandare ripetutamente richieste al server, lasciando questa opzione solo in caso di perdita di stato del client.

### Caching in `sessionStorage` con scadenza

I dati dei campioni (che cambiano raramente) li tengo in cache in `sessionStorage` con un timestamp. Al momento della fetch controllo se il timestamp è ancora "fresco"; se sì, uso la cache, altrimenti rifaccio la richiesta e aggiorno timestamp e valore.

Garantisce efficienza dei dati mentre la tab del browser è aperta, caricandoli all'occorrenza direttamente dalla sessione.

---

## 16. Axios: interceptors e refresh automatico del token

Ho configurato Axios per:

- allegare automaticamente l'access token a ogni richiesta;
- allegare il CSRF token nell'header `X-CSRF-Token`;
- intercettare le risposte 401 e tentare un refresh automatico dell'access token, per poi ripetere la richiesta originale.

Il dettaglio tecnico a cui ho dovuto prestare attenzione: gli interceptor sono registrati una volta sola (in un `useEffect`), ma devono sempre leggere il **valore aggiornato** del token, non quello "congelato" al momento della registrazione. Per questo uso un `useRef` che tengo sincronizzato con il token corrente, invece di fare riferimento diretto alla variabile di stato dentro l'interceptor — altrimenti l'interceptor chiuderebbe su un valore stale e rischierei un loop infinito di refresh falliti.

```typescript
// src/apis/interceptors.ts
import { api } from "./axios";
import { refreshTokenRequest } from "../services/auth";
import type { User } from "../types/auth";

type AuthSnapshot = {
  accessToken: string | null;
  csrfToken: string | null;
};

type AuthActions = {
  refreshToken: (accessToken: string, csrfToken: string, user: User) => void;
  logout: () => void;
};

// change out of React life cycle
// updated in AuthProvider during the render
export const authRef: { current: AuthSnapshot } = {
  current: { accessToken: null, csrfToken: null },
};

export const authActionsRef: { current: AuthActions } = {
  current: {
    refreshToken: () => {},
    logout: () => {},
  },
};

api.interceptors.request.use((config) => {
  if (authRef.current.accessToken) {
    config.headers.Authorization = `Bearer ${authRef.current.accessToken}`;
  }
  if (authRef.current.csrfToken && !config.headers["x-csrf-token"]) {
    config.headers["x-csrf-token"] = authRef.current.csrfToken;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url.includes("/auth/refresh-token") &&
      !originalRequest.url.includes("/auth/login")
    ) {
      originalRequest._retry = true;

      try {
        const response = await refreshTokenRequest();
        const newAccessToken = response.access_token;
        const newCsrfToken = response.csrf_token;

        authActionsRef.current.refreshToken(
          newAccessToken,
          newCsrfToken,
          response.user,
        );

        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        originalRequest.headers["x-csrf-token"] = newCsrfToken;

        return api(originalRequest);
      } catch {
        authActionsRef.current.logout();
        window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  },
);
```

Il problema nasceva dal fatto che gli interceptors venivano creati ad ogni render, creando un loop infinito aggiungendone ogni volta uno nuovo. 

La soluzione finale è stata racchiudere l'impostazione degli interceptors nel modulo stesso, chiamandoli una sola volta. Tuttavia rimane un altro problema, la funzioni catturava direttamente l'accessToken, quindi il valore di questa variabile al momento in cui viene caricato l'interceptors, che inizialmente è di tipo null, prova a recuperarlo ma ancora una volta la cosa si ripete, generando un loop infinito.

Qui entra in gioco l'hook di react useRef, il quale rimane il medesimo finchè il componente non viene smontato.

A sua volta il valore del token viene racchiuso in un useEffect che viene triggerato dal cambiamento dei token, aggiornando in modo corretto il valore una e una sola volta finchè non cambia nuovamente.

```tsx
useEffect(() => {
  authRef.current = {
    accessToken: state.accessToken,
    csrfToken: state.csrfToken,
  };
}, [state.accessToken, state.csrfToken]);
```

Questo avviene nel context, che gestisce globalmente lo stato di autenticazione dell'utente, rendendolo disponibile ovunque nel progetto senza infiniti prop drilling.

L'idea è quindi quella di prendere ciò che associa il valore e non il valore stessso, rompendo quindi il loop.

---

## 17. Routing e protezione delle pagine private

Per proteggere le rotte private uso `<Navigate />` in un componente `ProtectedRoute` che avvolge le pagine che richiedono autenticazione: se `useAuth()` dice che l'utente non è autenticato, il componente **durante il render** restituisce `<Navigate to="/login" />` invece dei children.

Per i redirect innescati da un evento (es. dopo un login riuscito, o dopo un submit) uso invece `useNavigate()`, perché in quel caso il redirect è una conseguenza di un'azione dell'utente, non una decisione presa durante il render.

```tsx
// src/components/security/protected-route.tsx
import type { JSX } from "react";
import { useAuth } from "../../hooks/auth";
import SpinnerPage from "../../utils/spinner-page";
import { Navigate, Outlet, useLocation } from "react-router";

export function ProtectedRoute(): JSX.Element {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) return <SpinnerPage />;
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  return <Outlet />;  // garantisce rendering dei children se presenti
}
```

Questa componente è usata per *wrappare* le varie pagine evitando di mostrare il contenuto della pagina qualora l'utente non fosse autorizzato a vederla, evitando glitch strani dell'interfaccia e portando l'utente alla realtiva schermata di login, subito dopo viene indirizzato correttamente alla pagina che voleva visitare precedentemente.


Per chiudere la sezione di react è importante citare gli hook principali che ho utilizzato e la loro reale funzione:

| Hook | Utilizzo | Conseguenza |
| :---: | :--- | :--- | 
| useState | Stato locale di un componente | re-render totale cambiando solo lo state |
| useEffect | Effetti collaterali legati al ciclo di vita del componente | triggerato dalle dipendenze oppure una sola volta on mount con array vuoto | 
| useRef | Contenitore mutabile che mantiene il valore al re-render | permette il cambio del valore senza causare re-render |
| useCallback | Memorizza una funzione tra i re-render | evita che la funzione venga ricreata ogni volta |  
| useMemo | Memorizza il risultato di un calcolo costoso | evita di rieseguirlo ad ogni re-render | 

---

## 18. Styling con Tailwind

```css
@theme {
  --color-lol-bg: #0a0e13;
  --color-lol-card: #161d27; /* #111720 */
  --color-lol-gold: #c89b3c;
  --color-lol-gold-light: #f0c960;
  --color-lol-text: #d6d1c7;
  --color-lol-text-muted: #a0917a;
  --font-exo: "Exo 2", sans-serif;
  --font-cinzel: "Cinzel", serif;
  --color-lol-blue: #0a1628d9;
  --color-lol-blue-light: #0d1f3bd9;
}
```

Nel file globale del css ho creato una palette personalizzata apposita per questo progetto, in questo modo tramite classi di tailwind era accessibile, permettendomi di personalizzare l'interfaccia a mio piacimento e con estrema versatilità, volendo un domani cambiare colore di sfondo, mi basterebbe cambiarlo in un solo file.


Ho inoltre creato delle classi custom che applicano un insieme di stili per garantire coerenza per tutta l'applicazione, sia oggi, sia un domani se il progetto cresce ancora.


```css

@layer components {
  .flex-center {
    @apply flex items-center justify-center;
  }

  .role-banner {
    @apply py-0.5 px-2 text-[12px] rounded-md font-bold border w-20;
  }

  .marksman {
    @apply bg-amber-950/80 text-amber-400 border-amber-400;
    box-shadow: 0 0 2px 1px rgb(251, 191, 36);
  }

  .assassin {
    @apply bg-purple-950/80 text-purple-400 border-purple-400;
    box-shadow: 0 0 2px 1px rgb(192, 132, 252);
  }

  .support {
    @apply bg-emerald-950/80 text-emerald-400 border-emerald-400;
    box-shadow: 0 0 2px 1px rgb(52, 211, 153);
  }

  .mage {
    @apply bg-cyan-950/80 text-cyan-400 border-cyan-400;
    box-shadow: 0 0 2px 1px rgb(34, 211, 238);
  }

  .fighter {
    @apply bg-red-950/80 text-red-400 border-red-400;
    box-shadow: 0 0 2px 1px rgb(248, 113, 113);
  }

  .tank {
    @apply bg-blue-950/80 text-blue-400 border-blue-400;
    box-shadow: 0 0 2px 1px rgb(96, 165, 250);
  }

  .form-container {
    @apply mt-2 py-3 px-7 bg-lol-blue border-lol-blue-light border rounded-lg flex flex-col items-center justify-center gap-2 w-full;
  }

  .form-input {
    @apply bg-lol-card text-lol-text ring ring-lol-blue-light rounded-md p-3 w-full focus:ring-2 focus:ring-emerald-400 placeholder:italic placeholder:text-lol-text/40 outline-none;
  }

  .form-label {
    @apply text-lol-text-muted font-semibold;
  }

  .btn {
    @apply text-lol-bg bg-emerald-600 hover:bg-emerald-300 cursor-pointer transition-colors duration-200 ease-in;
  }

  .alert {
    @apply flex items-center justify-between gap-3 border p-3 rounded-lg w-full;
  }

  .details-wrapper {
    @apply bg-lol-blue w-[95vw] mx-auto border-3 rounded-md border-lol-blue-light mt-5 md:mt-15 p-5 xl:p-10 flex flex-col items-center gap-2 xl:gap-10;
  }

  .details-title {
    @apply font-bold text-2xl xl:text-4xl text-lol-gold flex gap-1 items-center;
  }

  .glass-panel {
    @apply bg-lol-blue/80 backdrop-blur-md border-3 border-lol-blue-light rounded-xl;
  }

  .friendship-span {
    @apply text-sm md:text-base lg:text-xl bg-lol-bg border border-lol-text-muted z-50 cursor-pointer px-3 py-1 flex justify-center items-center gap-2 rounded-md ml-auto w-fit;
  }

  .leaderboard-badge {
    @apply inline-flex items-center justify-center w-8 h-8 rounded-full bg-linear-to-br;
  }
}
```

---

## 19. Deploy

Target previsto: **FastAPI Cloud** per il backend, **Vercel** per il frontend. Docker resta un percorso di apprendimento separato, non un blocco per il deploy attuale.

Avendo dovuto cambiare alcune impostazioni e dovendo configurare tutto il database, migrando a postgres in produzione, nel prossimo progetto ho l'obiettivo di studiare e apprendere come Docker risolve questi problemi.


```bash
# In sviluppo
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# In produzione (stessa struttura, senza --reload)
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

---

## 20. Come avviare il progetto da zero

### Backend

```bash
# assicurati che il .env sia presente prima di questo passo 
# la struttura è visualizzabile nel .env.example
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn app.main:app --reload
```

### Frontend

```bash
# assicurati che il .env sia presente prima di questo passo 
# la struttura è visualizzabile nel .env.example
cd frontend
npm install
npm run dev
```

