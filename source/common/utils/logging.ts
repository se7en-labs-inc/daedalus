import type {
  FormatMessageContextParams,
  ConstructMessageBodyParams,
  MessageBody,
  ElectronLoggerMessage,
} from '../types/logging.types';

const DEFAULT_MESSAGE_BODY = {
  ns: ['daedalus'],
  data: {},
  app: ['daedalus'],
};
const isProd = process.env.NODE_ENV === 'production';
const isSilentMode = process.env.NODE_ENV === 'silence';

const stringifyMessageBody = (messageBody: MessageBody): string => {
  const spacing = isProd ? 0 : 2;
  return JSON.stringify(messageBody, null, spacing);
};

export const filterLogData = (
  data: Record<string, any>
): Record<string, any> => {
  const sensitiveData = [
    'spendingPassword',
    'oldPassword',
    'newPassword',
    'mnemonic',
    'recoveryPhrase',
    'passphrase',
    'password',
    'votingKey',
    'stakeKey',
    'signature',
    'accountPublicKey',
    'walletPublicKey',
    'icoPublicKey',
    'extendedPublicKey',
    'publicKeyHex',
    'chainCodeHex',
    'signedTransactionBlob',
    'withdrawal',
    // Governance vote target redaction (slice-1 sanitization floor).
    // omit-deep-lodash recurses by key name at any depth, so these
    // cover delegation.active.voting, delegation.next[*].voting,
    // certificates[*].vote, drepId anywhere, etc.
    'drepId',
    'dRepId',
    'vote',
    'voting',
    // Governance identity and anchor redaction. A verified anchor name
    // identifies a DRep as precisely as a bech32 id, and an anchor URL
    // identifies the DRep whose detail page the user is viewing.
    'drepIdentity',
    'currentDRep',
    'votingTarget',
    'chosenOption',
    'raw',
    'cip105',
    'cip129',
    'credentialHex',
    'anchorUrl',
    'anchorContent',
    'givenName',
    'verifiedName',
    'objectives',
    'motivations',
    'qualifications',
    'references',
    'paymentAddress',
    'doNotList',
  ];

  const redact = (value: any): any => {
    if (Array.isArray(value)) {
      return value.map(redact);
    }

    if (value && typeof value === 'object') {
      return Object.keys(value).reduce(
        (result, key) => {
          if (sensitiveData.includes(key)) {
            return result;
          }

          result[key] = redact(value[key]);
          return result;
        },
        {} as Record<string, any>
      );
    }

    return value;
  };

  return redact(data);
};

// Error messages are bounded before they reach the log. A backend failure can
// carry a message assembled from the response it could not parse, which is
// otherwise as large as that response.
const MAX_LOGGED_MESSAGE_LENGTH = 512;
// Status and error codes worth keeping: each one distinguishes a class of
// failure that the message alone does not.
const DIAGNOSTIC_ERROR_FIELDS = ['code', 'statusCode', 'status', 'syscall'];

const boundMessage = (message: string): string =>
  message.length > MAX_LOGGED_MESSAGE_LENGTH
    ? `${message.slice(
        0,
        MAX_LOGGED_MESSAGE_LENGTH
      )} [truncated, ${message.length} chars]`
    : message;

/**
 * Reduces a thrown value to the fields that tell one failure from another.
 *
 * `JSON.stringify(new Error('boom'))` is `{}`, because `name`, `message` and
 * `stack` are either inherited or non-enumerable. Handing an `Error` straight
 * to the logger therefore records an empty object and no information. This
 * returns fields that survive serialisation: the error's name, its message
 * bounded to `MAX_LOGGED_MESSAGE_LENGTH`, and whichever status or error code
 * the thrown value carries. Payloads attached to an error are not included.
 */
export const describeError = (error: unknown): Record<string, any> => {
  if (typeof error === 'string') {
    return {
      message: boundMessage(error),
    };
  }

  if (error == null || typeof error !== 'object') {
    return {
      message: String(error),
    };
  }

  const source = error as Record<string, any>;
  const description: Record<string, any> = {};
  const name = error instanceof Error ? error.name : source.name;

  if (typeof name === 'string' && name !== '') {
    description.name = name;
  }

  const message = error instanceof Error ? error.message : source.message;

  if (typeof message === 'string' && message !== '') {
    description.message = boundMessage(message);
  }

  DIAGNOSTIC_ERROR_FIELDS.forEach((field) => {
    const value = source[field];

    if (typeof value === 'string' || typeof value === 'number') {
      description[field] = value;
    }
  });

  return Object.keys(description).length > 0
    ? description
    : {
        message: 'thrown value carried no diagnostic fields',
      };
};
export const stringifyData = (data: any) => JSON.stringify(data, null, 2);
export const stringifyError = (error: any) =>
  JSON.stringify(error, Object.getOwnPropertyNames(error), 2);
export const formatContext = (context: FormatMessageContextParams): string => {
  const { appName, electronProcess, level, network } = context;
  return `[${appName}.*${network}*:${level}:${electronProcess}]`;
};
export const formatMessageTime = (date: Date): string => {
  const [year, time] = date.toISOString().split('T');
  return `[${year}T${time.slice(0, -1)}Z]`;
};
export const constructMessageBody = (
  bodyData: ConstructMessageBodyParams
): MessageBody => {
  let messageBody = { ...DEFAULT_MESSAGE_BODY, ...bodyData };

  if (typeof messageBody.data === 'string') {
    messageBody = {
      ...messageBody,
      data: {
        response: messageBody.data,
      },
    };
  }

  const { at, env, ns, data, app, msg, pid, sev, thread } = messageBody;
  return {
    at,
    env,
    ns,
    data,
    app,
    msg,
    pid,
    sev,
    thread,
  };
};
export const formatMessage = (loggerMessage: ElectronLoggerMessage): string => {
  const at = loggerMessage.date.toISOString();
  // @ts-ignore ts-migrate(2488) FIXME: Type 'LogSystemInfoParams' must have a '[Symbol.it... Remove this comment to see the full error message
  const [context, messageData] = loggerMessage.data;
  const { level } = loggerMessage;
  const { message: msg, environmentData } = messageData;
  const { network, os, platformVersion, version } = environmentData;
  const messageBodyParams: ConstructMessageBodyParams = {
    at,
    env: `${network}:${os}:${platformVersion}`,
    ns: ['daedalus', `v${version}`, `*${network}*`],
    ...(!!messageData.data && {
      data: messageData.data,
    }),
    msg,
    pid: '',
    sev: level,
    thread: '',
  };
  const messageBody: MessageBody = constructMessageBody(messageBodyParams);
  if (isSilentMode) return '';
  if (isProd) return stringifyMessageBody(messageBody);
  const messageTime: string = formatMessageTime(loggerMessage.date);
  return `${messageTime} ${context} ${stringifyMessageBody(messageBody)}`;
};
