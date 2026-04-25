from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / ".env")

import os
import uuid
import logging
import asyncio
from datetime import datetime, timezone, timedelta
from typing import List, Optional

import bcrypt
import jwt
import resend
from fastapi import FastAPI, APIRouter, HTTPException, Depends, Request, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, EmailStr, Field

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
MONGO_URL = os.environ["MONGO_URL"]
DB_NAME = os.environ["DB_NAME"]
JWT_SECRET = os.environ["JWT_SECRET"]
JWT_ALGORITHM = "HS256"
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@startechnologies.com")
ADMIN_PASSWORD = os.environ.get("ADMIN_PASSWORD", "changeme")
ADMIN_NOTIFY_EMAIL = os.environ.get("ADMIN_NOTIFY_EMAIL", ADMIN_EMAIL)
RESEND_API_KEY = os.environ.get("RESEND_API_KEY", "").strip()
SENDER_EMAIL = os.environ.get("SENDER_EMAIL", "onboarding@resend.dev")
SENDER_NAME = os.environ.get("SENDER_NAME", "Star Technologies")

if RESEND_API_KEY:
    resend.api_key = RESEND_API_KEY

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# ---------------------------------------------------------------------------
# DB
# ---------------------------------------------------------------------------
client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

# ---------------------------------------------------------------------------
# App + Router
# ---------------------------------------------------------------------------
app = FastAPI(title="Star Technologies API")
api_router = APIRouter(prefix="/api")
security = HTTPBearer(auto_error=False)


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(hours=12),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_admin(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
) -> dict:
    if not credentials or not credentials.credentials:
        raise HTTPException(status_code=401, detail="Not authenticated")
    token = credentials.credentials
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    user = await db.admins.find_one({"id": payload.get("sub")}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    return user


# ---------------------------------------------------------------------------
# Email helpers (Resend)
# ---------------------------------------------------------------------------
def _send_email_sync(to: str, subject: str, html: str) -> Optional[str]:
    if not RESEND_API_KEY:
        logger.warning("RESEND_API_KEY missing — skipping email to %s", to)
        return None
    params = {
        "from": f"{SENDER_NAME} <{SENDER_EMAIL}>",
        "to": [to],
        "subject": subject,
        "html": html,
    }
    try:
        result = resend.Emails.send(params)
        return (result or {}).get("id")
    except Exception as e:
        logger.error("Resend send error to %s: %s", to, e)
        return None


async def send_email(to: str, subject: str, html: str) -> Optional[str]:
    return await asyncio.to_thread(_send_email_sync, to, subject, html)


def admin_notification_html(name: str, email: str, phone: str, subject: str, message: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f7f9fc;padding:24px;">
      <tr><td>
        <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6eaf2;">
          <tr><td style="background:linear-gradient(135deg,#0a1d4a,#1e6bff);padding:24px;color:#ffffff;">
            <h2 style="margin:0;font-size:20px;">New contact form submission</h2>
            <p style="margin:6px 0 0 0;font-size:13px;opacity:.85;">Star Technologies website</p>
          </td></tr>
          <tr><td style="padding:24px;color:#0a1d4a;">
            <p style="margin:0 0 16px 0;"><strong>From:</strong> {name} &lt;{email}&gt;</p>
            <p style="margin:0 0 16px 0;"><strong>Phone:</strong> {phone or '—'}</p>
            <p style="margin:0 0 16px 0;"><strong>Subject:</strong> {subject or '—'}</p>
            <div style="background:#f3f6fc;border-left:4px solid #1e6bff;padding:14px 16px;border-radius:8px;color:#1f2937;white-space:pre-wrap;">{message}</div>
          </td></tr>
          <tr><td style="padding:16px 24px;background:#f7f9fc;color:#64748b;font-size:12px;">
            Sent via startechnologies.com contact form
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


def customer_confirmation_html(name: str) -> str:
    return f"""
    <table width="100%" cellpadding="0" cellspacing="0" style="font-family:Arial,sans-serif;background:#f7f9fc;padding:24px;">
      <tr><td>
        <table align="center" width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e6eaf2;">
          <tr><td style="background:linear-gradient(135deg,#0a1d4a,#1e6bff);padding:28px;color:#ffffff;text-align:center;">
            <h1 style="margin:0;font-size:22px;letter-spacing:.4px;">Star Technologies</h1>
            <p style="margin:6px 0 0 0;font-size:13px;opacity:.85;">Solutions That Empower</p>
          </td></tr>
          <tr><td style="padding:28px;color:#0a1d4a;line-height:1.6;">
            <p style="margin:0 0 12px 0;font-size:16px;">Hi {name},</p>
            <p style="margin:0 0 12px 0;">Thanks for getting in touch with <strong>Star Technologies</strong>. We've received your message and a member of our team will reply within <strong>24 hours</strong>.</p>
            <p style="margin:0 0 12px 0;">In the meantime, feel free to reply to this email with any extra details about your project — budget, timeline, or features you have in mind.</p>
            <div style="margin:24px 0;padding:16px;background:#f3f6fc;border-radius:10px;border:1px solid #e6eaf2;">
              <p style="margin:0;font-size:13px;color:#475569;">Need urgent help? Call or WhatsApp us at <strong style="color:#0a1d4a;">+44 7824 047235</strong>.</p>
            </div>
            <p style="margin:0;color:#475569;">— The Star Technologies team</p>
          </td></tr>
          <tr><td style="padding:16px 24px;background:#0a1d4a;color:#9bb0d6;font-size:12px;text-align:center;">
            © {datetime.now().year} Star Technologies · Solutions That Empower
          </td></tr>
        </table>
      </td></tr>
    </table>
    """


# ---------------------------------------------------------------------------
# Models
# ---------------------------------------------------------------------------
class ContactCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    phone: Optional[str] = Field(default="", max_length=40)
    subject: Optional[str] = Field(default="", max_length=160)
    message: str = Field(min_length=1, max_length=4000)


class ContactMessage(BaseModel):
    id: str
    name: str
    email: EmailStr
    phone: str = ""
    subject: str = ""
    message: str
    status: str = "new"  # new | read | replied
    created_at: datetime
    admin_email_id: Optional[str] = None
    customer_email_id: Optional[str] = None


class ContactResponse(BaseModel):
    success: bool
    id: str
    message: str
    email_delivered: bool


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    admin: dict


class StatusUpdate(BaseModel):
    status: str  # new | read | replied


# ---------------------------------------------------------------------------
# Public Routes
# ---------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"service": "Star Technologies API", "ok": True}


@api_router.get("/health")
async def health():
    return {
        "ok": True,
        "email_configured": bool(RESEND_API_KEY),
        "time": datetime.now(timezone.utc).isoformat(),
    }


@api_router.post("/contact", response_model=ContactResponse)
async def submit_contact(payload: ContactCreate):
    msg_id = str(uuid.uuid4())
    now = datetime.now(timezone.utc)
    doc = {
        "id": msg_id,
        "name": payload.name.strip(),
        "email": payload.email.lower().strip(),
        "phone": (payload.phone or "").strip(),
        "subject": (payload.subject or "").strip(),
        "message": payload.message.strip(),
        "status": "new",
        "created_at": now.isoformat(),
        "admin_email_id": None,
        "customer_email_id": None,
    }

    # Fire emails (don't block DB write on failure)
    admin_id, cust_id = await asyncio.gather(
        send_email(
            ADMIN_NOTIFY_EMAIL,
            f"New enquiry from {doc['name']} — Star Technologies",
            admin_notification_html(doc["name"], doc["email"], doc["phone"], doc["subject"], doc["message"]),
        ),
        send_email(
            doc["email"],
            "We received your message — Star Technologies",
            customer_confirmation_html(doc["name"]),
        ),
    )

    doc["admin_email_id"] = admin_id
    doc["customer_email_id"] = cust_id

    await db.contact_messages.insert_one(doc)

    return ContactResponse(
        success=True,
        id=msg_id,
        message="Thanks — we'll be in touch within 24 hours.",
        email_delivered=bool(admin_id and cust_id),
    )


# ---------------------------------------------------------------------------
# Auth Routes
# ---------------------------------------------------------------------------
@api_router.post("/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    email = req.email.lower().strip()
    user = await db.admins.find_one({"email": email})
    if not user or not verify_password(req.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    token = create_access_token(user["id"], user["email"])
    admin_public = {"id": user["id"], "email": user["email"], "name": user.get("name", "Admin")}
    return LoginResponse(access_token=token, admin=admin_public)


@api_router.get("/auth/me")
async def me(current: dict = Depends(get_current_admin)):
    return current


# ---------------------------------------------------------------------------
# Admin Routes (protected)
# ---------------------------------------------------------------------------
@api_router.get("/admin/messages")
async def list_messages(_: dict = Depends(get_current_admin)):
    docs = await db.contact_messages.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return docs


@api_router.get("/admin/stats")
async def stats(_: dict = Depends(get_current_admin)):
    total = await db.contact_messages.count_documents({})
    new = await db.contact_messages.count_documents({"status": "new"})
    replied = await db.contact_messages.count_documents({"status": "replied"})
    return {"total": total, "new": new, "replied": replied}


@api_router.patch("/admin/messages/{msg_id}")
async def update_status(msg_id: str, body: StatusUpdate, _: dict = Depends(get_current_admin)):
    if body.status not in ("new", "read", "replied"):
        raise HTTPException(status_code=400, detail="Invalid status")
    res = await db.contact_messages.update_one({"id": msg_id}, {"$set": {"status": body.status}})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}


@api_router.delete("/admin/messages/{msg_id}")
async def delete_message(msg_id: str, _: dict = Depends(get_current_admin)):
    res = await db.contact_messages.delete_one({"id": msg_id})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Message not found")
    return {"ok": True}


# ---------------------------------------------------------------------------
# Startup
# ---------------------------------------------------------------------------
@app.on_event("startup")
async def on_startup():
    # Indexes
    await db.admins.create_index("email", unique=True)
    await db.contact_messages.create_index("created_at")
    await db.contact_messages.create_index("status")

    # Idempotent admin seed (case-insensitive lookup)
    existing = await db.admins.find_one({"email": ADMIN_EMAIL.lower()})
    target_hash = None
    if existing is None:
        await db.admins.insert_one(
            {
                "id": str(uuid.uuid4()),
                "email": ADMIN_EMAIL.lower(),
                "password_hash": hash_password(ADMIN_PASSWORD),
                "name": "Admin",
                "role": "admin",
                "created_at": datetime.now(timezone.utc).isoformat(),
            }
        )
        logger.info("Seeded admin %s", ADMIN_EMAIL)
    else:
        if not verify_password(ADMIN_PASSWORD, existing["password_hash"]):
            await db.admins.update_one(
                {"email": ADMIN_EMAIL.lower()},
                {"$set": {"password_hash": hash_password(ADMIN_PASSWORD)}},
            )
            logger.info("Updated admin password for %s", ADMIN_EMAIL)


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# ---------------------------------------------------------------------------
# CORS + mount
# ---------------------------------------------------------------------------
app.include_router(api_router)
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get("CORS_ORIGINS", "*").split(","),
    allow_methods=["*"],
    allow_headers=["*"],
)
