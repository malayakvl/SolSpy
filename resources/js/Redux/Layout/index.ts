// import { handleActions } from 'redux-actions';
import { Action, handleActions } from 'redux-actions';
import {
    changeLangAction,
    setPaginationAction,
    setSwitchToggleAction,
    setPopupAction,
    showOverlayAction,
} from './actions';
import { PaginationType } from '../../Constants';
const initPagination = { limit: 25, offset: 0, sort: 'DESC', column: 'created_at', query: '' };

const initialState: State.Layouts = {
    pagination: {
        [PaginationType.FILIALS]: { ...initPagination },
        [PaginationType.ROLES]: { ...initPagination },
        [PaginationType.CUSTOMERS]: { ...initPagination },
        [PaginationType.MCATEGORIES]: { ...initPagination },
        [PaginationType.PRODUCERS]: { ...initPagination },
        [PaginationType.CABINETS]: { ...initPagination },
        [PaginationType.MATERIALS]: { ...initPagination },
        [PaginationType.INCOMINGINVOICES]: { ...initPagination },
        [PaginationType.OUTGOINGINVOICES]: { ...initPagination },
        [PaginationType.CHANGEINVOICES]: { ...initPagination },
        [PaginationType.CURRENCY]: { ...initPagination },
        [PaginationType.SERVCATEGORIES]: { ...initPagination },
        [PaginationType.UNITS]: { ...initPagination },
        [PaginationType.STORES]: { ...initPagination },
        [PaginationType.PATIENTSTATUSES]: { ...initPagination },
    },
    isSidebarOpen: false,
    isMobileDevice: false,
    isDataLoading: false,
    isPopupActive: false,
    showOverlay: false,
    toasts: [],
    checkedIds: [],
    switchHeader: false,
    switchToggled: false,
    modalConfirmationMeta: null,
    modalVariantMeta: null,
    modalConfirmationDeletePeriodMeta: null,
    modalConfirmationSetupPeriodMeta: null,
    deletePeriodHidePopup: false,
    deletePeriod: null,
    setupPeriod: null,
    modalCalendlyMeta: null,
    activeTab: {
        inventory: { tab: 'products' }
    },
    showTextingMenu: false,
    showProfileMenu: false,
    selectedLng: 'uk',
    appLang: 'uk',
    showEmailNotification: false,
    nativeBrowser: false,
    openRealBrowser: false,
    filialName: ''
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

}

export {
    changeLangAction,
    setPaginationAction,
    setSwitchToggleAction,
    setPopupAction,
    showOverlayAction
}

export default handleActions(ACTION_HANDLERS, initialState);
