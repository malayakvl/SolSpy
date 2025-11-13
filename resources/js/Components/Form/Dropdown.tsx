import { Transition } from '@headlessui/react';
import { Link } from '@inertiajs/react';
import { createContext, useContext, useState } from 'react';

// Define the context type
interface DropDownContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggleOpen: () => void;
}

// Create context with proper typing
const DropDownContext = createContext<DropDownContextType | undefined>(undefined);

const Dropdown = ({ children }) => {
  const [open, setOpen] = useState(false);

  const toggleOpen = () => {
    setOpen(previousState => !previousState);
  };

  return (
    <DropDownContext.Provider value={{ open, setOpen, toggleOpen }}>
      <div className="relative">{children}</div>
    </DropDownContext.Provider>
  );
};

const Trigger = ({ children }) => {
  const context = useContext(DropDownContext);
  
  // Handle case where component is used outside of Dropdown
  if (!context) {
    throw new Error('Dropdown.Trigger must be used within a Dropdown');
  }
  
  const { open, setOpen, toggleOpen } = context;

  return (
    <>
      <div 
        onClick={toggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggleOpen();
          }
        }}
        role="button"
        tabIndex={0}
        aria-haspopup="true"
        aria-expanded={open}
      >
        {children}
      </div>

      {open && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          role="button"
          tabIndex={-1}
        ></div>
      )}
    </>
  );
};

const Content = ({
  align = 'right',
  width = '48',
  contentClasses = 'py-1 bg-white',
  children,
}) => {
  const context = useContext(DropDownContext);
  
  // Handle case where component is used outside of Dropdown
  if (!context) {
    throw new Error('Dropdown.Content must be used within a Dropdown');
  }
  
  const { open, setOpen } = context;

  let alignmentClasses = 'origin-top';

  if (align === 'left') {
    alignmentClasses = 'ltr:origin-top-left rtl:origin-top-right start-0';
  } else if (align === 'right') {
    alignmentClasses = 'ltr:origin-top-right rtl:origin-top-left end-0';
  }

  let widthClasses = '';

  if (width === '48') {
    widthClasses = 'w-48';
  }

  return (
    <>
      <Transition
        show={open}
        enter="transition ease-out duration-200"
        enterFrom="opacity-0 scale-95"
        enterTo="opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="opacity-100 scale-100"
        leaveTo="opacity-0 scale-95"
      >
        <div
          className={`absolute z-50 mt-2 rounded-md top-dropdown ${alignmentClasses} ${widthClasses}`}
          onClick={() => setOpen(false)}
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              setOpen(false);
            }
          }}
          role="button"
          tabIndex={-1}
        >
          <div
            className={
              `rounded-md ring-1 ring-black ring-opacity-5 dropdown-content`
            }
          >
            {children}
          </div>
        </div>
      </Transition>
    </>
  );
};

const DropdownLink = ({ className = '', children, ...props }: { className?: string; href: string; children: React.ReactNode; [key: string]: any }) => {
  return (
    <Link
      {...props}
      className={
        'block w-full px-4 py-2 text-start text-sm leading-5 text-gray-700 transition duration-150 ease-in-out hover:bg-purple-700 focus:bg-purple-100 focus:outline-none ' +
        className
      }
    >
      {children}
    </Link>
  );
};

Dropdown.Trigger = Trigger;
Dropdown.Content = Content;
Dropdown.Link = DropdownLink;

export default Dropdown;