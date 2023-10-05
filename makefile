#!make
.ONESHELL:

BUILD_DIR = lib

all: clean copy-config compile test-compile build watch watch-time run-map run-nomap make-run
.PHONY: all

clean:
	rm -rf build lib tmp

copy-config:
	mkdir -p ${BUILD_DIR}/config
	cp -r $(wildcard config/*) ${BUILD_DIR}/config

compile:
	tsc -p tsconfig-build.json

compile-test:
	tsc -p tsconfig.json

build: compile copy-config

watch:
	fswatch -r -l 10 src | xargs -I {} make build

relink: compile copy-config
	@echo 'Relinking file'
	npm link
	chmod +x ${BUILD_DIR}/index.js

# RUNNING DEVELOPMENT

define run_path
NODE_ENV=$(NODE_ENV) $(shell which node) ${BUILD_DIR}/index.js$(1)$(2)$(3)
endef

test_doc = test/data/test-doc.html

run:
	node --enable-source-maps lib/index.js

run-nomap:
	node lib/index.js

# TESTING
all_test: unit-test watch-test test-%
.PHONY: all_test

%-test: NODE_ENV=test
unit-test:
	mocha

watch-test:
	fswatch -o -r src test/**/*.spec.ts | xargs -n1 -I{} make unit-test

test-%: NODE_ENV=development
test-basic: build
	$(call run_path, clean, ${test_doc}, -d -c test/config/test-config.json)

test-json5: build
	$(call run_path, clean, ${test_doc}, -d -c test/config/test-config.json5)

test-yaml: build
	$(call run_path, clean, ${test_doc}, -d -c test/config/test-config.yaml)

test-edge-case: build
	$(call run_path, clean, ${test_doc}, -d -c test/config/edge-case-config.json)

test-manifest: build
	echo $$TEST_BOOK
	$(call run_path, inspect, "$(TEST_BOOK)", -m)
