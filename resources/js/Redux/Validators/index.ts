// import { handleActions } from 'redux-actions';
import { Action, handleActions } from 'redux-actions';
import {
    setPerPageAction,
    setPageAction
} from './actions';

const initialState: State.Validators = {
    perPage: 10,
    currentPage: 1
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
}

export {
    setPerPageAction,
    setPageAction
}

export default handleActions(ACTION_HANDLERS, initialState);
