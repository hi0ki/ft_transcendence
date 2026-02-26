all :
	docker compose up --build -d  

down :
	docker compose down 

logs :
	docker compose logs -f

ps :
	docker compose ps

restart :
	docker compose restart

clean : down
	docker system prune -a --volumes -f

re : clean all
