// import { handleActions } from 'redux-actions';
import { Action, handleActions } from 'redux-actions';
import {
    changeLangAction,
    setPaginationAction,
    setSwitchToggleAction,
    setPopupAction,
    showOverlayAction,
    setEpochAction,
    setSettingsAction
} from './actions';
import { PaginationType } from '../../Constants';
const initPagination = { limit: 25, offset: 0, sort: 'DESC', column: 'created_at', query: '' };

const initialState: State.Layouts = {
    pagination: {
        [PaginationType.VALIDATORS]: { ...initPagination },
    },
    isSidebarOpen: false,
    isMobileDevice: false,
    isDataLoading: false,
    isPopupActive: false,
    showOverlay: false,
    toasts: [],
    checkedIds: [],
    showTextingMenu: false,
    showProfileMenu: false,
    selectedLng: 'en',
    appLang: 'en',
    showEmailNotification: false,
    epoch: '',
    settingsData: {}
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS: any = {
    [changeLangAction]: {
        next: (state: State.Layouts, action: Action<string>): State.Layouts => ({
            ...state,
            appLang: action.payload
        })
    },
    [setPopupAction]: {
        next: (state: State.Layouts, action: Action<string>): State.Layouts => ({
            ...state,
            isPopupActive: action.payload
        })
    },
    [showOverlayAction]: {
        next: (state: State.Layouts, action: Action<string>): State.Layouts => ({
            ...state,
            showOverlay: action.payload
        })
    },
    [setEpochAction]: {
        next: (state: State.Layouts, action: Action<string>): State.Layouts => ({
            ...state,
            epoch: action.payload
        })
    },
    [setSettingsAction]: {
        next: (state: State.Layouts, action: Action<string>): State.Layouts => ({
            ...state,
            settingsData: action.payload
        })
    },
}

export {
    changeLangAction,
    setPaginationAction,
    setSwitchToggleAction,
    setPopupAction,
    showOverlayAction,
    setEpochAction,
    setSettingsAction
}

export default handleActions(ACTION_HANDLERS, initialState);
