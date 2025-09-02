import { createSelector } from 'reselect';

// ------------------------------------
// Selectors
// ------------------------------------
const rootSelector = createSelector(
    (state: State.Root) => state.user,
    (user: State.User): State.User => user
);

export const userSelector = createSelector(
    rootSelector,
    (user: State.User): User.User => user.user
);
