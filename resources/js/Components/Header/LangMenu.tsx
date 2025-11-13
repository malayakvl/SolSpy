import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import Dropdown from '../../Components/Form/Dropdown';
import { changeLangAction } from '../../Redux/Layout';

export default function LangMenu() {
  const dispatch = useDispatch();
  const appLang = useSelector(appLangSelector);

  return (
    <div className="space-x-8 sm:-my-px sm:flex md:flex md:mt-[-8px] relative md:mr-[15px]">
      <Dropdown>
        <Dropdown.Trigger>
          <span className="inline-flex">
            <button
              type="button"
              className="inline-flex items-center
                                px-2 text-sm lng-menu
                                bg-transparent
                                font-medium leading-4 text-gray-500
                                transition duration-150
                                ease-in-out hover:text-gray-700 focus:outline-none"
            >
              <b className="uppercase text-white mt-[8px]">{appLang}</b>
              <span className="icon-arrow-down mt-[8px]" />
            </button>
          </span>
        </Dropdown.Trigger>

        <Dropdown.Content width="24">
          <span
            className="dropdown-span"
            onClick={() => dispatch(changeLangAction('en'))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dispatch(changeLangAction('en'));
              }
            }}
            role="button"
            tabIndex={0}
          >
            En
          </span>
          <span
            className="dropdown-span"
            onClick={() => dispatch(changeLangAction('uk'))}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                dispatch(changeLangAction('uk'));
              }
            }}
            role="button"
            tabIndex={0}
          >
            Укр
          </span>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
}
