import { ThunkAction, Action } from '@reduxjs/toolkit';
import { composeWithDevTools } from 'redux-devtools-extension';
import reduxPromise from 'redux-promise';
import reduxThunkFsa from 'redux-thunk-fsa';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import logger from 'redux-logger';

import layoutReducer from '../Redux/Layout';
import validatorsReducer from '../Redux/Validators/index';

const reducers = combineReducers({
    layout: layoutReducer,
    validators: validatorsReducer
});

const initStore = (initialState:any = {}) => {
    return createStore(
        reducers,
        initialState,
        composeWithDevTools(applyMiddleware(reduxThunkFsa, logger, reduxPromise))
    );
};

const store = initStore();

export type AppState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export type AppThunk<ReturnType = void> = ThunkAction<
    ReturnType,
    AppState,
    unknown,
    Action<string>
>;

export default store;
