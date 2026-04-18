all :
	docker compose up --build -d  

down :
	docker compose down

down -v:
	docker compose down -v

restart :
	docker compose restart

logs:
	docker compose logs -f

ps :
	docker compose ps

clean : down
	docker system prune -a --volumes -f

re : clean all
