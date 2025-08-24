import AuthenticatedLayout from '../Layouts/AuthenticatedLayout';
import { Head, usePage } from '@inertiajs/react';
import Lang from 'lang.js';
import lngDashboard from '../Lang/Dashboard/translation';
import { useSelector } from 'react-redux';
import { appLangSelector } from '../Redux/Layout/selectors';
import React from 'react';

export default function Dashboard(clinicName) {
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngDashboard,
    locale: appLang,
  });

  return (
    <AuthenticatedLayout header={<Head />}>
      <Head title={msg.get('dashboard.title')} />
      <div className="py-0">
        <div className="p-4 sm:p-8 mb-8 content-data bg-content">
          <h2>{msg.get('dashboard.title')}&nbsp;</h2>
          <div className="grid grid-cols-4 gap-4">
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Today's Money
                      </p>
                      <h5 className="mb-0 font-bold">
                        $53,000
                        <span className="leading-normal text-sm font-weight-bolder text-lime-500">
                          +55%
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl btn-dash">
                      <i className="icon-money" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Today's Users
                      </p>
                      <h5 className="mb-0 font-bold">
                        220
                        <span className="leading-normal text-sm font-weight-bolder text-lime-500">
                          +55%
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl btn-dash">
                      <i className="icon-users"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Todays Patient
                      </p>
                      <h5 className="mb-0 font-bold">
                        10
                        <span className="leading-normal text-sm font-weight-bolder text-lime-500">
                          &nbsp;view schedule
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl btn-dash">
                      <i className="icon-patients"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative flex flex-col min-w-0 break-words bg-white shadow-soft-xl rounded-2xl bg-clip-border">
              <div className="flex-auto p-4">
                <div className="flex flex-row -mx-3">
                  <div className="flex-none w-2/3 max-w-full px-3">
                    <div>
                      <p className="mb-0 font-sans font-semibold leading-normal text-sm">
                        Tomorrow Patients
                      </p>
                      <h5 className="mb-0 font-bold">
                        12
                        <span className="leading-normal text-sm font-weight-bolder text-lime-500">
                          &nbsp;view schedule
                        </span>
                      </h5>
                    </div>
                  </div>
                  <div className="px-3 text-right basis-1/3">
                    <div className="inline-block w-12 h-12 text-center rounded-lg bg-gradient-to-tl btn-dash">
                      <i className="icon-patients"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 mt-[40px]">
            <div className="w-full max-w-full px-0 mt-0 mb-6 md:mb-0 md:w-1/2 md:flex-none lg:w-full lg:flex-none">
              <div className="border-black/12.5 shadow-soft-xl relative flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border p-3">
                <table className="items-center w-full mb-0 align-top border-gray-200 text-slate-500">
                  <thead className="align-bottom">
                    <tr>
                      <th className="px-6 py-3 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                        Author
                      </th>
                      <th className="px-6 py-3 pl-2 font-bold text-left uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                        Function
                      </th>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                        Status
                      </th>
                      <th className="px-6 py-3 font-bold text-center uppercase align-middle bg-transparent border-b border-gray-200 shadow-none text-xxs border-b-solid tracking-none whitespace-nowrap text-slate-400 opacity-70">
                        Employed
                      </th>
                      <th className="px-6 py-3 font-semibold capitalize align-middle bg-transparent border-b border-gray-200 border-solid shadow-none tracking-none whitespace-nowrap text-slate-400 opacity-70"></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <div className="flex px-2 py-1">
                          <div>
                            <img
                              src="../../images/dashboard/usr-1.png"
                              className="inline-flex items-center justify-center mr-4 text-sm text-white transition-all duration-200 ease-soft-in-out h-9 w-9 rounded-xl"
                              alt="user1"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-0 text-sm leading-normal">
                              John Michael
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400">
                              john@creative-tim.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <p className="mb-0 text-xs font-semibold leading-tight">
                          Manager
                        </p>
                        <p className="mb-0 text-xs leading-tight text-slate-400">
                          Organization
                        </p>
                      </td>
                      <td className="p-2 text-sm leading-normal text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="bg-gradient-to-tl from-green-600 to-lime-400 px-2.5 text-xs rounded-1.8 py-1.4 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">
                          Online
                        </span>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="text-xs font-semibold leading-tight text-slate-400">
                          23/04/18
                        </span>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <a
                          className="text-xs font-semibold leading-tight text-slate-400"
                        >
                          {' '}
                          Edit{' '}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <div className="flex px-2 py-1">
                          <div>
                            <img
                              src="../../images/dashboard/usr-2.png"
                              className="inline-flex items-center justify-center mr-4 text-sm text-white transition-all duration-200 ease-soft-in-out h-9 w-9 rounded-xl"
                              alt="user2"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-0 text-sm leading-normal">
                              Alexa Liras
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400">
                              alexa@creative-tim.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <p className="mb-0 text-xs font-semibold leading-tight">
                          Programator
                        </p>
                        <p className="mb-0 text-xs leading-tight text-slate-400">
                          Developer
                        </p>
                      </td>
                      <td className="p-2 text-sm leading-normal text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="bg-gradient-to-tl from-slate-600 to-slate-300 px-2.5 text-xs rounded-1.8 py-1.4 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">
                          Offline
                        </span>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="text-xs font-semibold leading-tight text-slate-400">
                          11/01/19
                        </span>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <a
                          href="javascript:;"
                          className="text-xs font-semibold leading-tight text-slate-400"
                        >
                          {' '}
                          Edit{' '}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <div className="flex px-2 py-1">
                          <div>
                            <div>
                              <img
                                src="../../images/dashboard/usr-1.png"
                                className="inline-flex items-center justify-center mr-4 text-sm text-white transition-all duration-200 ease-soft-in-out h-9 w-9 rounded-xl"
                                alt="user2"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-0 text-sm leading-normal">
                              Laurent Perrier
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400">
                              laurent@creative-tim.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <p className="mb-0 text-xs font-semibold leading-tight">
                          Executive
                        </p>
                        <p className="mb-0 text-xs leading-tight text-slate-400">
                          Projects
                        </p>
                      </td>
                      <td className="p-2 text-sm leading-normal text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="bg-gradient-to-tl from-green-600 to-lime-400 px-2.5 text-xs rounded-1.8 py-1.4 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">
                          Online
                        </span>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="text-xs font-semibold leading-tight text-slate-400">
                          19/09/17
                        </span>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <a
                          href="javascript:;"
                          className="text-xs font-semibold leading-tight text-slate-400"
                        >
                          {' '}
                          Edit{' '}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <div className="flex px-2 py-1">
                          <div>
                            <div>
                              <img
                                src="../../images/dashboard/usr-2.png"
                                className="inline-flex items-center justify-center mr-4 text-sm text-white transition-all duration-200 ease-soft-in-out h-9 w-9 rounded-xl"
                                alt="user2"
                              />
                            </div>
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-0 text-sm leading-normal">
                              Michael Levi
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400">
                              michael@creative-tim.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <p className="mb-0 text-xs font-semibold leading-tight">
                          Programator
                        </p>
                        <p className="mb-0 text-xs leading-tight text-slate-400">
                          Developer
                        </p>
                      </td>
                      <td className="p-2 text-sm leading-normal text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="bg-gradient-to-tl from-green-600 to-lime-400 px-2.5 text-xs rounded-1.8 py-1.4 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">
                          Online
                        </span>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="text-xs font-semibold leading-tight text-slate-400">
                          24/12/08
                        </span>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <a
                          href="javascript:;"
                          className="text-xs font-semibold leading-tight text-slate-400"
                        >
                          {' '}
                          Edit{' '}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <div className="flex px-2 py-1">
                          <div>
                            <img
                              src="../../images/dashboard/usr-4.jpg"
                              className="inline-flex items-center justify-center mr-4 text-sm text-white transition-all duration-200 ease-soft-in-out h-9 w-9 rounded-xl"
                              alt="user2"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-0 text-sm leading-normal">
                              Richard Gran
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400">
                              richard@creative-tim.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <p className="mb-0 text-xs font-semibold leading-tight">
                          Manager
                        </p>
                        <p className="mb-0 text-xs leading-tight text-slate-400">
                          Executive
                        </p>
                      </td>
                      <td className="p-2 text-sm leading-normal text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="bg-gradient-to-tl from-slate-600 to-slate-300 px-2.5 text-xs rounded-1.8 py-1.4 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">
                          Offline
                        </span>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <span className="text-xs font-semibold leading-tight text-slate-400">
                          04/10/21
                        </span>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b whitespace-nowrap shadow-transparent">
                        <a
                          href="javascript:;"
                          className="text-xs font-semibold leading-tight text-slate-400"
                        >
                          {' '}
                          Edit{' '}
                        </a>
                      </td>
                    </tr>
                    <tr>
                      <td className="p-2 align-middle bg-transparent border-b-0 whitespace-nowrap shadow-transparent">
                        <div className="flex px-2 py-1">
                          <div>
                            <img
                              src="../../images/dashboard/usr-3.jpg"
                              className="inline-flex items-center justify-center mr-4 text-sm text-white transition-all duration-200 ease-soft-in-out h-9 w-9 rounded-xl"
                              alt="user2"
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h6 className="mb-0 text-sm leading-normal">
                              Miriam Eric
                            </h6>
                            <p className="mb-0 text-xs leading-tight text-slate-400">
                              miriam@creative-tim.com
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b-0 whitespace-nowrap shadow-transparent">
                        <p className="mb-0 text-xs font-semibold leading-tight">
                          Programtor
                        </p>
                        <p className="mb-0 text-xs leading-tight text-slate-400">
                          Developer
                        </p>
                      </td>
                      <td className="p-2 text-sm leading-normal text-center align-middle bg-transparent border-b-0 whitespace-nowrap shadow-transparent">
                        <span className="bg-gradient-to-tl from-slate-600 to-slate-300 px-2.5 text-xs rounded-1.8 py-1.4 inline-block whitespace-nowrap text-center align-baseline font-bold uppercase leading-none text-white">
                          Offline
                        </span>
                      </td>
                      <td className="p-2 text-center align-middle bg-transparent border-b-0 whitespace-nowrap shadow-transparent">
                        <span className="text-xs font-semibold leading-tight text-slate-400">
                          14/09/20
                        </span>
                      </td>
                      <td className="p-2 align-middle bg-transparent border-b-0 whitespace-nowrap shadow-transparent">
                        <a
                          href="javascript:;"
                          className="text-xs font-semibold leading-tight text-slate-400"
                        >
                          {' '}
                          Edit{' '}
                        </a>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div
              className="w-full max-w-full mt-0 mb-6 md:mb-0 md:w-1/2 md:flex-none lg:w-full
                         lg:flex-none"
            >
              <div className="border-black/12.5 shadow-soft-xl relative flex min-w-0 flex-col break-words rounded-2xl border-0 border-solid bg-white bg-clip-border p-3">
                <img
                  src="../../images/dashboard/diagrams.png"
                  className=""
                  alt="user2"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
