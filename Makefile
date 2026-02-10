all :
	docker compose up --build -d  

down :
	docker compose down -v

logs :
	docker compose logs -f

ps :
	docker compose ps

restart :
	docker compose restart

clean : down
	docker system prune -a --volumes -f

# Development commands (without Docker)
dev-chat:
	@echo "Starting Chat Backend and Frontend..."
	@powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd back-end/Chat; npm run start:dev'"
	@powershell -Command "Start-Process powershell -ArgumentList '-NoExit', '-Command', 'cd front-end; npm run dev'"
	@echo "Chat backend starting on http://localhost:3001"
	@echo "Chat frontend starting on http://localhost:5173"

dev-backend:
	cd back-end/Chat && npm run start:dev

dev-frontend:
	cd front-end && npm run dev
