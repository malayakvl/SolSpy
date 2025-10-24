import { createAction } from 'redux-actions';

export const changeLangAction: any = createAction('layouts/CHANGE_LANG');

export const setSwitchToggleAction: any = createAction(
  'layouts/SWITCH_HEADER_TOGGLE'
);
export const setPopupAction: any = createAction('layouts/SET_POPUP');

export const setPaginationAction: any = createAction('layouts/SET_PAGINATION');

export const showOverlayAction: any = createAction('layouts/SHOW_OVERLAY');

export const setEpochAction: any = createAction('layouts/SET_EPOCH');

export const setSettingsAction: any = createAction('layouts/SET_SETTINGS_ALL');
