export enum PaginationType {
  VALIDATORS = 'validators',
}
export const TableHeaders = {
  [PaginationType.VALIDATORS]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.address', className: '' },
    { titleKey: 'datatable.inn', className: '' },
    { titleKey: 'datatable.edrpou', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
};
