// import { createSelector } from 'reselect';

// ------------------------------------
// Selectors
// ------------------------------------
import layout from './index';
import { createSelector } from 'reselect';

const rootSelector = createSelector(
  (state: State.Root) => state.layout,
  (layout: State.Layouts): State.Layouts => layout
);

export const paginationSelectorFactory = (type: string) =>
  createSelector(
    rootSelector,
    (layout: State.Layouts): Layouts.Pagination =>
      (layout.pagination as any)[type]
  );
export const appLangSelector = createSelector(
  rootSelector,
  (layout: State.Layouts): string => layout.appLang
);
export const appEpochSelector = createSelector(
  rootSelector,
  (layout: State.Layouts): string => layout.epoch
);
export const checkedIdsSelector = createSelector(
  rootSelector,
  (layout: State.Layouts): Layouts.checkedIds[] => layout.checkedIds
);
export const isShowOverlaySelector = createSelector(
  rootSelector,
  (layout: State.Layouts): Layouts.checkedIds[] => layout.showOverlay
);
