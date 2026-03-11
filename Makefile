# ─── Docker ─────────────────────────────────────────────────────────

db-up:             ## Start local Postgres via Docker
	docker compose up -d postgres

db-down:           ## Stop local Postgres
	docker compose down

db-local-setup:    ## Full local setup (start + migrate + seed)
	docker compose up -d postgres && sleep 2 && npx prisma migrate deploy && npx prisma db seed

# ─── Database ────────────────────────────────────────────────────────

db-reset:          ## Reset DB (drop + migrate + seed)
	npx prisma migrate reset

db-seed:           ## Run seed only
	npx prisma db seed

db-migrate:        ## Apply pending migrations
	npx prisma migrate deploy

db-new:            ## Create a new migration (usage: make db-new name=add_users)
	npx prisma migrate dev --name $(name)

db-status:         ## Show migration status
	npx prisma migrate status

db-studio:         ## Open Prisma Studio (visual DB browser)
	npx prisma studio

db-generate:       ## Regenerate Prisma Client
	npx prisma generate

db-push:           ## Push schema to DB without migration (dev only)
	npx prisma db push

# ─── Cleanup ────────────────────────────────────────────────────────

clerk-clear:       ## Delete all Clerk users (uses CLERK_SECRET_KEY from .env)
	@CLERK_KEY=$$(grep CLERK_SECRET_KEY .env | cut -d= -f2); \
	echo "Fetching Clerk users..."; \
	USER_IDS=$$(curl -sS -H "Authorization: Bearer $$CLERK_KEY" \
		"https://api.clerk.com/v1/users?limit=100" | \
		node -e "const d=require('fs').readFileSync('/dev/stdin','utf8'); \
		JSON.parse(d).forEach(u=>console.log(u.id))"); \
	if [ -z "$$USER_IDS" ]; then \
		echo "No Clerk users found."; \
	else \
		COUNT=$$(echo "$$USER_IDS" | wc -l | tr -d ' '); \
		echo "Deleting $$COUNT Clerk user(s)..."; \
		echo "$$USER_IDS" | while read -r uid; do \
			curl -sS -X DELETE -H "Authorization: Bearer $$CLERK_KEY" \
				"https://api.clerk.com/v1/users/$$uid" > /dev/null && \
				echo "  Deleted $$uid"; \
		done; \
		echo "Done."; \
	fi

nuke:              ## Reset DB + delete all Clerk users (full wipe)
	@echo "=== Wiping Clerk users ===" && $(MAKE) clerk-clear
	@echo "=== Resetting database ===" && npx prisma migrate reset --force

# ─── Dev ─────────────────────────────────────────────────────────────

dev:               ## Start dev server
	npm run start:dev

build:             ## Build for production
	npm run build

lint:              ## Lint and auto-fix
	npm run lint

test:              ## Run unit tests
	npm run test

test-watch:        ## Run tests in watch mode
	npm run test:watch

test-e2e:          ## Run e2e tests
	npm run test:e2e

# ─── Help ────────────────────────────────────────────────────────────

help:              ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

.DEFAULT_GOAL := help
.PHONY: db-up db-down db-local-setup db-reset db-seed db-migrate db-new db-status db-studio db-generate db-push clerk-clear nuke dev build lint test test-watch test-e2e help
