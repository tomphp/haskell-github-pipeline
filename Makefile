JS_ACTIONS = get-current-version get-next-version tag-release

SETUP_DEV_TARGETS = $(addprefix setup-dev-, $(JS_ACTIONS))
LINT_DEV_TARGETS = $(addprefix lint-dev-, $(JS_ACTIONS))
FORMAT_DEV_TARGETS = $(addprefix format-dev-, $(JS_ACTIONS))
TEST_DEV_TARGETS = $(addprefix test-dev-, $(JS_ACTIONS))
RESET_DEV_TARGETS = $(addprefix reset-dev-, $(JS_ACTIONS))

.PHONY=pre-push
pre-push: lint test $(RESET_DEV_TARGETS)

$(SETUP_DEV_TARGETS):
	ACTION_DIR=.github/actions/$(@:setup-dev-%=%) ;\
	cd $$ACTION_DIR ;\
	npm install ;\
	cd ../../.. ;\
	touch $@

.PHONY=$(LINT_DEV_TARGETS)
$(LINT_DEV_TARGETS): $(SETUP_DEV_TARGETS)
	ACTION_DIR=.github/actions/$(@:lint-dev-%=%) ;\
	cd $$ACTION_DIR ;\
	npm run lint

.PHONY=$(FORMAT_DEV_TARGETS)
$(FORMAT_DEV_TARGETS): $(SETUP_DEV_TARGETS)
	ACTION_DIR=.github/actions/$(@:format-dev-%=%) ;\
	cd $$ACTION_DIR ;\
	npm run lint -- --fix

.PHONY=$(TEST_DEV_TARGETS)
$(TEST_DEV_TARGETS): $(SETUP_DEV_TARGETS)
	ACTION_DIR=.github/actions/$(@:test-dev-%=%) ;\
	cd $$ACTION_DIR ;\
	npm test

.PHONY=$(RESET_DEV_TARGETS)
$(RESET_DEV_TARGETS):
	ACTION_DIR=.github/actions/$(@:reset-dev-%=%) ;\
	cd $$ACTION_DIR ;\
	npm install --omit=dev ;\
	cd ../../.. ;\
	rm -f setup-dev-$(@:reset-dev-%=%)

.PHONY=lint
lint: $(LINT_DEV_TARGETS)

.PHONY=format
format: $(FORMAT_DEV_TARGETS)

.PHONY=test
test: $(TEST_DEV_TARGETS)
	@actionlint .github/workflows/*
