JS_ACTIONS = get-next-version tag-release

SETUP_DEV_TARGETS = $(addprefix setup-dev-, $(JS_ACTIONS))
TEST_DEV_TARGETS = $(addprefix test-dev-, $(JS_ACTIONS))
RESET_DEV_TARGETS = $(addprefix reset-dev-, $(JS_ACTIONS))

thing:
	echo $(SETUP_DEV_TARGETS)

.PHONY=pre-push
pre-push: test $(RESET_DEV_TARGETS)
	

$(SETUP_DEV_TARGETS):
	ACTION_DIR=.github/actions/$(@:setup-dev-%=%) ;\
	cd $$ACTION_DIR ;\
	npm install ;\
	cd ../../.. ;\
	touch $@

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

.PHONY=test
test: $(TEST_DEV_TARGETS)
	@actionlint .github/workflows/*
