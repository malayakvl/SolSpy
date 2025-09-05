import { useDispatch, useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import Lang from 'lang.js';
import lngHeader from '../../Lang/Header/translation';
import Dropdown from '../../Components/Form/Dropdown';
import { changeLangAction } from '../../Redux/Layout';

export default function LangMenu() {
  const dispatch = useDispatch();
  const appLang = useSelector(appLangSelector);
  const lng = new Lang({
    messages: lngHeader,
    locale: appLang,
  });

  return (
    <div className="space-x-8 sm:-my-px sm:flex md:flex md:mt-[-8px] relative md:mr-[15px]">
      <Dropdown>
        <Dropdown.Trigger>
          <span className="inline-flex">
            <button
              type="button"
              className="inline-flex items-center
                                bg-white px-2 text-sm lng-menu
                                font-medium leading-4 text-gray-500
                                transition duration-150
                                ease-in-out hover:text-gray-700 focus:outline-none"
            >
              <b className="uppercase text-white">{appLang}</b>
              <span className="icon-arrow-down" />
            </button>
          </span>
        </Dropdown.Trigger>

        <Dropdown.Content>
          <span
            className="dropdown-span"
            onClick={() => dispatch(changeLangAction('en'))}
          >
            En
          </span>
          <span
            className="dropdown-span"
            onClick={() => dispatch(changeLangAction('uk'))}
          >
            Укр
          </span>
        </Dropdown.Content>
      </Dropdown>
    </div>
  );
}
