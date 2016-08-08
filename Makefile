.PHONY: help
.DEFAULT_GOAL := help

# These are example settings, you may want to change things here
export NODE_ENV=development
export HOST=0.0.0.0
export PORT=3000
export LOG_LEVEL=error
export JWT_SECRET=secret
export DEBUG=""

help:
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-30s\033[0m %s\n", $$1, $$2}'

install: ## Install project dependencies
	@npm install

run-dev: ## Run project in development mode
	@npm run dev