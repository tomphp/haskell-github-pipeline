.PHONY=pre-push
pre-push:
	@actionlint .github/workflows/*
