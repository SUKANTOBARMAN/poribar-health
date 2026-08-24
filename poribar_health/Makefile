.PHONY: up down build logs shell migrate makemigration seed test

up:
	docker compose up -d

down:
	docker compose down

build:
	docker compose up -d --build

logs:
	docker compose logs -f api

shell:
	docker compose exec api bash

migrate:
	docker compose exec api alembic upgrade head

makemigration:
	docker compose exec api alembic revision --autogenerate -m "$(m)"

seed:
	docker compose exec api python scripts/seed.py

test:
	docker compose exec api pytest tests/ -v
