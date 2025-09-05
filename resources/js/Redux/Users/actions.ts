import { createAction } from 'redux-actions';
import axios from 'axios';
import { authHeader, toggleModalPopup } from '../../Lib/Functions';
// import { setErrorToastAction, setSuccessToastAction, showLoaderAction } from '../Layout/actions';

// const { publicRuntimeConfig } = getConfig();
// const baseUrl = `${publicRuntimeConfig.apiUrl}/api`;
// const authUrl = `${publicRuntimeConfig.apiUrl}/auth`;


export const fetchUserAction: any = createAction('profile/FETCH_USER', async (email: string) => {
    return axios
        .get(`/profile`, {
            headers: {
                ...authHeader(email)
            }
        })
        .then((res) => res.data.user)
        .catch((e) => console.log(e.message));
});


export const setUserLocaleAction: any = createAction(
    'Users/SET_USER_LOCALE',
    async (locale: string) =>
        (dispatch: Type.Dispatch, getState: () => State.Root): Promise<void> => {
            const state = getState();
            // dispatch(showLoaderAction(true));
            // return axios
            //     .get(`${baseUrl}/profile/set-locale?locale=${locale}`, {
            //         headers: {
            //             ...authHeader(state.user.user.email)
            //         }
            //     })
            //     .then(() => {
            //         // dispatch(setSuccessToastAction('Response was sent successfully'));
            //         dispatch(showLoaderAction(false));
            //     })
            //     .catch((e) => {
            //         // dispatch(setErrorToastAction(e.response.data.error));
            //         dispatch(showLoaderAction(false));
            //     });
        }
);
export const setUserAction: any = createAction('Users/SET_USER');
