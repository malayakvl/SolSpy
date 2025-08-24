import React, { useEffect, useState } from 'react';
import Lang from 'lang.js';
import { useDispatch, useSelector } from 'react-redux';
import { appLangSelector } from '../../Redux/Layout/selectors';
import lngScheduler from '../../Lang/Scheduler/translation';
import InputText from '../../Components/Form/InputText';
import { findPatientsAction } from '../../Redux/Scheduler/actions';
import { patientsDataSelector } from '../../Redux/Scheduler/selectors';
import { setSchedulePatientIdAction } from '../../Redux/Scheduler';

export default function EventPatient(values) {
  const dispatch = useDispatch();
  const appLang = useSelector(appLangSelector);
  const msg = new Lang({
    messages: lngScheduler,
    locale: appLang,
  });
  const patientsData = useSelector(patientsDataSelector);
  const [addPatient, setAddPatient] = useState(false);
  const [patientData, setPatientData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    patient: '',
    patientExistId: null
  });
  const [showPatientsList, setShowPatientsList] = useState(false)

  const handleChange = e => {
    const key = e.target.id;
    const value = e.target.value;
    setPatientData(values => ({
      ...values,
      [key]: value,
    }));
    // find clinic patients
    if (e.target.value.length > 3) {
      dispatch(findPatientsAction(e.target.value))
    }
  };

  const renderPatientsList = () => {
    if (patientsData.length === 0) {
      return;
    }

    return (
      <div className="d-patient-list">
        <ul>
          {patientsData.map((_p, _idx) => (
            <li key={_idx} onClick={() => {
              setShowPatientsList(false);
              patientData.patient =  `${_p.last_name} ${_p.first_name} ${_p.patronomic_name}`;
              patientData.patientExistId = _p.id;
              dispatch(setSchedulePatientIdAction(_p.id))

            }}>
              {_p.last_name} {_p.first_name} {_p.patronomic_name}
            </li>
          ))}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    setShowPatientsList(true);
  }, [patientsData])

  return (
    <div>
      <>
        <div className="mb-0 relative">
          {/*<label className="control-label text-sm">{msg.get('scheduler.patient')}</label>*/}
          <InputText
            name={'patient'}
            values={patientData}
            value={patientData.patient}
            onChange={handleChange}
            required
            label={msg.get('scheduler.patient')}
          />
          <>{showPatientsList && renderPatientsList()}</>
          {!addPatient && (
            <span
              onClick={() => {
                setAddPatient(!addPatient);
              }}
              className="ml-2 mt-1 text-gray-500 cursor-pointer add-patient"
              width={32}
              height={32}
            ></span>
          )}
        </div>
        {addPatient && (
          <div className="mt-4 bg-gray-50 px-2 rounded-md border pb-4">
            <h2>{msg.get('scheduler.add.patient')}</h2>
            <InputText
              name={'firstName'}
              values={patientData}
              value={patientData.firstName}
              onChange={handleChange}
              required
              label={msg.get('scheduler.form.firstName')}
            />
            <InputText
              name={'lastName'}
              values={patientData}
              value={patientData.lastName}
              onChange={handleChange}
              required
              label={msg.get('scheduler.form.lastName')}
            />
            <InputText
              name={'email'}
              values={patientData}
              value={patientData.email}
              onChange={handleChange}
              required
              label={msg.get('scheduler.form.email')}
            />
            <InputText
              name={'phone'}
              values={patientData}
              value={patientData.phone}
              onChange={handleChange}
              required
              label={msg.get('scheduler.form.phone')}
            />
          </div>
        )}
      </>
    </div>
  );
}
