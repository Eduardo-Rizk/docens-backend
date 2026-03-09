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
.PHONY: db-reset db-seed db-migrate db-new db-status db-studio db-generate db-push dev build lint test test-watch test-e2e help
