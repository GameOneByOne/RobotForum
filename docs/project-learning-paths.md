# Project learning paths

Projects have independent Markdown content, an operating system, hardware/software requirements, prerequisite knowledge, difficulty and estimated duration. Ordered learning stages each contain an outcome, Markdown instructions and references to published knowledge articles. References distinguish required learning, supplementary material and optional reading. Knowledge articles remain independent of project order.

## Database

Apply `20261018000000_project_learning_paths.sql` before deploying the app. It adds project metadata, `project_learning_stages` and `project_stage_knowledge`. Foreign keys cascade when projects, stages or articles are deleted. Public readers can view published project plans; authenticated owners manage their own plans.

The `save_project_plan` security-invoker RPC writes metadata, tags, stages and article references in one transaction. It derives ownership from `auth.uid()`, locks existing projects during updates, validates published article references and rolls back the entire save on an error. Article titles and URLs are loaded from knowledge records rather than copied into route data.

`20261018001000_seed_turtlesim_project.sql` creates the short ROS 2 turtlesim example and resolves article references from existing published articles. Running the seed again leaves an existing project untouched. If published knowledge has exactly one author, that author owns the sample; otherwise the sample is unowned editorial content. No authentication accounts are created. `lib/projects/starter.ts` records the original sample content; later edits happen through the normal project editor.

Both migrations were applied to the connected production Supabase project during this update. Older projects receive empty requirements and routes and remain readable/editable.

## Validation

`npm test` covers parsing, field limits, unsafe URLs, duplicate references, RPC payloads, route ordering and unavailable article filtering. Database integration was also verified using PostgreSQL (PGlite): migrations and idempotent seed, owner create/update, cross-owner rejection, anonymous read/write permissions, and rollback after invalid article references. Browser checks cover the actual seeded project, stage navigation, linked articles, responsive layouts, translations and editor route configuration.

The sample's shell instructions target an existing Ubuntu 24.04 / ROS 2 Jazzy Desktop installation. A ROS simulator was not run as part of web application validation.
