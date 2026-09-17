import React from 'react';
import BigNumber from 'bignumber.js';
import { addLocaleData } from 'react-intl';
import en from 'react-intl/locale-data/en';
import { render, fireEvent, screen, cleanup } from '@testing-library/react';
import '@testing-library/jest-dom';
import vjf from 'mobx-react-form/lib/validators/VJF';
import type { Field } from 'mobx-react-form';
import { TestDecorator } from '../../../../../../tests/_utils/TestDecorator';
import ReactToolboxMobxForm from '../../../utils/ReactToolboxMobxForm';
import { formattedAmountToNaturalUnits } from '../../../utils/formatters';
import { NUMBER_OPTIONS } from '../../../config/profileConfig';
import { DiscreetModeFeatureProvider } from '../../../features/discreet-mode';
import { BrowserLocalStorageBridge } from '../../../features/local-storage';
import { NUMBER_FORMATS } from '../../../../../common/types/number.types';
import AssetInput from './AssetInput';

const policyId = '6b8d07d69639e9413dd637a1a815a7323c69c86abbafb66dbfdb1aa7';
// 'Cointest'.
const assetName = '436f696e74657374';
const uniqueId = `${policyId}${assetName}`;
const fieldName = `asset_${uniqueId}`;

const buildAsset = (
  decimals: number | null | undefined,
  metadata: Record<string, unknown> | null = {
    name: 'Test Coin',
    description: 'A test coin',
    ticker: 'TEST',
  }
) => ({
  policyId,
  assetName,
  uniqueId,
  fingerprint: 'asset1cvmyrfrc7lpsnjhhz9l4rzqmc6nlp4kw2xkvpa',
  quantity: new BigNumber('900000000'),
  decimals,
  recommendedDecimals: null,
  metadata,
});

type AssetFormFields = {
  [assetField: string]: string;
};

const buildForm = () =>
  new ReactToolboxMobxForm<AssetFormFields>(
    {
      fields: {
        [fieldName]: {
          label: 'Amount',
          placeholder: '0',
          value: null,
        },
      },
    },
    {
      plugins: { vjf: vjf() },
      options: { validateOnChange: false, validateOnBlur: false },
    }
  );

/**
 * `decimals` is the row's snapshotted denomination and is what the component
 * obeys. `assetDecimals` is what the asset itself currently says, which the row
 * deliberately ignores; it defaults to the snapshot so that every case that does
 * not care about the difference reads as it did before the snapshot existed.
 */
const renderAssetInput = (
  decimals: number | null | undefined,
  numberFormat: string = NUMBER_OPTIONS[0].value,
  metadata?: Record<string, unknown> | null,
  options: {
    assetDecimals?: number | null;
    hasDenominationChanged?: boolean;
  } = {}
) => {
  const form = buildForm();
  const field = form.$(fieldName);
  const assetDecimals =
    'assetDecimals' in options ? options.assetDecimals : decimals;
  const asset =
    metadata === undefined
      ? buildAsset(assetDecimals)
      : buildAsset(assetDecimals, metadata);
  // A fresh element each time. `AssetInput` is an `@observer`, so mobx-react
  // gives it a shallow prop comparison; re-rendering the identical element with
  // a mutated plain asset would be skipped. In the application the lookup is a
  // new function on every container render for the same reason.
  const tree = () => (
    <TestDecorator>
      <BrowserLocalStorageBridge>
        <DiscreetModeFeatureProvider>
          <AssetInput
            uniqueId={uniqueId}
            getAssetByUniqueId={() => asset}
            assetFields={{ [uniqueId]: field }}
            addFocusableField={() => {}}
            currentNumberFormat={NUMBER_FORMATS[numberFormat]}
            removeAssetRow={() => {}}
            handleSubmitOnEnter={() => {}}
            clearAssetFieldValue={() => {}}
            autoFocus={false}
            decimals={rowDecimals}
            hasDenominationChanged={options.hasDenominationChanged === true}
          />
        </DiscreetModeFeatureProvider>
      </BrowserLocalStorageBridge>
    </TestDecorator>
  );
  let rowDecimals = decimals;
  const { rerender } = render(tree());
  return {
    field,
    asset,
    input: screen.getByTestId(`assetInput:${uniqueId}`) as HTMLInputElement,
    label: () => screen.getByTestId(`assetUnitLabel:${uniqueId}`),
    setDecimals: (next: number | null | undefined) => {
      rowDecimals = next;
      rerender(tree());
    },
    rerender: () => rerender(tree()),
  };
};

const separatorNotice = () =>
  screen.queryByTestId(`assetSeparatorNotice:${uniqueId}`);
const isSignalling = () => separatorNotice() !== null;

const SEPARATOR = /[.,]/;

type Keystroke = {
  character: string;
  /** What the form holds, which is what gets submitted. */
  value: unknown;
  /** What the field shows. */
  displayed: string;
  /** Whether the row is saying a separator was refused. */
  isSignalling: boolean;
};

/**
 * One event per character, each carrying what the input already holds plus the
 * new character, which is what a browser produces for a caret at the end of an
 * integers-only field. The distinction is load-bearing and it is where the
 * defect hid: react-polymorph refuses the whole field value and reverts it,
 * putting the caret back where it was
 * (`node_modules/react-polymorph/lib/components/NumericInput.js:206-211`), so
 * the refused separator is gone from the input before the next keystroke
 * arrives and the digit after it lands where the separator was. A helper that
 * drove precomputed strings such as `1`, `1.`, `1.5` would keep a character the
 * field had already thrown away, and would report `1` where a user gets `15`.
 */
const typeAtTheEnd = (
  input: HTMLInputElement,
  field: Field,
  characters: string
): Array<Keystroke> =>
  [...characters].map((character) => {
    fireEvent.input(input, {
      target: { value: `${input.value}${character}` },
      inputType: 'insertText',
    });
    return {
      character,
      value: field.value,
      displayed: input.value,
      isSignalling: isSignalling(),
    };
  });

/**
 * One event carrying the whole value the input is to hold. Used instead of
 * `typeAtTheEnd` wherever the caret is not at the end, which is every field
 * with decimal places, because react-polymorph reformats the value under the
 * caret on each keystroke and appending to the formatted string would model
 * nothing a browser does.
 */
const setWholeValue = (
  input: HTMLInputElement,
  value: string,
  inputType: string
) => fireEvent.input(input, { target: { value }, inputType });

/** A keystroke whose result is the given whole value. */
const setInputTo = (input: HTMLInputElement, value: string) =>
  setWholeValue(input, value, 'insertText');

/** A paste over a selected field, replacing whatever it held. */
const paste = (input: HTMLInputElement, value: string) =>
  setWholeValue(input, value, 'insertFromPaste');

/**
 * The property, and it is about the absence of silence rather than the presence
 * of a message. From the keystroke that attempts a separator onwards, the row
 * has to be saying so for the rest of the sequence.
 *
 * Asserting only that a notice appears would also pass against a notice raised
 * by the separator and dismissed by the next digit, and that digit is the one
 * that changes the amount: the separator itself is refused and changes nothing.
 * So the assertion is over every keystroke from the separator on, and a failure
 * reports, for each unsignalled one, the amount the form held and what the field
 * showed. The first of those is the amount that would have been submitted
 * silently.
 */
const expectNoSilentChange = (keystrokes: Array<Keystroke>) => {
  const separatorAt = keystrokes.findIndex(({ character }) =>
    SEPARATOR.test(character)
  );
  expect(separatorAt).toBeGreaterThanOrEqual(0);
  const unsignalled = keystrokes
    .slice(separatorAt)
    .filter((keystroke) => !keystroke.isSignalling)
    .map(({ character, value, displayed }) => ({
      character,
      value,
      displayed,
    }));
  expect(unsignalled).toEqual([]);
};

describe('AssetInput', () => {
  beforeEach(() => addLocaleData([...en]));
  afterEach(cleanup);

  describe('when the decimal places are unknown', () => {
    it('says the separator was refused at the keystroke that refuses it', () => {
      const { field, input } = renderAssetInput(undefined);
      const keystrokes = typeAtTheEnd(input, field, '1.5');
      expect(keystrokes[1].value).toEqual('1');
      expect(keystrokes[1].isSignalling).toBe(true);
      expect(field.value).toEqual('15');
      expectNoSilentChange(keystrokes);
    });

    it('keeps saying it while the digits behind the separator are typed', () => {
      const { field, input } = renderAssetInput(undefined);
      const keystrokes = typeAtTheEnd(input, field, '1.500');
      expect(field.value).toEqual('1500');
      expect(formattedAmountToNaturalUnits(field.value)).toEqual('1500');
      expectNoSilentChange(keystrokes);
    });

    it('says it when the decimal places are null rather than absent', () => {
      const { field, input } = renderAssetInput(null);
      const keystrokes = typeAtTheEnd(input, field, '1.5');
      expect(field.value).toEqual('15');
      expectNoSilentChange(keystrokes);
    });

    it('says it for a separator typed before any digit', () => {
      const { field, input } = renderAssetInput(undefined);
      const keystrokes = typeAtTheEnd(input, field, '.5');
      // A field that cannot express a fraction cannot express `0.5` either, and
      // the digit lands as a unit. Reaching for the empty-field case is not a
      // detail: nothing was overwritten, so there is no missing character to
      // notice, and the notice is the only thing that happens.
      expect(field.value).toEqual('5');
      expectNoSilentChange(keystrokes);
    });

    it('says it for the separator the active profile does not call a decimal point', () => {
      // A user carrying the other convention types the other character. It is
      // refused the same way and the amount is wrong by the same factor.
      const { field, input } = renderAssetInput(undefined);
      const keystrokes = typeAtTheEnd(input, field, '1,5');
      expect(field.value).toEqual('15');
      expectNoSilentChange(keystrokes);
    });

    it('says it in a profile whose decimal separator is a comma', () => {
      // NUMBER_OPTIONS[1] is the profile whose decimal separator is a comma.
      const { field, input } = renderAssetInput(
        undefined,
        NUMBER_OPTIONS[1].value
      );
      const keystrokes = typeAtTheEnd(input, field, '1,5');
      expect(field.value).toEqual('15');
      expectNoSilentChange(keystrokes);
    });

    it('hands the form nothing for the separator itself', () => {
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1');
      const onChange = jest.spyOn(field, 'onChange');
      typeAtTheEnd(input, field, '.');
      expect(onChange).not.toHaveBeenCalled();
      // The digit behind it is another matter. It lands where the separator was
      // and the form is told, which is the whole reason the row has to speak.
      typeAtTheEnd(input, field, '5');
      expect(onChange).toHaveBeenCalledWith('15');
      onChange.mockRestore();
    });

    it('says nothing when no separator was attempted', () => {
      // The discriminating case. A notice raised by any amount in a raw-units
      // field would satisfy every assertion above and report nothing.
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '15');
      expect(field.value).toEqual('15');
      expect(separatorNotice()).not.toBeInTheDocument();
    });

    it('says nothing about a refused character that cannot mean a fraction', () => {
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1');
      paste(input, 'abc');
      expect(field.value).toEqual('1');
      expect(separatorNotice()).not.toBeInTheDocument();
    });

    it('refuses a pasted decimal amount and says so', () => {
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1');
      paste(input, '1.5');
      // The paste is refused whole, so unlike the typed sequence the amount
      // does not move. The row says so regardless: a paste that vanishes with
      // no explanation is the same silence from the other side.
      expect(field.value).toEqual('1');
      expect(formattedAmountToNaturalUnits(field.value)).toEqual('1');
      expect(separatorNotice()).toBeInTheDocument();
    });

    it('refuses a pasted decimal amount written with a comma and says so', () => {
      const { field, input } = renderAssetInput(
        undefined,
        NUMBER_OPTIONS[1].value
      );
      typeAtTheEnd(input, field, '1');
      paste(input, '1,5');
      expect(field.value).toEqual('1');
      expect(separatorNotice()).toBeInTheDocument();
    });

    it('refuses a pasted amount carrying group separators and says so', () => {
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1');
      paste(input, '1,234');
      expect(field.value).toEqual('1');
      // Grouping is not accepted here either, and a user who cannot tell which
      // of the two characters this profile treats as a decimal point is exactly
      // the user this notice is for.
      expect(separatorNotice()).toBeInTheDocument();
    });

    it('names the token and what the field counts', () => {
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1.5');
      const notice = separatorNotice();
      expect(notice).toHaveTextContent(
        'Decimal amounts cannot be entered for TEST'
      );
      expect(notice).toHaveTextContent('counts as one whole unit');
      expect(notice).toHaveAttribute('role', 'alert');
    });

    it('submits the raw units it was given', () => {
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1500000');
      expect(formattedAmountToNaturalUnits(field.value)).toEqual('1500000');
    });

    it('renders a large amount without group separators', () => {
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1234567');
      expect(input).toHaveValue('1234567');
      expect(field.value).toEqual('1234567');
    });
  });

  describe('when the user has set the decimal places to zero', () => {
    // The dangerous case, and it does not reach the integers-only input the way
    // the unknown case does. A token that publishes six decimal places and
    // carries a user override of zero is denominated in raw units by that
    // override, so `1.5` of it is 1500000 units and the digits `15` are a
    // hundred-thousandth of what was meant. The label over this field states a
    // precision of zero rather than naming whole ledger units, so it is the
    // weaker of the two labels and the notice carries the whole signal.
    it('says the separator was refused at the keystroke that refuses it', () => {
      const { field, input } = renderAssetInput(0, NUMBER_OPTIONS[0].value, {
        name: 'Mock USD',
        description: 'A token published with six decimal places',
        ticker: 'USDM',
      });
      const keystrokes = typeAtTheEnd(input, field, '1.5');
      expect(keystrokes[1].value).toEqual('1');
      expect(field.value).toEqual('15');
      expectNoSilentChange(keystrokes);
      expect(separatorNotice()).toHaveTextContent(
        'Decimal amounts cannot be entered for USDM'
      );
    });

    it('refuses a pasted decimal amount rather than rounding it, and says so', () => {
      const { field, input } = renderAssetInput(0);
      typeAtTheEnd(input, field, '1');
      paste(input, '1.5');
      expect(field.value).toEqual('1');
      expect(formattedAmountToNaturalUnits(field.value)).toEqual('1');
      expect(separatorNotice()).toBeInTheDocument();
    });

    it('says nothing when no separator was attempted', () => {
      const { field, input } = renderAssetInput(0);
      typeAtTheEnd(input, field, '15');
      expect(field.value).toEqual('15');
      expect(separatorNotice()).not.toBeInTheDocument();
    });
  });

  describe('when the decimal places are known', () => {
    it('accepts a typed decimal amount and submits it in natural units', () => {
      const { field, input } = renderAssetInput(6);
      ['1', '1.', '1.5'].forEach((value) => setInputTo(input, value));
      expect(field.value).toEqual('1.500000');
      expect(formattedAmountToNaturalUnits(field.value)).toEqual('1500000');
      expect(separatorNotice()).not.toBeInTheDocument();
    });

    it('accepts a pasted decimal amount and submits it in natural units', () => {
      const { field, input } = renderAssetInput(6);
      paste(input, '1.5');
      expect(field.value).toEqual('1.500000');
      expect(formattedAmountToNaturalUnits(field.value)).toEqual('1500000');
      expect(separatorNotice()).not.toBeInTheDocument();
    });

    it('submits the smallest expressible amount without rounding it away', () => {
      const { field, input } = renderAssetInput(6);
      paste(input, '0.000001');
      expect(formattedAmountToNaturalUnits(field.value)).toEqual('1');
    });
  });

  describe('the refusal notice', () => {
    it('is absent until a separator is attempted', () => {
      renderAssetInput(undefined);
      expect(separatorNotice()).not.toBeInTheDocument();
    });

    it('withdraws when the row stops being denominated in raw units', () => {
      // The notice states that the field counts whole units. A row whose
      // denomination has since resolved is not that field.
      const { field, input, setDecimals } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1.5');
      expect(separatorNotice()).toBeInTheDocument();
      setDecimals(6);
      expect(separatorNotice()).not.toBeInTheDocument();
    });

    it('stands alongside the denomination notice when both apply', () => {
      // Both raw-units spellings are one denomination to this field and two to
      // the reconciliation, which treats absent and zero as a move and clears
      // the amount. A row can therefore be told that its amount was cleared and
      // that the field counts whole units at the same time, and the two
      // sentences have to hold together.
      const { field, input } = renderAssetInput(
        0,
        NUMBER_OPTIONS[0].value,
        undefined,
        { hasDenominationChanged: true }
      );
      typeAtTheEnd(input, field, '1.5');
      expect(separatorNotice()).toBeInTheDocument();
      expect(
        screen.getByTestId(`assetDenominationNotice:${uniqueId}`)
      ).toBeInTheDocument();
    });

    it('survives the amount being retyped under the same denomination', () => {
      // Dismissal on the next keystroke is the one thing this must not do, and
      // it is what the sibling denomination notice does, so it is asserted
      // rather than assumed.
      const { field, input } = renderAssetInput(undefined);
      typeAtTheEnd(input, field, '1.5');
      field.clear();
      typeAtTheEnd(input, field, '2');
      expect(field.value).toEqual('2');
      expect(separatorNotice()).toBeInTheDocument();
    });
  });

  describe('the unit label', () => {
    it('names whole ledger units when the decimal places are unknown', () => {
      const { label } = renderAssetInput(undefined);
      expect(label()).toHaveTextContent('Enter a whole number of TEST units');
      expect(label()).toHaveTextContent(
        'decimal places for this token are unknown'
      );
    });

    it('names the unit and the precision when the decimal places are known', () => {
      const { label } = renderAssetInput(6);
      expect(label()).toHaveTextContent(
        'Enter an amount in TEST, to 6 decimal places.'
      );
    });

    it('reads correctly for a token with zero decimal places', () => {
      const { label } = renderAssetInput(0);
      expect(label()).toHaveTextContent(
        'Enter an amount in TEST, to 0 decimal places.'
      );
    });

    it('reads correctly for a token with one decimal place', () => {
      const { label } = renderAssetInput(1);
      expect(label()).toHaveTextContent(
        'Enter an amount in TEST, to 1 decimal place.'
      );
    });

    it('falls back to the fingerprint when the issuer published no ticker', () => {
      const { label } = renderAssetInput(undefined, NUMBER_OPTIONS[0].value, {
        name: 'Test Coin',
        description: 'A test coin',
      });
      // The same ellipsised spelling the pill above the field uses.
      expect(label()).toHaveTextContent('asset1cvm…kvpa');
    });

    it('never names the asset the minter called it', () => {
      // The asset name bytes decode to "Cointest", and no issuer published a
      // ticker. A label that reached for the decoded name would render an
      // unattested on-chain string as the unit of account.
      const { label } = renderAssetInput(
        undefined,
        NUMBER_OPTIONS[0].value,
        null
      );
      expect(label()).not.toHaveTextContent('Cointest');
      expect(label()).toHaveTextContent('asset1cvm…kvpa');
    });

    it('moves with the denomination it describes, in the same render', () => {
      const { input, field, label, setDecimals } = renderAssetInput(undefined);
      expect(label()).toHaveTextContent('Enter a whole number of TEST units');
      const keystrokes = typeAtTheEnd(input, field, '1.5');
      expect(field.value).toEqual('15');
      expectNoSilentChange(keystrokes);

      // The row's denomination moving, which after the snapshot is the prop and
      // not the asset.
      setDecimals(6);

      expect(label()).toHaveTextContent(
        'Enter an amount in TEST, to 6 decimal places.'
      );
      // Asserted together: a label that moved while the field kept refusing a
      // separator would be worse than no label at all.
      field.clear();
      ['2', '2.', '2.5'].forEach((value) => setInputTo(input, value));
      expect(field.value).toEqual('2.500000');
    });
  });

  describe('the snapshotted denomination', () => {
    it('obeys the snapshot and not the asset it is handed', () => {
      // The asset says six decimal places. The row was added when they were
      // unknown, so the row is in raw units and stays there.
      const { field, input, label } = renderAssetInput(
        null,
        NUMBER_OPTIONS[0].value,
        undefined,
        { assetDecimals: 6 }
      );
      const keystrokes = typeAtTheEnd(input, field, '1500000.5');
      expect(field.value).toEqual('15000005');
      expect(formattedAmountToNaturalUnits(field.value)).toEqual('15000005');
      expectNoSilentChange(keystrokes);
      expect(label()).toHaveTextContent('Enter a whole number of TEST units');
    });

    it('renders the balance in the snapshotted denomination too', () => {
      // 900000000 raw units, drawn as raw units because the row is in raw units,
      // whatever the asset has since resolved to.
      const { input } = renderAssetInput(
        null,
        NUMBER_OPTIONS[0].value,
        undefined,
        {
          assetDecimals: 6,
        }
      );
      expect(input).toBeInTheDocument();
      expect(screen.getByText('900,000,000 TEST')).toBeInTheDocument();
    });

    it('says nothing about a denomination change on its own', () => {
      renderAssetInput(6);
      expect(
        screen.queryByTestId(`assetDenominationNotice:${uniqueId}`)
      ).not.toBeInTheDocument();
    });

    it('names the token in the notice when a change cleared the amount', () => {
      renderAssetInput(6, NUMBER_OPTIONS[0].value, undefined, {
        hasDenominationChanged: true,
      });
      const notice = screen.getByTestId(`assetDenominationNotice:${uniqueId}`);
      expect(notice).toHaveTextContent(
        'The decimal places published for TEST changed while you were entering an amount'
      );
      expect(notice).toHaveTextContent('Enter it again');
    });
  });
});
