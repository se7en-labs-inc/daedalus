import React, { useEffect, useState } from 'react';
import { observer } from 'mobx-react';
import classNames from 'classnames';
import { get } from 'lodash';
import SVGInline from 'react-svg-inline';
import styles from './WalletTokenHeader.scss';
import Asset from '../../../assets/Asset';
import AssetAmount from '../../../assets/AssetAmount';
import type { AssetToken } from '../../../../api/assets/types';
import { requestAssetImageUrl } from '../../../../ipc/assetMetadataChannel';
// TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves draft.
import { assetLogger } from '../../../../utils/assetLogging';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../../assets/images/coll... Remove this comment to see the full error message
import arrow from '../../../../assets/images/collapse-arrow-small.inline.svg';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../../assets/images/star... Remove this comment to see the full error message
import starNotFilledIcon from '../../../../assets/images/star-not-filled.inline.svg';
// @ts-ignore ts-migrate(2307) FIXME: Cannot find module '../../../../assets/images/star... Remove this comment to see the full error message
import starFilledIcon from '../../../../assets/images/star-filled.inline.svg';

type Props = {
  anyAssetWasHovered: boolean;
  asset: AssetToken;
  assetSettingsDialogWasOpened: boolean;
  className?: string;
  fullFingerprint?: boolean;
  isExpanded: boolean;
  isFavorite: boolean;
  isLoading: boolean;
  hasWarning: boolean;
  onClick: (...args: Array<any>) => any;
  onCopyAssetParam: (...args: Array<any>) => any;
  onToggleFavorite?: (...args: Array<any>) => any;
};

function WalletTokenHeader(props: Props) {
  const {
    anyAssetWasHovered,
    asset,
    assetSettingsDialogWasOpened,
    className,
    fullFingerprint = true,
    isExpanded,
    isFavorite,
    isLoading,
    hasWarning,
    onClick,
    onCopyAssetParam,
    onToggleFavorite,
  } = props;
  const { uniqueId, policyId, assetName, source } = asset;
  const starIcon = isFavorite ? starFilledIcon : starNotFilledIcon;
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  // The cache keys a logo on the policy id followed by the asset name, which is
  // what `uniqueId` is for a token the wallet reports and only usually what it
  // is for one read off a transaction. Derived here so the two cannot disagree.
  const subject = `${policyId}${assetName}`;

  // The condition is that the cache holds a registry row for this subject, and
  // not that it already holds a logo. Those are different facts and only one of
  // them can start anything: the cache stores a logo because a row asked for
  // one, so a row that asks only once the logo is stored never asks at all.
  //
  // A registry row is also the earliest point at which a logo can be stored
  // against this subject, because the image table's key references the metadata
  // table's. A request issued before the row exists fetches the bytes and is
  // then refused on write, and the nothing it answers with is remembered for
  // the life of the window.
  //
  // A chain row means the registry did not answer for this subject, so it has
  // no picture of it either, and a wallet full of them would otherwise ask once
  // per token for an answer that is known in advance.
  const isInRegistry = source === 'registry';

  // Keyed on the answer as well as on the subject: a row drawn before its
  // metadata arrives is in neither channel yet, and the row that replaces it a
  // moment later is the first one with a reason to ask.
  useEffect(() => {
    // TEMPORARY DIAGNOSTIC INSTRUMENTATION. Revert before this work leaves
    // draft. Both branches are recorded, because "ten rows should have asked
    // and only three pictures appeared" and "only three rows asked" are
    // different faults and the row is the only place that knows which.
    if (!isInRegistry) {
      assetLogger.debug('Asset image row: not asking', {
        subject,
        source: source ?? null,
      });
      return undefined;
    }
    let wanted = true;
    assetLogger.debug('Asset image row: asking', {
      subject,
      source: source ?? null,
    });
    requestAssetImageUrl(subject).then((url) => {
      assetLogger.debug('Asset image row: answered', {
        subject,
        source: source ?? null,
        hasUrl: url != null,
        urlLength: url == null ? 0 : url.length,
        stillMounted: wanted,
      });
      if (wanted) setLogoUrl(url);
    });
    // A list is scrolled, and an answer can outlive the row that asked for it.
    return () => {
      wanted = false;
    };
    // The dependency list is deliberately the one that was here before. Adding
    // `source` would make the effect re-run on a change that does not move
    // `isInRegistry`, which is a behaviour change, and this commit has none.
  }, [subject, isInRegistry]);

  const rootStyles = classNames(
    styles.root,
    isExpanded && styles.isExpanded,
    className
  );
  const favoriteIconStyles = classNames(
    styles.favoriteIcon,
    isFavorite && styles.isFavorite
  );

  return (
    <div className={rootStyles} onClick={onClick}>
      {onToggleFavorite && (
        <button
          className={favoriteIconStyles}
          onClick={(event) => {
            event.persist();
            event.stopPropagation();
            onToggleFavorite({
              uniqueId,
              isFavorite,
            });
          }}
        >
          <SVGInline svg={starIcon} />
        </button>
      )}

      {logoUrl && (
        <img className={styles.logo} src={logoUrl} alt="" data-testid="logo" />
      )}

      <Asset
        asset={asset}
        small={false}
        onCopyAssetParam={onCopyAssetParam}
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        metadataNameChars={get('name', asset.metadata, 0)}
        assetSettingsDialogWasOpened={assetSettingsDialogWasOpened}
        anyAssetWasHovered={anyAssetWasHovered}
        className={styles.asset}
        hidePopOver
        fullFingerprint={fullFingerprint}
        hasWarning={hasWarning}
      />
      <AssetAmount
        amount={asset.quantity}
        metadata={asset.metadata}
        decimals={asset.decimals}
        isLoading={isLoading}
        className={styles.assetAmount}
        isShort
      />
      <SVGInline svg={arrow} className={styles.arrow} />
    </div>
  );
}

export default observer(WalletTokenHeader);
