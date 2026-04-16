# AI Backend

Deterministic backend skeleton for the draft-generation stage of the Artisan Video Pipeline.

## Responsibilities

- Accept a raw script and create a new project record.
- Run a queue-backed multi-agent pipeline that produces `project_state.json`.
- Persist project state to local JSON files for human review.
- Stop at `READY_FOR_REVIEW`; this service never renders video.

## Endpoints

- `POST /project`
- `GET /project/:id`
- `POST /project/:id/run`

## Environment

- `PORT` defaults to `3000`
- `REDIS_URL` defaults to `redis://localhost:6379`
- `STORAGE_PATH` defaults to `./data`
