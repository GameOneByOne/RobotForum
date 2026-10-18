# Knowledge metadata deployment

1. Apply `20261018022639_knowledge_metadata_and_permissions.sql` before deploying the application. This adds public author display text, preserves existing authors and timestamps, backfills only missing timestamps, and removes knowledge difficulty tag associations. Existing difficulty/order columns remain readable for compatibility; the UI no longer displays classification.
2. Deploy the application. All shared tag writes must use `ON CONFLICT DO NOTHING` (`ignoreDuplicates: true` in Supabase clients).
3. Apply `20261018022845_restrict_shared_tag_mutations.sql` after deployment. Authenticated users can read and add shared tag names, but cannot rename or delete shared tags used by other authors.

Article ownership continues to use the `author_id` foreign key and author-only row policies. Display names are derived from authenticated metadata and are never authorization identifiers. Creation time is immutable; explicit saves advance modification time, including tag-only saves. Counter-only updates preserve modification time. Times are stored as timestamptz and displayed to minute precision in Asia/Shanghai (UTC+8).
