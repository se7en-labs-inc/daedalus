# Finding: the general settings screen crashes instead of showing its error

**Status:** open, not scheduled
**Raised from:** writing the first container-level screen stories, phase 6 of the
Storybook modernization
**Scope:** `ProfileSettingsForm`, one line
**Severity:** low likelihood, total effect. The screen does not degrade, it
unmounts: React throws during render and the settings page goes blank.

---

## The measurement

`source/renderer/app/components/widgets/forms/ProfileSettingsForm.tsx:55` types
the prop:

```ts
error?: LocalizableError | null | undefined;
```

and `:130` renders it:

```tsx
{error && <p className={styles.error}>{error}</p>}
```

`LocalizableError` is a class with `id`, `defaultMessage` and `values`
(`i18n/LocalizableError.ts:7-18`). Rendering one as a React child throws:

```
Error: Objects are not valid as a React child
(found: object with keys {id, defaultMessage, values})
  in p (created by ProfileSettingsForm)
  in GeneralSettings (created by GeneralSettingsPage)
```

Reproduced by mounting `GeneralSettingsPage` through the store harness with
`setProfileLocaleRequest.error` set to a `LocalizableError`, which is the shape
the real request carries when the call it wraps rejects.

## It is the only one

`intl.formatMessage(error)` is how the rest of the application renders a
`LocalizableError`: 21 components use that idiom, among them
`WalletRestoreDialog.tsx:583` and `TransferFundsStep1Dialog.tsx:104`, both of
which render the same construct one call short of this one.

`grep -rn ">{error}<" source/renderer/app/components/` returns exactly one hit,
this line. So this is a single omission rather than a pattern, and the fix is to
match the twenty-one:

```tsx
{error && <p className={styles.error}>{intl.formatMessage(error)}</p>}
```

`ProfileSettingsForm` already has `intl` in scope through `injectIntl`.

## What it does and does not affect today

`GeneralSettingsPage` is the only container that passes this prop, and it passes
`setProfileLocaleRequest.error`. That request writes the chosen interface
language to local storage, so it fails rarely: a storage quota problem, a
corrupted profile file, a permissions change under the user's data directory.

When it does fail the user gets a blank settings page rather than a message, and
the failure they were supposed to be told about is replaced by one nobody
mentions.

`InitialSettingsPage` renders the same form during first run and passes no
`error`, so that path is unaffected.

## Why it was not found before

The prop is typed as the thing that breaks it, so the type checker is on the
wrong side of the argument: passing a correctly typed `LocalizableError` is what
crashes. No test covers the error branch, and the component-level story for this
form never set `error`, because the story was built from a props literal chosen
to make the screen look right.

It surfaced the first time the screen was mounted through its real container with
a failed request in the store, which is the whole reason the container stories
exist.

## What was not done, and why

The fix, which is one line in shipped source. This phase writes stories; changing
a component under `source/` is a different change with a different review, and
the epic has held that line since phase 1.

The story that demonstrates it is also not committed. A story whose only content
is an uncaught exception fails the render check and tells a reader the workbench
is broken rather than the screen. It goes in with the fix.

## Which area would own it

Whoever next touches the settings screens. One line, and the twenty-one
neighbouring call sites show exactly what it should say.
