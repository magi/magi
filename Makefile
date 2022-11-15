# local
setup: config

.PHONY: config run-server build-server run-ui build-ui clean clean-web build-docker-dev
config: config/magi-config-example.yaml
	cp -n config/magi-config-example.yaml config/magi-config.yaml

run-server:
	go run ./cmd/magi/main.go

build-server:
	go build -o ./build/magi -v ./cmd/magi/main.go

run-ui:
	npm --prefix web run dev

build-ui:
	npm --prefix web run build

clean:
	rm -rf build

clean-web:
	rm -rf web/node_modules

## Docker
build-docker-dev:
	docker build --tag magi/magi:dev .