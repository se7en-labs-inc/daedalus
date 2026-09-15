# Finding: the newsfeed target type names a field nothing uses

**Status:** open, not scheduled
**Raised from:** building the newsfeed store fixtures, phase 6 of the Storybook
modernization
**Scope:** `NewsTarget`, one field
**Severity:** no runtime effect on shipped behaviour. The cost is that the type
steers every author of a news item into producing one the application discards.

---

## The measurement

`source/renderer/app/api/news/types.ts:13-16`:

```ts
export type NewsTarget = {
  daedalusVersion: string | null | undefined;
  platform: string;
};
```

`source/renderer/app/domains/News.ts:99` and `:109`, the only place a target's
platform is consulted:

```ts
const targetPlatforms = get(newsItem, ['target', 'platforms']);
…
platformKeys.some((key) => includes(targetPlatforms, key))
```

Counted over `source/`:

| | count |
|---|---|
| reads of `target.platforms`, the plural | 1, the filter above |
| reads of `target.platform`, the singular the type declares | **0** |
| items in `config/news.dummy.json` carrying `platforms` | 11 of 11 |
| items carrying `platform` | 0 |

`news.dummy.json` is the payload the store loads on the QA path
(`NewsFeedStore.ts:272`), so it is this repository's own statement of the shape
the feed serves.

An item built to satisfy the declared type therefore has `targetPlatforms`
`undefined`, `includes(undefined, 'darwin')` is `false`, and the filter drops it
before anything sees it. Silently: the collection is simply shorter.

## What it does and does not affect today

Nothing in a shipped build. The live feed serves `platforms`, the filter reads
`platforms`, and the type is never checked against the wire because the response
arrives as JSON and is cast.

What it affects is anyone writing a news item in TypeScript. The type is the only
documentation of the shape, and it is wrong in the one field that decides whether
an item is shown at all.

Measured cost so far: every story in `storybook/stories/news/` that claimed to
render news rendered an empty feed. Three fixture items in, zero out, confirmed by
constructing the collection directly. The stories built, indexed and displayed a
frame with nothing in it, and had done since they were written.

## The fix

```ts
export type NewsTarget = {
  daedalusVersion: string | null | undefined;
  platforms: Array<string>;
};
```

`platform` can go, because nothing reads it. Doing so is a one-line change with no
runtime consequence, and it makes the next person's fixture work the first time.

## Why it was not found before

`strict` is off and the response is cast rather than validated, so no check
compares the declared type to the data. The filter uses `lodash.get` with a path
array, which means a missing field is `undefined` rather than a type error, and
the result of dropping every item is an empty list rather than a failure.

The story corpus showed the symptom for as long as it has existed. Nothing looked,
because a story that renders an empty frame renders.

## What was not done, and why

The type change, which is in shipped source. This phase writes stories.

The story fixtures are corrected here, because they are part of the corpus this
epic owns. They now carry both spellings: the plural because the code reads it,
the singular because the declared type requires it. Both are commented in place
and both go when the type is fixed.

## Which area would own it

Whoever next touches the newsfeed. One field, and the eleven items in the
repository's own sample payload settle which spelling is right.
