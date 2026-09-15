/*
 * Turning a knob's options object into an argType.
 *
 * `select(name, options, value)` from addon-knobs takes its options as
 * `{ label: value }`. Storybook's select control takes the values as an array
 * and the labels as a separate map keyed by value. The shapes are inverses of
 * each other, and there are enough call sites in this corpus that inverting it
 * by hand at each one would be both noise and an opportunity to get one wrong.
 *
 *   argTypes: { currentDateFormat: optionsFrom(dateOptions) }
 */

type Options = Record<string, string | number>;

const labelsOf = (options: Options) =>
  Object.entries(options).reduce<Record<string, string>>(
    (acc, [label, value]) => {
      acc[String(value)] = label;
      return acc;
    },
    {}
  );

export const optionsFrom = (options: Options) => ({
  options: Object.values(options),
  control: { type: 'select' as const, labels: labelsOf(options) },
});

/*
 * The same choice where the option values are not primitives.
 *
 * Storybook refuses a non-primitive `options` array by name, because an option
 * has to survive a round trip through the URL: "Invalid argType: '<name>.options'
 * should only contain primitives. Use a 'mapping' for complex values." So the
 * arg holds the label and the story looks the value up.
 *
 * Storybook's own `mapping` would do that lookup, and it is deliberately not
 * used. Composing a story through `@storybook/react` with `mapping` set hands
 * the render the label rather than the mapped value, so the one instrument
 * available outside a browser cannot show the lookup happening. Resolving in the
 * story body gives the same result and can be read straight off the page.
 *
 *   argTypes: { stakePool: labelOptionsFrom(stakePoolsOptions) }
 *   render: ({ stakePool }) => <Thing pool={stakePoolsOptions[stakePool]} />
 */
export const labelOptionsFrom = (options: Record<string, unknown>) => ({
  options: Object.keys(options),
  control: { type: 'select' as const },
});

export const radioOptionsFrom = (options: Options) => ({
  options: Object.values(options),
  control: { type: 'radio' as const, labels: labelsOf(options) },
});

export const inlineRadioOptionsFrom = (options: Options) => ({
  options: Object.values(options),
  control: { type: 'inline-radio' as const, labels: labelsOf(options) },
});

/*
 * A number knob's third argument is its range configuration and carries the
 * same fields the range control wants, so this is a pass-through that exists to
 * keep the call sites reading the same way as the ones above.
 */
export const rangeFrom = (config: {
  min?: number;
  max?: number;
  step?: number;
}) => ({
  control: { type: 'range' as const, ...config },
});

/*
 * A knob's trailing group id becomes a table category on an argType. The loading
 * stories put every one of their controls in one group, so writing the category
 * out per arg is the same line repeated. This builds one argType per arg from the
 * args object itself, merging anything that arg already needed.
 *
 *   args: loadingArgs,
 *   argTypes: inCategory('Loading', loadingArgs, {
 *     status: labelOptionsFrom(statusOptions),
 *   }),
 */
export const inCategory = (
  category: string,
  args: Record<string, unknown>,
  overrides: Record<string, Record<string, unknown>> = {}
) =>
  Object.keys(args).reduce<Record<string, Record<string, unknown>>>(
    (acc, name) => {
      acc[name] = { ...overrides[name], table: { category } };
      return acc;
    },
    {}
  );
