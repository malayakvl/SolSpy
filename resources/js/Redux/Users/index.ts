import { Action, handleActions } from 'redux-actions';
import {
    fetchUserAction,
    setUserAction,
} from './actions';

// const initialState: State.Users = {
//     Users: {} as Users.Users,
//     hideRegisterFrom: false,
//     subscription: {},
//
// };
const initialState: {
    clientSecret: null;
    subscription: null;
    user: User.User;
    paymentIntent: null;
    showChangeSubscription: boolean;
    forFree: boolean | string;
    redirectAfterSubscription: boolean;
    commentId: null;
} = {
    user: {} as User.User,
    clientSecret: null,
    subscription: null,
    paymentIntent: null,
    showChangeSubscription: false,
    forFree: false,
    redirectAfterSubscription: false,
    commentId: null
};

const ACTION_HANDLERS: any = {
    [fetchUserAction]: {
        next: (state: State.User, action: Action<any>): State.User => ({
            ...state,
            user: action.payload
        })
    },
    [setUserAction]: {
        next: (state: State.User, action: Action<any>): State.User => ({
            ...state,
            user: action.payload
        })
    },
};

export {
    fetchUserAction,
    setUserAction,
};

// ------------------------------------
// Reducer
// ------------------------------------
export default handleActions(ACTION_HANDLERS, initialState as any);
