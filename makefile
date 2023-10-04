#!make
.ONESHELL:

BUILD_DIR = lib

all: clean copy-config compile test-compile build watch run-map run-nomap make-run
.PHONY: all

clean:
	rm -rf build lib tmp

copy-config:
	mkdir -p ${BUILD_DIR}/config
	cp -r $(wildcard config/*) ${BUILD_DIR}/config

compile:
	tsc -p tsconfig-build.json

test-compile:
	tsc -p tsconfig.json

build: compile copy-config

watch:
	tsc -w -p tsconfig.json

relink: compile copy-config
	@echo 'Relinking file'
	npm link

# RUNNING DEVELOPMENT

run_path = NODE_ENV=$(NODE_ENV) $(shell which node) ${BUILD_DIR}/index.js$(1)$(2)$(3)
test_doc = test/data/test-doc.html
config_yaml = test/config/test-config.yaml
config_json = test/config/test-config.json
config_json5 = test/config/test-config.json5

run:
	node --enable-source-maps lib/index.js

run-nomap:
	node build/src/index.js

# TESTING
all_test: unit-test-test watch-test test-%
.PHONY: all_test

unit-test:
	mocha

watch-test:
	mocha --watch --watch-file *.ts

test-%: NODE_ENV=prod
test-basic: build
	$(call run_path, clean, $(test_doc), -d -c ${config_json})

test-json5: build
	$(call run_path, clean, $(test_doc), -d -c ${config_json5})

test-yaml: build
	$(call run_path, clean, $(test_doc), -d -c ${config_yaml})

test-diff: build
	$(call run_path, clean, $(test_doc), -d -fd -c ${config_json})

test-edge-case: build
	$(call run_path, clean, $(test_doc), -d -c test/config/edge-case-config.json)

test-manifest: build
	echo $$TEST_BOOK
	$(call run_path, inspect, "$(TEST_BOOK)", -m)
