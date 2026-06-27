docker-up:
	docker compose up -d

docker-down:
	docker compose down

docker-reset:
	docker compose down -v
	docker compose up -d

db-generate:
	pnpm db:generate

db-migrate:
	pnpm db:migrate

db-push:
	pnpm db:push

db-studio:
	pnpm db:studio

db-check:
	pnpm db:check
