// import { createSelector } from 'reselect';

// ------------------------------------
// Selectors
// ------------------------------------
import layout from './index';
import { createSelector } from 'reselect';

const rootSelector = createSelector(
  (state: State.Root) => state.validators,
  (validators: State.Validators): State.Validators => validators
);
export const perPageSelector = createSelector(
    rootSelector,
    (validators: State.Validators): string => validators.perPage
);
export const filterTypeSelector = createSelector(
    rootSelector,
    (validators: State.Validators): string => validators.filterType
);

