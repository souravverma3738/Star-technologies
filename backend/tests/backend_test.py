"""Backend API tests for Star Technologies."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://business-hub-528.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "Admin@startechnologies.com"
ADMIN_PASSWORD = "Sourav0**"


@pytest.fixture(scope="session")
def s():
    sess = requests.Session()
    sess.headers.update({"Content-Type": "application/json"})
    return sess


@pytest.fixture(scope="session")
def token(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, r.text
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def auth_headers(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}


# Health
def test_health(s):
    r = s.get(f"{BASE_URL}/api/health")
    assert r.status_code == 200
    data = r.json()
    assert data["ok"] is True


# Contact - happy path
def test_contact_create_and_persist(s, auth_headers):
    payload = {
        "name": "TEST_User",
        "email": f"test_{uuid.uuid4().hex[:8]}@example.com",
        "phone": "+447000000000",
        "subject": "TEST subject",
        "message": "TEST_message body",
    }
    r = s.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 200, r.text
    body = r.json()
    assert body["success"] is True
    assert "id" in body
    assert body["email_delivered"] is False  # expected (no resend key)
    msg_id = body["id"]

    # Verify persisted via admin endpoint
    r2 = requests.get(f"{BASE_URL}/api/admin/messages", headers=auth_headers)
    assert r2.status_code == 200
    ids = [m["id"] for m in r2.json()]
    assert msg_id in ids


# Contact validation
def test_contact_missing_fields(s):
    r = s.post(f"{BASE_URL}/api/contact", json={"email": "a@b.com"})
    assert r.status_code == 422


def test_contact_bad_email(s):
    r = s.post(f"{BASE_URL}/api/contact", json={"name": "x", "email": "not-an-email", "message": "hi"})
    assert r.status_code == 422


# Auth login
def test_login_success(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200
    data = r.json()
    assert "access_token" in data and isinstance(data["access_token"], str)
    assert data["admin"]["email"] == ADMIN_EMAIL.lower()


def test_login_wrong_password(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong"})
    assert r.status_code == 401


def test_login_unknown_user(s):
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": "noone@example.com", "password": "x"})
    assert r.status_code == 401


# /auth/me
def test_me_with_token(auth_headers):
    r = requests.get(f"{BASE_URL}/api/auth/me", headers=auth_headers)
    assert r.status_code == 200
    assert r.json()["email"] == ADMIN_EMAIL.lower()


def test_me_without_token():
    r = requests.get(f"{BASE_URL}/api/auth/me")
    assert r.status_code == 401


# Admin endpoints unauth
def test_admin_messages_unauth():
    assert requests.get(f"{BASE_URL}/api/admin/messages").status_code == 401


def test_admin_stats_unauth():
    assert requests.get(f"{BASE_URL}/api/admin/stats").status_code == 401


def test_admin_patch_unauth():
    assert requests.patch(f"{BASE_URL}/api/admin/messages/x", json={"status": "read"}).status_code == 401


def test_admin_delete_unauth():
    assert requests.delete(f"{BASE_URL}/api/admin/messages/x").status_code == 401


# Stats
def test_stats(auth_headers):
    r = requests.get(f"{BASE_URL}/api/admin/stats", headers=auth_headers)
    assert r.status_code == 200
    d = r.json()
    for k in ("total", "new", "replied"):
        assert k in d and isinstance(d[k], int)


# Patch + Delete flow
def test_patch_and_delete_flow(s, auth_headers):
    # Create a message
    payload = {"name": "TEST_PD", "email": "test_pd@example.com", "message": "delete me"}
    r = s.post(f"{BASE_URL}/api/contact", json=payload)
    assert r.status_code == 200
    msg_id = r.json()["id"]

    # patch read
    r1 = requests.patch(f"{BASE_URL}/api/admin/messages/{msg_id}", json={"status": "read"}, headers=auth_headers)
    assert r1.status_code == 200

    # patch replied
    r2 = requests.patch(f"{BASE_URL}/api/admin/messages/{msg_id}", json={"status": "replied"}, headers=auth_headers)
    assert r2.status_code == 200

    # invalid status -> 400
    r3 = requests.patch(f"{BASE_URL}/api/admin/messages/{msg_id}", json={"status": "bogus"}, headers=auth_headers)
    assert r3.status_code == 400

    # patch on missing id -> 404
    r4 = requests.patch(f"{BASE_URL}/api/admin/messages/{uuid.uuid4()}", json={"status": "read"}, headers=auth_headers)
    assert r4.status_code == 404

    # delete works
    r5 = requests.delete(f"{BASE_URL}/api/admin/messages/{msg_id}", headers=auth_headers)
    assert r5.status_code == 200

    # delete again -> 404
    r6 = requests.delete(f"{BASE_URL}/api/admin/messages/{msg_id}", headers=auth_headers)
    assert r6.status_code == 404
