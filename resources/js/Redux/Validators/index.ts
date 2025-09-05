// import { handleActions } from 'redux-actions';
import { Action, handleActions } from 'redux-actions';
import {
    setPerPageAction,
    setPageAction,
    setFilterAction,
} from './actions';

const initialState: State.Validators = {
    perPage: 10,
    currentPage: 1,
    filterType: 'all',
    validators: [],
    loading: true,
    isFetched: false
};

// ------------------------------------
// Action Handlers
// ------------------------------------
const ACTION_HANDLERS: any = {
    [setPerPageAction]: {
        next: (state: State.Validators, action: Action<string>): State.Validators => ({
            ...state,
            epoch: action.payload
        })
    },
    [setPageAction]: {
        next: (state: State.Validators, action: Action<string>): State.Validators => ({
            ...state,
            currentPage: action.payload
        })
    },
    [setFilterAction]: {
        next: (state: State.Validators, action: Action<string>): State.Validators => ({
            ...state,
            filterType: action.payload
        })
    },
}

export {
    setPerPageAction,
    setPageAction,
    setFilterAction,
}

export default handleActions(ACTION_HANDLERS, initialState);
