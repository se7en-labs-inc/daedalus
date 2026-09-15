import React from 'react';
import { action } from 'storybook/actions';
import { FormattedMessage } from 'react-intl';
import STAKE_POOLS from '../../../../source/renderer/app/config/stakingStakePools.dummy.json';
import { StakePoolsTable } from '../../../../source/renderer/app/components/staking/stake-pools/StakePoolsTable';
import { StakePoolsSearch } from '../../../../source/renderer/app/components/staking/stake-pools/StakePoolsSearch';
import { rangeFrom } from '../../_support/argTypes';

export const poolsRange = { min: 37, max: 300, step: 1 };

// One control, read three times. The three knobs shared the label `Pools`, and
// a knob is one control per label and group.
export const stakePoolsTableArgs = { pools: 300 };
export const stakePoolsTableArgTypes = { pools: rangeFrom(poolsRange) };

const listTitle = {
  id: 'staking.stakePools.listTitle',
  defaultMessage: '!!!Stake pools ({pools})',
  description: '"listTitle" for the Stake Pools page.',
};
type Props = {
  currentTheme: string;
  pools: number;
};
export function StakePoolsTableStory(props: Props) {
  return (
    <div
      style={{
        margin: '0 20px 20px',
        display: 'flex',
        flex: 1,
        flexDirection: 'column',
      }}
    >
      <StakePoolsSearch
        search={''}
        onSearch={action('onOpenExternalLink')}
        onClearSearch={action('onOpenExternalLink')}
        onGridView={action('onOpenExternalLink')}
        onListView={action('onOpenExternalLink')}
        isListView
        isGridView={false}
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        isClearTooltipOpeningDownward
      />
      <h2
        style={{
          lineHeight: 1.38,
          margin: '20px 0 10px',
          opacity: 0.5,
          paddingLeft: '20px',
          fontFamily: '"NotoSans-Regular, NotoSansCJKjp-Regular", sans-serif',
        }}
      >
        <FormattedMessage
          {...listTitle}
          values={{
            pools: STAKE_POOLS.slice(0, props.pools).length,
          }}
        />
      </h2>
      <StakePoolsTable
        listName="selectedIndexList"
        // @ts-ignore ts-migrate(2769) FIXME: No overload matches this call.
        stakePoolsList={STAKE_POOLS.slice(0, props.pools)}
        currentLocale="en-US"
        currentTheme={props.currentTheme}
        onOpenExternalLink={action('onOpenExternalLink')}
        containerClassName="StakingWithNavigation_page"
        numberOfRankedStakePools={STAKE_POOLS.slice(0, props.pools).length}
        onTableHeaderMouseEnter={() => {}}
        onTableHeaderMouseLeave={() => {}}
      />
    </div>
  );
}
