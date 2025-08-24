import { ThunkAction, Action } from '@reduxjs/toolkit';
import { composeWithDevTools } from 'redux-devtools-extension';
import reduxPromise from 'redux-promise';
import reduxThunkFsa from 'redux-thunk-fsa';
import { createStore, applyMiddleware, combineReducers } from 'redux';
import logger from 'redux-logger';

import layoutReducer from '../Redux/Layout';
// import clinicReducer from '../Redux/Clinic/index';
// import meterialReducer from '../Redux/Material/index';
// import incominginvoiceReducer from '../Redux/Incominginvoice/index';
// import outgoinginvoiceReducer from '../Redux/Incominginvoice/index';
// import changeinvoiceReducer from '../Redux/Changeinvoice/index';
// import pricingReducer from '../Redux/Pricing/index';
// import schedulerReducer from '../Redux/Scheduler/index';
// import staffReducer from '../Redux/Staff/index';
// import formulaReducer from '../Redux/Formula/index';
// import patientReducer from '../Redux/Patient/index';

const reducers = combineReducers({
    layout: layoutReducer,
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
