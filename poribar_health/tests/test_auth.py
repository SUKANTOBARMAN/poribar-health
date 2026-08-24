"""
রান করার নিয়ম:
    docker compose exec api pytest tests/ -v
(sqlite in-memory ব্যবহার করে, তোমার dev MySQL DB touch করবে না)
"""

import os

os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["SECRET_KEY"] = "test-secret-key"
os.environ["ENCRYPTION_KEY"] = "5GnDAkTcu3okd1ssWmOraQGDFwRU0cWCz5tFZjisJuw="

import pytest
from fastapi.testclient import TestClient

import app.models  # noqa: F401  populate Base.metadata
from app.database import Base, engine
from app.main import app


@pytest.fixture(scope="module", autouse=True)
def setup_db():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)
    if os.path.exists("./test.db"):
        os.remove("./test.db")


client = TestClient(app)


def test_register_user():
    r = client.post(
        "/api/v1/auth/register",
        json={"name": "Test User", "phone": "01711111111", "password": "password123"},
    )
    assert r.status_code == 201
    assert r.json()["status"] == "active"
    assert "user" in r.json()["roles"]


def test_duplicate_phone_rejected():
    client.post(
        "/api/v1/auth/register",
        json={"name": "Dup", "phone": "01799999999", "password": "password123"},
    )
    r = client.post(
        "/api/v1/auth/register",
        json={"name": "Dup2", "phone": "01799999999", "password": "password123"},
    )
    assert r.status_code == 400


def test_login_and_me():
    client.post(
        "/api/v1/auth/register",
        json={"name": "Login Test", "phone": "01755555555", "password": "password123"},
    )
    r = client.post(
        "/api/v1/auth/login",
        data={"username": "01755555555", "password": "password123"},
    )
    assert r.status_code == 200
    token = r.json()["access_token"]

    r = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert r.status_code == 200
    assert r.json()["phone"] == "01755555555"


def test_volunteer_register_is_pending():
    r = client.post(
        "/api/v1/auth/volunteer/register",
        json={
            "name": "Vol Test", "phone": "01766666666", "password": "password123",
            "student_id_no": "S100", "institution_id": 1, "semester": "5th",
            "service_upazila_id": 1, "nid": "1234567890123",
        },
    )
    assert r.status_code == 201
    assert r.json()["status"] == "pending"
