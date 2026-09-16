# Storybook modernization: work deliberately left out

Recorded here so it is findable rather than remembered. Everything below was in
scope to consider and out of scope to do, with the reason. Figures measured at
`9532be608`.

## 1. A render check for the component stories

**What exists.** The 129 screen stories, across 49 files, are mounted and
asserted by `storybook/stories/screens/screens.spec.tsx`. The 258 component
stories are not. A component story that renders blank passes `compile`, `lint`
and `storybook:build`, because none of them evaluates a preview module.

**Why not done.** Locked decision 7 reversed `@storybook/test-runner` out of
scope: it needs a Playwright browser, and the Nix build is offline by
construction. The screen spec exists because `composeStories` needs no browser.
The same technique would work for the component corpus, at 258 stories rather
than 129, and nobody has costed it.

**The cheap partial.** `story-args-audit.js`, under
`.agent/plans/storybook-modernization/task-plans/`, statically finds the most
common cause of a blank component story: a render that reads its first argument
with no `args` declared. It exits non-zero on a finding and needs no browser. It
is a script rather than a check in the merge gate, because promoting it means
editing `perSystem/checks.nix` and shipping a script out of a directory the
formatter and the type checker both exclude.

## 2. Image-diff visual regression

**Why not done.** Out of scope from the start, and it depends on item 1: there is
no browser in the build to take the images with. `jest-image-snapshot` against
jsdom would compare nothing useful, since jsdom has no layout.

**What it would buy.** The render spec asserts that a screen puts content on the
page. It does not assert that the content is right, and no check in this
repository does. That is the largest remaining gap in the corpus.

## 3. A second coverage tier for the dialog and wizard containers

**Measured.** 104 container files under `source/renderer/app/containers`. 48
distinct containers are mounted by the 49 screen story files, the difference
being `DRepDirectoryPage`, which serves two screens at two routes. Of the 56
containers no story mounts, 40 are dialog, wizard or wizard-step containers.

**Why not done.** They are reached through the screen that opens them, and the
roster treated them as exercised there rather than as coverage targets of their
own. That holds for a dialog whose parent has a story that opens it, and it does
not hold for the 40: most are reachable only through a flow no story drives.

**What it would take.** `dialogOpen(SomeDialog)` in
`storybook/stories/_support/harness/storeDefaults.ts` already expresses an open
dialog as a single override, keyed by identity so the ten dialogs a settings
screen mounts do not all open at once. The mechanism exists; the roster does not.

## 4. Promoting the storybook lint warnings to errors

**Measured.** `storybook/` reports 449 warnings and 0 errors. The largest
categories are `@typescript-eslint/ban-ts-comment` at 161,
`@typescript-eslint/no-empty-function` at 98 and `import/no-unresolved` at 71.

**Why not done.** 161 of the 449 are the same question as the directives in item
5, and answering it in the story corpus without answering it in `source/` would
leave the two halves of one convention at different standards.

## 5. The `@ts-ignore` directives in the story corpus

**Measured.** 161 directives across 45 files under `storybook/`, counted by the
lint rule that reports them. A textual search returns 162; the extra one is a
mention of the string inside a comment in
`storybook/stories/_support/harness/ScreenStory.tsx` and is not a directive.

Separately, `grep -roh '@ts-ignore' source --include=*.ts --include=*.tsx | wc -l`
returns 1,059. That is accepted ts-migrate debt and is not this epic's to touch.

**Why not done.** Most of the 161 are `ts-migrate(2769) FIXME: No overload matches
this call` on a component whose props type disagrees with what every caller
passes, including the application. Removing one means fixing the props type, which
is a change to `source/` with a different review.

**One thing to know before starting.** `tsconfig.json` runs `skipLibCheck: true`
with `noImplicitAny: false`. A package whose types stop resolving reports nothing
at all under that combination, so the directive count is not a safe proxy for how
much is actually checked. Written up at
`.agent/findings/07-a-lost-type-entry-is-silent.md`.

## 6. The Storybook 10 upgrade

**Why not done.** Measured, not inferred. Storybook 10 requires TypeScript 5 for
its own declaration files, which use `const` type parameters, and this project is
on TypeScript 4. Under `moduleResolution: node16`, which 10 also needs, the
project reports 102 `TS1479` errors from CommonJS files importing ESM-only
packages.

That makes the 10 upgrade strictly downstream of the TypeScript upgrade rather
than a thing to retry. 9.1.20 is where this epic stopped, and the reasoning is in
`phase-5-closing-notes.md`.

## 7. The defects found while doing this work

Four, none of them fixed here, because this epic writes stories and does not
change `source/`. Each is written up with its measurement and the fix it needs:

- `.agent/findings/08-general-settings-crashes-on-error.md`
- `.agent/findings/09-launch-screen-depends-on-a-generated-class-name.md`
- `.agent/findings/10-the-newsfeed-target-type-names-the-wrong-field.md`
- `.agent/findings/06-alonzo-celebration-is-unreachable.md`

Finding 09 is the one with a story attached to it: seven screen stories assert
that they throw at the unguarded lookup, with the message matched. Adding the
guard makes those seven assertions fail, which is how whoever fixes it finds out
to move them into the mounted set.
