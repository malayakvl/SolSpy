import { createSelector } from 'reselect';

// ------------------------------------
// Selectors
// ------------------------------------
const rootSelector = createSelector(
    (state: State.Root) => state.user,
    (user: User.Root): User.Root => user
);

export const userSelector = createSelector(
    rootSelector,
    (user: User.Root): User.User => user.user
);