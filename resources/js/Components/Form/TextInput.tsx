import { forwardRef, useRef } from 'react';

export default forwardRef(function TextInput(
  { type = 'text', className = '', isFocused = false, ...props },
  ref
) {
  const localRef = useRef(null);

  // useImperativeHandle(ref, () => ({
  //     focus: () => localRef.current?.focus(),
  // }));
  //
  // useEffect(() => {
  //     if (isFocused) {
  //         localRef.current?.focus();
  //     }
  // }, [isFocused]);
  // console.log(localRef.current.hasOwnProperty())

  return (
    <div>
      <input
        {...props}
        type={type}
        className={
          'rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 ' +
          className
        }
        ref={localRef}
      />
    </div>
  );
});
