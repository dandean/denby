REPORTER = dot

test:
	make show && make server

server:
	node test/server/server.js

show:
	open http://localhost:3000

.PHONY: test
