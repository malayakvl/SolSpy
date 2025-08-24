import React, { useEffect, useRef, useState } from 'react';
import { SketchPicker } from 'react-color';
import { useDispatch, useSelector } from 'react-redux';
import { paletterDataSelector } from '../../Redux/Staff/selectors';
import { setPaletteAction } from '../../Redux/Staff/';

interface Props {
  defaultColor: string;
  style: string | null;
  icon: string | null;
  name: string;
  label: string | null;
  placeholder: string | null;
  tips: string | null;
  disabled?: boolean;
}

const InputColor: React.FC<Props> = ({
  defaultColor,
  style,
  icon,
  name,
  label,
  placeholder,
  tips,
  disabled,
}) => {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedColor, setSelectedColor] = useState(defaultColor);
  const [_, setOpen] = useState(false);
  const node = useRef<HTMLDivElement>(null);
  const dispatch = useDispatch();
  const colorSettings = useSelector(paletterDataSelector);
  const handleFocus = (e: any) => {
    e.target.select();
  };

  const handleChange = () => {
    console.log('handle change');
  };

  const handleChangeComplete = (color: any) => {
    setSelectedColor(color.hex);
    dispatch(setPaletteAction({ color: color.hex, field: name }));
  };

  const handleClick = (e: any) => {
    if (node?.current?.contains(e.target)) {
      // inside colorpicker click
      setOpen(false);
      return;
    }
    // outside click
    setShowPicker(false);
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
    };
  }, [name]);

  useEffect(() => {
    setSelectedColor(colorSettings[name]);
  }, [colorSettings, name]);

  useEffect(() => {
    console.log(defaultColor);
    setSelectedColor(defaultColor);
  }, [defaultColor]);

  return (
    <div className={`${style}`} ref={node}>
      {label && (
        <label className="control-label" htmlFor={name}>
          {label}
        </label>
      )}
      <div className="position-relative relative">
        {icon && <i className={`f-icon ${icon}`} />}
        <input
          className="input-text color-control z-20"
          placeholder={placeholder || ''}
          type="text"
          onFocus={handleFocus}
          onChange={handleChange}
          value={selectedColor}
          name={name}
          disabled={disabled}
        />
        {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events,jsx-a11y/no-static-element-interactions */}
        <div
          className="color-palette"
          onClick={() => setShowPicker(!showPicker)}
        />
        <div className="color-picker-icon">
          <svg
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            {selectedColor}
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M7.35587 2.29952C5.78883 3.72976 3.16602 6.55035 3.16602
                              9.40737C3.16602 12 5.18564 14.6666 8.49935 14.6666C11.8131
                              14.6666 13.8327 12 13.8327 9.40737C13.8327 6.55035 11.2099
                              3.72976 9.64283 2.29952C8.98629 1.70029 8.01241 1.70029
                              7.35587 2.29952ZM9.02278 11.8674C8.61621 11.9466 8.35082
                              12.3404 8.43002 12.7469C8.50922 13.1535 8.90302 13.4189
                              9.30959 13.3397C11.0401 13.0026 12.158 11.6299 12.4823
                              10.1617C12.5717 9.75729 12.3162 9.35697 11.9118 9.26762C11.5073
                              9.17827 11.107 9.43371 11.0177 9.83818C10.8005 10.8214
                              10.0741 11.6626 9.02278 11.8674Z"
              fill={selectedColor}
            />
          </svg>
          {showPicker && (
            <div className="picker-block position-relative">
              <SketchPicker
                className={`site-picker`}
                onChangeComplete={handleChangeComplete}
                color={selectedColor}
              />
            </div>
          )}
        </div>
        {tips && <em className="input-tips">{tips}</em>}
      </div>
    </div>
  );
};

export { InputColor };
