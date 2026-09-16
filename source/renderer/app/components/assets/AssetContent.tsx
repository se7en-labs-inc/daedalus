import React, { useState } from 'react';
import SVGInline from 'react-svg-inline';
import classnames from 'classnames';
import { defineMessages, intlShape, injectIntl } from 'react-intl';
import CopyToClipboard from 'react-copy-to-clipboard';
import { observer } from 'mobx-react';
import styles from './AssetContent.scss';
import { decodeAssetNameText } from '../../utils/assetName';
import copyIcon from '../../assets/images/copy-asset.inline.svg';
import copyCheckmarkIcon from '../../assets/images/check-w.inline.svg';
import { ASSET_TOKEN_ID_COPY_FEEDBACK } from '../../config/timingConfig';
import type { Asset as AssetProps } from '../../api/assets/types';

const messages = defineMessages({
  fingerprintAssetParam: {
    id: 'assets.assetToken.param.fingerprint',
    defaultMessage: '!!!Fingerprint',
    description: '"fingerprint" param.',
  },
  policyIdAssetParam: {
    id: 'assets.assetToken.param.policyId',
    defaultMessage: '!!!Policy Id',
    description: '"policyId" param.',
  },
  assetNameAssetParam: {
    id: 'assets.assetToken.param.assetName',
    defaultMessage: '!!!Asset name',
    description: '"assetName" param.',
  },
  assetNameOnChainAssetParam: {
    id: 'assets.assetToken.param.assetNameOnChain',
    defaultMessage: '!!!({name})',
    description:
      'Decoded "assetName" param, rendered directly after the asset name bytes it decodes. Brackets only, because the row is already labelled "Asset name" and the parenthetical follows the hex it decodes.',
  },
  onChainName: {
    id: 'assets.assetToken.onChainName',
    defaultMessage:
      '!!!This name is decoded from the asset name chosen by whoever minted this token. No issuer published it, and it does not identify the token. The fingerprint does.',
    description:
      'Accessible label on an asset name decoded from the asset name bytes rather than published by an issuer.',
  },
  nameAssetParam: {
    id: 'assets.assetToken.param.name',
    defaultMessage: '!!!Name',
    description: '"name" param.',
  },
  tickerAssetParam: {
    id: 'assets.assetToken.param.ticker',
    defaultMessage: '!!!Ticker',
    description: '"ticker" param.',
  },
  descriptionAssetParam: {
    id: 'assets.assetToken.param.description',
    defaultMessage: '!!!Description',
    description: '"description" param.',
  },
  blank: {
    id: 'assets.assetToken.param.blank',
    defaultMessage: '!!!Blank',
    description: '"Blank" param value.',
  },
  settingsCogPopOver: {
    id: 'assets.assetToken.settings.cogPopOver',
    defaultMessage:
      '!!!You can configure the number of decimal places for this native token.',
    description: 'Asset settings pop over content',
  },
  settingsWarningPopOverAvailable: {
    id: 'assets.warning.available',
    defaultMessage:
      '!!!Recommended configuration for decimal places for this native token is available.',
    description: 'Asset settings recommended pop over content',
  },
  settingsWarningPopOverNotUsing: {
    id: 'assets.warning.notUsing',
    defaultMessage:
      '!!!You are not using the recommended decimal place configuration for this native token.',
    description: 'Asset settings recommended pop over content',
  },
});
type Props = {
  asset: AssetProps;
  onCopyAssetParam?: (...args: Array<any>) => any;
  highlightFingerprint?: boolean;
  className?: string;
  intl: intlShape.isRequired;
  hasError?: boolean;
};
type ParamCopied = string | null | undefined;
const AssetContent = observer((props: Props) => {
  const [paramCopied, setParamCopied] = useState<ParamCopied>(null);
  // @ts-ignore ts-migrate(2304) FIXME: Cannot find name 'TimeoutID'.
  let copyNotificationTimeout: TimeoutID;

  const handleCopyParam = (
    newParamCopied: string,
    param: string,
    fullValue: string
  ) => {
    const { onCopyAssetParam } = props;

    if (onCopyAssetParam) {
      onCopyAssetParam({
        param,
        fullValue,
      });
    }

    clearTimeout(copyNotificationTimeout);
    setParamCopied(newParamCopied);
    copyNotificationTimeout = setTimeout(() => {
      setParamCopied(null);
    }, ASSET_TOKEN_ID_COPY_FEEDBACK);
  };

  const renderAssetParam = (assetId: string, param: string, value: string) => {
    const icon = paramCopied === assetId ? copyCheckmarkIcon : copyIcon;
    const iconClassnames = classnames([
      styles.copyIcon,
      paramCopied === assetId ? styles.copiedIcon : null,
    ]);

    const onCopy = () => {
      handleCopyParam(assetId, param, value);
    };

    // Only the asset name carries a decoded form, and only when what is left
    // after a CIP-68 label is printable. The same decoder the pill resolves
    // through, so the two cannot disagree about what a name says. The row's
    // value stays the whole hex, label included, and the decoded form follows
    // it in brackets: a parenthetical directly after a hex string reads as a
    // decoding of it, under a row already labelled "Asset name", so it needs no
    // label of its own. Nothing attests those bytes, so the brackets carry the
    // marking and the hex does not.
    //
    // The condition is on the whole fragment, leading space included. A name
    // that does not decode must render as the hex alone, not as an empty pair
    // of brackets and not as a trailing space.
    const decodedAssetName =
      assetId === 'assetName' ? decodeAssetNameText(value) : null;
    return (
      <CopyToClipboard text={value} onCopy={onCopy}>
        <div className={styles.assetParam}>
          <div className={styles.value}>
            {value}
            {decodedAssetName && (
              <>
                {' '}
                <span
                  className={styles.onChainName}
                  data-testid="assetNameOnChainParam"
                  aria-label={props.intl.formatMessage(messages.onChainName)}
                >
                  {props.intl.formatMessage(
                    messages.assetNameOnChainAssetParam,
                    {
                      name: decodedAssetName,
                    }
                  )}
                </span>
              </>
            )}
            <SVGInline svg={icon} className={iconClassnames} />
          </div>
        </div>
      </CopyToClipboard>
    );
  };

  const { asset, highlightFingerprint, className, intl, hasError } = props;
  const { fingerprint, policyId, assetName, metadata } = asset;
  const { name, ticker, description } = metadata || {};
  const componentStyles = classnames([
    styles.component,
    className,
    highlightFingerprint ? styles.highlightFingerprint : null,
    hasError ? styles.error : null,
  ]);
  return (
    <div className={componentStyles}>
      {highlightFingerprint && (
        <div className={styles.fingerprint}>
          {renderAssetParam(
            'fingerprint',
            intl.formatMessage(messages.fingerprintAssetParam),
            fingerprint
          )}
        </div>
      )}
      <dl>
        {!highlightFingerprint && (
          <>
            <dt>{intl.formatMessage(messages.fingerprintAssetParam)}</dt>
            <dd>
              {renderAssetParam(
                'fingerprint',
                intl.formatMessage(messages.fingerprintAssetParam),
                fingerprint
              )}
            </dd>
          </>
        )}
        {ticker && (
          <>
            <dt>{intl.formatMessage(messages.tickerAssetParam)}</dt>
            <dd>
              {renderAssetParam(
                'ticker',
                intl.formatMessage(messages.tickerAssetParam),
                ticker
              )}
            </dd>
          </>
        )}
        {name && (
          <>
            <dt>{intl.formatMessage(messages.nameAssetParam)}</dt>
            <dd>
              {renderAssetParam(
                'name',
                intl.formatMessage(messages.nameAssetParam),
                name
              )}
            </dd>
          </>
        )}
        {description && (
          <>
            <dt>{intl.formatMessage(messages.descriptionAssetParam)}</dt>
            <dd>
              {renderAssetParam(
                'description',
                intl.formatMessage(messages.descriptionAssetParam),
                description
              )}
            </dd>
          </>
        )}
        <dt>{intl.formatMessage(messages.policyIdAssetParam)}</dt>
        <dd>
          {renderAssetParam(
            'policyId',
            intl.formatMessage(messages.policyIdAssetParam),
            policyId
          )}
        </dd>
        <dt>{intl.formatMessage(messages.assetNameAssetParam)}</dt>
        <dd>
          {assetName ? (
            renderAssetParam(
              'assetName',
              intl.formatMessage(messages.assetNameAssetParam),
              assetName
            )
          ) : (
            <span className={styles.blankValue}>
              {intl.formatMessage(messages.blank)}
            </span>
          )}
        </dd>
      </dl>
    </div>
  );
});
export default injectIntl(AssetContent);
