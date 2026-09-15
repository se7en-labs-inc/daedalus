# task-035 implementation review

## Implementation: Iteration 1

2026-09-15.

Set `module` and `moduleResolution` to `node16`, added the `paths` entry restoring faker's
declarations, and verified by file set, by behaviour probe, and by five Nix checks.

Outcome: 3170 files in the program, the same count as the baseline, with `axios/index.d.ts` replaced
by `axios/index.d.cts` as the only membership change. Faker misuse errors again. All five checks
green. Label set identical pair for pair, args audit at zero.

## Review: Iteration 1

Summary: correct, and the verification is the substance of the task rather than a formality.

Three things are worth separating, because they look alike and are not.

The axios change is an improvement and was left alone. `node16` picks `index.d.cts` for a CommonJS
consumer where classic resolution picked `index.d.ts`; the `.cts` file is the one axios publishes for
this case, and it was not being used before.

The faker change is a regression and was fixed. The fix expresses, in the consumer's config, the
mapping faker's own `typesVersions` field was expressing, so the coupling to `dist/types` is not new.
What is new is that a faker upgrade moving that directory now fails with TS2307 rather than silently
producing `any`.

Neither was visible in the error count, and the behaviour probe is what settled which was which. An
import that resolves to untyped JavaScript is indistinguishable from a working import when read
through a green `tsc`; it is distinguishable in one line when read through a deliberate misuse.

Decision: `approved`.
