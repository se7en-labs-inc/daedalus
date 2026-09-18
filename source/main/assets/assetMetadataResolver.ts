import { logger } from '../utils/logging';
import {
  openAssetMetadataDatabase,
  AssetMetadataDatabase,
} from './assetMetadataDb';
import type {
  AssetMetadataRow,
  AssetMetadataWrite,
  AssetResolutionWrite,
} from './assetMetadataDb';
import { queryAssetRegistry } from './assetRegistryClient';
import type {
  RegistryEntry,
  RegistryProperty,
  RegistryTransport,
} from './assetRegistryClient';
import { verifyRegistryProperty } from './assetVerification';
import { queryKoiosPointers } from './koiosClient';
import type {
  KoiosPointer,
  KoiosRequestBudget,
  KoiosTransaction,
} from './koiosClient';
import type { HttpTransport } from './httpTransport';
import { confirmChainPointer } from './chainPointerVerification';
import { ImmutableBlockReader } from './immutableBlockReader';

const POLICY_ID_HEX_LENGTH = 56;
const MAX_DECIMAL_PRECISION = 20;

/**
 * A row older than this is re-read on the next demand for it, never on a timer.
 *
 * Set from measurement: of 7,976 registry mapping files, 7,464 sit at sequence
 * number 0 on every property, and in a year 375 commits touched the mappings
 * directory while only 38 files were modified rather than added. That is an
 * average over the whole registry and not over the assets a user holds, which
 * skew toward active projects; nobody has measured how far above the average
 * they sit.
 */
export const ASSET_METADATA_REFRESH_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * How long a subject waits when its pointer names a block the immutable
 * database does not hold yet.
 *
 * The window is the last k blocks, which on mainnet is about twelve hours. An
 * hour is comfortably inside it and costs two requests per retry for the whole
 * batch, so a freshly minted asset picks up its name within an hour of the
 * block settling rather than at the next cold start.
 */
export const ASSET_CHAIN_PENDING_RETRY_MS = 60 * 60 * 1000;

/**
 * How long a subject waits when its pointer was refused by the local check.
 *
 * A rejection is a fact about that pointer rather than a transient failure, but
 * the pointer can change: an index can correct itself, and `minting_tx_hash` is
 * documented as both the first and the latest mint. A day is long enough that a
 * lying index is not re-asked at any cost worth measuring.
 */
export const ASSET_CHAIN_REJECTED_RETRY_MS = 24 * 60 * 60 * 1000;

/**
 * The shortest interval between two honoured connectivity retries.
 *
 * A network change notifier raises several transitions for one physical event,
 * and can raise one while the link is not yet usable, so a retry per transition
 * would be a pass per flap. Chosen rather than measured: long enough to absorb
 * the burst one event produces, short enough that a genuine reconnection after a
 * false start is picked up while the user is still looking at the screen.
 */
export const ASSET_CONNECTIVITY_RETRY_MIN_INTERVAL_MS = 30 * 1000;

export type AssetMetadataResolverOptions = {
  database?: AssetMetadataDatabase;
  transport?: RegistryTransport;
  endpoint?: string | null;
  onResolved?: (rows: Array<AssetMetadataRow>) => void;
  now?: () => number;
  retryBackoffMs?: number;
  /** The immutable database the chain channel confirms pointers against. */
  immutableDirectory?: string | null;
  /** The user's selected pointer source. Null disables the chain channel. */
  pointerSourceUrl?: string | null;
  pointerTransport?: HttpTransport;
  pointerBudget?: KoiosRequestBudget;
};

const asString = (value: unknown): string | null =>
  typeof value === 'string' && value.length > 0 ? value : null;

const propertyValue = (
  entry: RegistryEntry,
  name: string
): RegistryProperty | null => entry.properties[name] ?? null;

const stringProperty = (entry: RegistryEntry, name: string): string | null =>
  asString(propertyValue(entry, name)?.value);

/**
 * Out of range stores null rather than losing the row. `asset_metadata` refuses
 * a value above MAX_DECIMAL_PRECISION, and writing one would make the engine
 * reject the whole row, taking the ticker and the name with it. cardano-wallet
 * accepts 0 to 255, so a registry value above 20 is possible.
 */
const decimalsValue = (entry: RegistryEntry): number | null => {
  const value = propertyValue(entry, 'decimals')?.value;
  if (!Number.isInteger(value)) return null;
  const decimals = value as number;
  if (decimals < 0 || decimals > MAX_DECIMAL_PRECISION) return null;
  return decimals;
};

const metadataJson = (entry: RegistryEntry): string | null => {
  const url = stringProperty(entry, 'url');
  const description = stringProperty(entry, 'description');
  if (url === null && description === null) return null;
  return JSON.stringify({
    ...(url === null ? {} : { url }),
    ...(description === null ? {} : { description }),
  });
};

const maxSequenceNumber = (entry: RegistryEntry): number | null => {
  const numbers = Object.keys(entry.properties).map(
    (name) => entry.properties[name].sequenceNumber
  );
  if (numbers.length === 0) return null;
  return numbers.reduce((highest, value) => Math.max(highest, value));
};

/**
 * The schema carries one verdict column and the PRD asks for per-property
 * verification, so the column is given one meaning: it is the attestation
 * verdict for the `decimals` property of this row. It is true when one of the
 * signatures the registry publishes for that property verifies over the
 * declared value at the declared sequence number.
 *
 * Every behaviour the PRD describes for the column is about decimal places.
 * Names, tickers and descriptions are display-only and are written whether or
 * not they attested.
 *
 * **The policy binding is not part of this verdict, and that is a change.**
 * `verifyRegistryProperty` also reports whether the entry's OPTIONAL `policy`
 * field hashes to the subject's minting policy id and whether the attesting
 * keys satisfy the native script inside it. Requiring that as well refuses
 * every entry that simply omits the field, which is about half of the entries
 * that publish a decimals value at all: of 120 mappings sampled from 7,977, 106
 * publish a value, 104 of those are attested, and only 53 also carry `policy`.
 * The 51 that are attested but unbound carry a signature that verifies; what
 * they lack is a second document proving the signing key can mint the token.
 *
 * Refusing those 51 caught 2 entries in that sample, and neither is an attack:
 * one carries no signatures, and the other declares a sequence number one above
 * the one its signatures cover, which is an issuer who edited an entry without
 * re-signing it. The same entry's name and ticker are on screen already,
 * because those were never gated. So the binding bought a stronger claim for
 * half the corpus and the claim it bought is not the one the column is used
 * for.
 */
const attestedDecimals = (entry: RegistryEntry): boolean => {
  const property = propertyValue(entry, 'decimals');
  if (!property) return false;
  return verifyRegistryProperty(
    entry.subject,
    entry.policy,
    'decimals',
    property
  ).attested;
};

export const registryEntryToRow = (
  entry: RegistryEntry
): AssetMetadataWrite => ({
  subject: entry.subject,
  policyId: entry.subject.slice(0, POLICY_ID_HEX_LENGTH),
  assetName: entry.subject.slice(POLICY_ID_HEX_LENGTH),
  ticker: stringProperty(entry, 'ticker'),
  name: stringProperty(entry, 'name'),
  decimals: decimalsValue(entry),
  // Computed here from the bytes. No field of a registry response sets it.
  attested: attestedDecimals(entry),
  metadata: metadataJson(entry),
  source: 'registry',
  sequenceNumber: maxSequenceNumber(entry),
  slot: null,
});

/**
 * A confirmed pointer as a row.
 *
 * Four of the columns are fixed and each is a rule rather than a default.
 * `source` is `chain`. `slot` is the mint block's, which is what a chain row has
 * instead of a sequence number. `sequence_number` is NULL, and the schema's
 * CHECK refuses a chain row that carries one. `decimals` is NULL, which is the
 * mechanical form of the rule that no amount is ever formatted by a number that
 * did not come from the registry. `attested` is false, because it is the verdict
 * of the registry's own attestation signature and a chain row never runs it.
 *
 * The name is the CIP-25 `name`, or the CIP-68 `name` when there is no CIP-25
 * record. Where an index answers with both, the CIP-68 datum is the live record
 * and is the one stored.
 *
 * A CIP-68 value sits on weaker footing than a CIP-25 one and the difference is
 * not visible in the row. A CIP-25 payload is in the mint transaction, so the
 * block read confirms it. A CIP-68 datum lives at a spendable UTxO, which
 * changes whenever that output is spent, so the mint transaction says nothing
 * about its current value and confirming it would mean querying the live UTxO
 * set. That is acceptable only because of what the value is used for, which is a
 * name and nothing else.
 */
export const chainPointerToRow = (
  pointer: KoiosPointer,
  slot: number,
  cip25: Record<string, unknown> | null,
  policyClosed: boolean
): AssetMetadataWrite => {
  const payload = pointer.cip68Metadata ?? cip25;
  // A CIP-68 datum lives at a spendable output and changes when that output is
  // spent, which needs no minting at all, so a closed minting policy says
  // nothing about it. Only a CIP-25 record is frozen by closure.
  const frozen = policyClosed && !pointer.cip68Metadata;
  const metadata = JSON.stringify({
    record: payload ?? null,
    closed: frozen,
  });
  return {
    subject: pointer.subject,
    policyId: pointer.policyId,
    assetName: pointer.assetName,
    ticker: null,
    name: chainName(payload),
    decimals: null,
    attested: false,
    metadata,
    source: 'chain',
    sequenceNumber: null,
    slot,
  };
};

/**
 * The name inside a CIP-25 or CIP-68 payload.
 *
 * CIP-25 version 1 writes a bare string; a payload built from a metadatum whose
 * value was a one-element array carries `['Name']`, which is how the ledger
 * splits a string over 64 bytes and also how some minters write a single value.
 * Both spellings are read, and anything else is no name rather than a rendered
 * object.
 */
const chainName = (payload: Record<string, unknown> | null): string | null => {
  if (!payload) return null;
  const value = payload.name;
  if (typeof value === 'string' && value.length > 0) return value;
  if (Array.isArray(value)) {
    const joined = value
      .filter((part): part is string => typeof part === 'string')
      .join('');
    return joined.length > 0 ? joined : null;
  }
  return null;
};

const sameContent = (
  row: AssetMetadataWrite,
  stored: AssetMetadataRow
): boolean =>
  row.ticker === stored.ticker &&
  row.name === stored.name &&
  row.decimals === stored.decimals &&
  row.attested === stored.attested &&
  row.metadata === stored.metadata &&
  row.source === stored.source &&
  row.sequenceNumber === stored.sequenceNumber &&
  row.slot === stored.slot;

/**
 * Whether a row can never change again.
 *
 * Only a chain row can be frozen, and only when the resolution that wrote it
 * found the minting policy already closed. A forced read still reaches it: a
 * manual refresh does not consult this at all.
 */
export const chainRowIsFrozen = (row: AssetMetadataRow): boolean => {
  if (row.source !== 'chain' || typeof row.metadata !== 'string') return false;
  try {
    const parsed = JSON.parse(row.metadata);
    return parsed?.closed === true;
  } catch {
    return false;
  }
};

const storedAsWrite = (stored: AssetMetadataRow): AssetMetadataWrite => ({
  subject: stored.subject,
  policyId: stored.policyId,
  assetName: stored.assetName,
  ticker: stored.ticker,
  name: stored.name,
  decimals: stored.decimals,
  attested: stored.attested,
  metadata: stored.metadata,
  source: stored.source,
  sequenceNumber: stored.sequenceNumber,
  slot: stored.slot,
});

export class AssetMetadataResolver {
  private _db: AssetMetadataDatabase;

  private _transport?: RegistryTransport;

  private _endpoint?: string | null;

  private _onResolved?: (rows: Array<AssetMetadataRow>) => void;

  private _now: () => number;

  private _retryBackoffMs?: number;

  private _immutableDirectory?: string | null;

  private _pointerSourceUrl?: string | null;

  private _pointerTransport?: HttpTransport;

  private _pointerBudget?: KoiosRequestBudget;

  private _claimed = new Set<string>();

  /**
   * Subjects whose last outcome was a failure caused by the network rather than
   * by the request.
   *
   * Every pass rewrites membership for the subjects it handled, so this
   * describes the present rather than a history: a subject that resolved, that
   * the registry does not know, or that was refused, is not here. It is the set
   * a connectivity retry acts on, and it is the only thing that decides which
   * waits a transition is allowed to withdraw.
   *
   * Held in memory and not in `asset_resolution`. A column there would change
   * the table's shape, and the database module's stated migration is to delete a
   * file stamped with any other version, so persisting this would discard every
   * user's cache to cover a restart inside one backoff step.
   */
  private _transientFailures = new Set<string>();

  private _lastConnectivityRetryAt = 0;

  private _pending: Promise<void> = Promise.resolve();

  constructor(options: AssetMetadataResolverOptions = {}) {
    this._db = options.database ?? openAssetMetadataDatabase();
    this._transport = options.transport;
    this._endpoint = options.endpoint;
    this._onResolved = options.onResolved;
    this._now = options.now ?? Date.now;
    this._retryBackoffMs = options.retryBackoffMs;
    this._immutableDirectory = options.immutableDirectory;
    this._pointerSourceUrl = options.pointerSourceUrl;
    this._pointerTransport = options.pointerTransport;
    this._pointerBudget = options.pointerBudget;
  }

  /**
   * The pointer source the renderer last named.
   *
   * The setting is the renderer's, per profile, and the client is here, so it
   * arrives with each read rather than on a channel of its own. Setting it is a
   * plain assignment: nothing is scheduled by a change, and the next resolution
   * uses whatever is current.
   */
  setPointerSourceUrl(sourceUrl: string | null | undefined): void {
    this._pointerSourceUrl = sourceUrl;
  }

  close(): void {
    this._db.close();
  }

  /**
   * Retries the subjects whose backoff was caused by the network, because the
   * machine has just said the network is back.
   *
   * The wait is bypassed rather than cleared, which is the same mechanism a
   * manual refresh uses and for the same reason: clearing the columns before a
   * fetch that then fails leaves a row that looks never-updated and re-schedules
   * on every render. Nothing is written before the read, and a retry that fails
   * again lands on the next rung of the ladder.
   *
   * The set is emptied when the pass is issued, so a second transition arriving
   * before it finishes finds nothing to do. When the call is refused for being
   * too soon the set is left intact, so the next honoured transition still has
   * it. Returns the subjects it issued a read for, which is what the spec and
   * the log line are about.
   */
  retryTransientFailures(): Array<string> {
    if (this._transientFailures.size === 0) return [];
    const now = this._now();
    if (
      now - this._lastConnectivityRetryAt <
      ASSET_CONNECTIVITY_RETRY_MIN_INTERVAL_MS
    ) {
      return [];
    }
    this._lastConnectivityRetryAt = now;
    const subjects = Array.from(this._transientFailures);
    this._transientFailures.clear();
    logger.debug('Asset metadata: retrying after connectivity returned', {
      subjectCount: subjects.length,
    });
    this.request(subjects, { force: true });
    return subjects;
  }

  /** Answers from disk. Never waits on the network. */
  readCached(subjects: Array<string>): Array<AssetMetadataRow> {
    return this._db.readMetadata(subjects);
  }

  /**
   * Reads from disk and starts whatever is due. The read is what a caller gets
   * back; the fetch fills the misses for the next one.
   *
   * Subjects are claimed synchronously, before the work is queued, so a second
   * call arriving in the same tick does not schedule the same subject twice.
   */
  request(
    subjects: Array<string>,
    options: { force?: boolean } = {}
  ): Array<AssetMetadataRow> {
    const rows = this.readCached(subjects);
    // A forced read skips the refresh window and the retry backoff, and skips
    // them by not consulting them rather than by clearing the columns they are
    // read from. Clearing `updated_at` before the fetch would leave a row that
    // looks never-updated if the fetch then failed, and every render afterwards
    // would re-schedule it.
    const due =
      options.force === true
        ? subjects.filter((subject) => !this._claimed.has(subject))
        : this._due(subjects, rows);
    const claimed = this._claim(due);
    if (claimed.length > 0) {
      this._pending = this._pending.then(async () => {
        try {
          await this._run(claimed);
        } catch (error) {
          logger.debug('Asset metadata: background resolve failed', {
            reason: error instanceof Error ? error.message : 'unknown',
          });
        } finally {
          this._release(claimed);
        }
      });
    }
    return rows;
  }

  /** Resolves after the work started by `request` has settled. */
  pending(): Promise<void> {
    return this._pending;
  }

  async resolve(subjects: Array<string>): Promise<Array<AssetMetadataRow>> {
    const claimed = this._claim(subjects);
    if (claimed.length === 0) return [];
    try {
      return await this._run(claimed);
    } finally {
      this._release(claimed);
    }
  }

  private _claim(subjects: Array<string>): Array<string> {
    const claimed = subjects.filter((subject) => !this._claimed.has(subject));
    claimed.forEach((subject) => this._claimed.add(subject));
    return claimed;
  }

  private _release(subjects: Array<string>): void {
    subjects.forEach((subject) => this._claimed.delete(subject));
  }

  private async _run(wanted: Array<string>): Promise<Array<AssetMetadataRow>> {
    const now = this._now();
    const stored = new Map(
      this._db.readMetadata(wanted).map((row) => [row.subject, row])
    );
    const failureCounts: Record<string, number> = {};
    this._db.readResolutions(wanted).forEach((row) => {
      failureCounts[row.subject] = row.failureCount;
    });

    let entries: Array<RegistryEntry> = [];
    let resolutions: Array<AssetResolutionWrite> = [];
    let transient: Array<string> = [];
    try {
      // No database call inside the awaited section, and no transaction held
      // across it.
      const result = await queryAssetRegistry(wanted, {
        transport: this._transport,
        endpoint: this._endpoint,
        retryBackoffMs: this._retryBackoffMs,
        failureCounts,
        now,
      });
      entries = result.entries;
      resolutions = result.resolutions;
      transient = result.transientFailures;
    } catch (error) {
      // Offline is a state, not a failure. Nothing is surfaced to the user.
      logger.debug('Asset metadata: query failed', {
        reason: error instanceof Error ? error.message : 'unknown',
        subjectCount: wanted.length,
      });
    }

    const toWrite: Array<AssetMetadataWrite> = [];
    const changed: Array<string> = [];
    entries.forEach((entry) => {
      const built = registryEntryToRow(entry);
      const previous = stored.get(entry.subject);
      if (!previous) {
        toWrite.push(built);
        changed.push(entry.subject);
        return;
      }
      if (this._supersedes(built, previous)) {
        toWrite.push(built);
        if (!sameContent(built, previous)) changed.push(entry.subject);
        return;
      }
      // Stamped on every successful read whether or not anything changed, which
      // is what stops a never-updated subject being re-read on every render.
      // Written, but not emitted: nothing downstream has anything to do with a
      // row that did not change.
      toWrite.push(storedAsWrite(previous));
    });

    // Only subjects the registry did not answer reach the chain channel. That
    // is what keeps fungible holdings, which the registry does answer for, off
    // it entirely.
    const answered = new Set(entries.map((entry) => entry.subject));
    stored.forEach((row, subject) => {
      if (row.source === 'registry') answered.add(subject);
    });
    const unanswered = wanted.filter((subject) => !answered.has(subject));
    const chain = await this._resolveFromChain(unanswered, failureCounts, now);
    transient = transient.concat(chain.transientFailures);
    chain.rows.forEach((row) => {
      toWrite.push(row);
      changed.push(row.subject);
    });

    if (toWrite.length > 0) this._db.writeMetadata(toWrite, now);
    // The chain outcome is written after the registry's for the same subject,
    // and both are an upsert on the subject, so the later one stands. That is
    // the right way round: the registry recorded a subject it does not know,
    // and the chain channel has just said something more specific about it.
    const allResolutions = resolutions.concat(chain.resolutions);
    if (allResolutions.length > 0) {
      this._db.writeResolutions(allResolutions, now);
    }
    this._recordTransientFailures(wanted, transient, allResolutions);

    const emitted = changed.length > 0 ? this._db.readMetadata(changed) : [];
    if (emitted.length > 0 && this._onResolved) {
      try {
        this._onResolved(emitted);
      } catch (error) {
        logger.debug('Asset metadata: consumer threw on resolved rows', {
          reason: error instanceof Error ? error.message : 'unknown',
        });
      }
    }
    return emitted;
  }

  /**
   * Rewrites which of the subjects this pass handled are waiting on the network.
   *
   * A subject that resolved is removed even if a channel also failed
   * transiently for it, because the row it now has is the answer the retry would
   * have been for.
   */
  private _recordTransientFailures(
    wanted: Array<string>,
    transient: Array<string>,
    resolutions: Array<AssetResolutionWrite>
  ): void {
    const waiting = new Set(transient);
    resolutions.forEach((row) => {
      if (row.state === 'resolved') waiting.delete(row.subject);
    });
    wanted.forEach((subject) => {
      if (waiting.has(subject)) {
        this._transientFailures.add(subject);
      } else {
        this._transientFailures.delete(subject);
      }
    });
  }

  /**
   * The chain channel: ask the index for pointers, confirm each against the
   * user's own chain, and turn the confirmations into rows.
   *
   * Nothing here throws. A subject that cannot be confirmed produces a
   * resolution row and no metadata row, which is the same shape the registry
   * channel already uses for a subject it could not answer.
   */
  private async _resolveFromChain(
    subjects: Array<string>,
    failureCounts: Record<string, number>,
    now: number
  ): Promise<{
    rows: Array<AssetMetadataWrite>;
    resolutions: Array<AssetResolutionWrite>;
    transientFailures: Array<string>;
  }> {
    const empty = { rows: [], resolutions: [], transientFailures: [] };
    if (subjects.length === 0) return empty;
    if (!this._pointerSourceUrl || !this._immutableDirectory) return empty;

    let result;
    try {
      result = await queryKoiosPointers(subjects, {
        baseUrl: this._pointerSourceUrl,
        transport: this._pointerTransport,
        budget: this._pointerBudget,
        failureCounts,
        retryBackoffMs: this._retryBackoffMs,
        now,
      });
    } catch (error) {
      logger.debug('Asset metadata: pointer query failed', {
        reason: error instanceof Error ? error.message : 'unknown',
        subjectCount: subjects.length,
      });
      return empty;
    }

    if (result.pointers.length === 0) {
      return {
        rows: [],
        resolutions: result.resolutions,
        transientFailures: result.transientFailures,
      };
    }

    // One reader for the pass. It lists the immutable directory once to find
    // the tip, which on a synced mainnet is tens of thousands of entries.
    const reader = new ImmutableBlockReader(this._immutableDirectory);
    const byHash = new Map<string, KoiosTransaction>(
      result.transactions.map((transaction) => [
        transaction.txHash,
        transaction,
      ])
    );

    const rows: Array<AssetMetadataWrite> = [];
    const resolutions: Array<AssetResolutionWrite> = result.resolutions.slice();

    result.pointers.forEach((pointer) => {
      const transaction = byHash.get(pointer.mintingTxHash);
      if (!transaction) return;
      const confirmation = confirmChainPointer(
        {
          subject: pointer.subject,
          policyId: pointer.policyId,
          assetName: pointer.assetName,
          txHash: transaction.txHash,
          blockHash: transaction.blockHash,
          absoluteSlot: transaction.absoluteSlot,
          cbor: transaction.cbor,
        },
        { reader }
      );

      if (confirmation.status === 'pending') {
        resolutions.push({
          subject: pointer.subject,
          state: 'pending',
          failureCount: failureCounts[pointer.subject] ?? 0,
          retryAfter: now + ASSET_CHAIN_PENDING_RETRY_MS,
        });
        return;
      }
      if (confirmation.status === 'rejected') {
        logger.warn('Asset metadata: pointer refused by the local check', {
          reason: confirmation.reason,
        });
        resolutions.push({
          subject: pointer.subject,
          state: 'failed',
          failureCount: (failureCounts[pointer.subject] ?? 0) + 1,
          retryAfter: now + ASSET_CHAIN_REJECTED_RETRY_MS,
        });
        return;
      }
      if (confirmation.status === 'unavailable') {
        // Nothing was decided about the pointer, so nothing is recorded about
        // it either. The subject keeps whatever the registry pass wrote.
        return;
      }

      rows.push(
        chainPointerToRow(
          pointer,
          confirmation.slot,
          confirmation.cip25,
          confirmation.policyClosed
        )
      );
      resolutions.push({
        subject: pointer.subject,
        state: 'resolved',
        failureCount: 0,
        retryAfter: 0,
      });
    });

    return {
      rows,
      resolutions,
      transientFailures: result.transientFailures,
    };
  }

  private _supersedes(
    built: AssetMetadataWrite,
    previous: AssetMetadataRow
  ): boolean {
    // The registry wins where both channels could answer, and a chain row
    // carries no sequence number to compare against.
    if (previous.source !== 'registry') return true;
    // null means nothing is known about the stored version, not that it is at
    // zero, which is what it would coerce to.
    if (previous.sequenceNumber === null) return true;
    if (built.sequenceNumber === null) return false;
    return built.sequenceNumber > previous.sequenceNumber;
  }

  private _due(
    subjects: Array<string>,
    rows: Array<AssetMetadataRow>
  ): Array<string> {
    const now = this._now();
    const bySubject = new Map(rows.map((row) => [row.subject, row]));
    const blocked = new Set(
      this._db
        .readResolutions(subjects)
        .filter((row) => row.retryAfter > now)
        .map((row) => row.subject)
    );
    return subjects.filter((subject) => {
      if (blocked.has(subject)) return false;
      if (this._claimed.has(subject)) return false;
      const row = bySubject.get(subject);
      if (!row) return true;
      // Freshness is per channel rather than per row age. A registry record can
      // be updated by its issuer at any time, so it always takes the window. A
      // CIP-25 record under a policy that can never mint again is final, so it
      // is read once and never again. Everything else takes the window.
      if (chainRowIsFrozen(row)) return false;
      return now - row.updatedAt > ASSET_METADATA_REFRESH_MS;
    });
  }
}

export const openAssetMetadataResolver = (
  options: AssetMetadataResolverOptions = {}
): AssetMetadataResolver => new AssetMetadataResolver(options);
