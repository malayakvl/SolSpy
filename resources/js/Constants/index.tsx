export enum PaginationType {
  FILIALS = 'filials',
  ROLES = 'roles',
  CUSTOMERS = 'customers',
  MCATEGORIES = 'mcategories',
  PRODUCERS = 'producers',
  MATERIALS = 'materials',
  INCOMINGINVOICES = 'incominginvoices',
  OUTGOINGINVOICES = 'outgoinginvoices',
  CHANGEINVOICES = 'changeinvoices',
  CURRENCY = 'currencies',
  CABINETS = 'cabinets',
  SERVCATEGORIES = 'servcategories',
  UNITS = 'units',
  PATIENTS = 'patients',
  PATIENTSTATUSES = 'patientstatuses',
  STORES = 'stores',
}
export const TableHeaders = {
  [PaginationType.FILIALS]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.address', className: '' },
    { titleKey: 'datatable.inn', className: '' },
    { titleKey: 'datatable.edrpou', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.ROLES]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.CUSTOMERS]: [
    { titleKey: 'datatable.photo', className: '' },
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.role', className: '' },
    { titleKey: 'datatable.phone', className: '' },
    { titleKey: 'datatable.inn', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.STORES]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.filial', className: '' },
    { titleKey: 'datatable.ceo_store', className: '' },
    { titleKey: 'datatable.address', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.MCATEGORIES]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.producer', className: '' },
    { titleKey: 'datatable.percent', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.PRODUCERS]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.CABINETS]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.filial', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.MATERIALS]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.price', className: '' },
    { titleKey: 'datatable.retailprice', className: '' },
    { titleKey: 'datatable.percent', className: '' },
    { titleKey: 'datatable.category', className: '' },
    { titleKey: 'datatable.producer', className: '' },
    { titleKey: 'datatable.unit', className: '' },
    { titleKey: 'datatable.size', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.INCOMINGINVOICES]: [
    { titleKey: 'datatable.number', className: '' },
    { titleKey: 'datatable.date', className: '' },
    { titleKey: 'datatable.status', className: '' },
    { titleKey: 'datatable.store', className: '' },
    { titleKey: 'datatable.producer', className: '' },
    { titleKey: 'datatable.customercreate', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.CHANGEINVOICES]: [
    { titleKey: 'datatable.number', className: '' },
    { titleKey: 'datatable.date', className: '' },
    { titleKey: 'datatable.status', className: '' },
    { titleKey: 'datatable.storefrom', className: '' },
    { titleKey: 'datatable.storeto', className: '' },
    { titleKey: 'datatable.customer', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.OUTGOINGINVOICES]: [
    { titleKey: 'datatable.number', className: '' },
    { titleKey: 'datatable.date', className: '' },
    { titleKey: 'datatable.status', className: '' },
    { titleKey: 'datatable.store', className: '' },
    { titleKey: 'datatable.producer', className: '' },
    { titleKey: 'datatable.customer', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.CURRENCY]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.symbol', className: '' },
    { titleKey: 'datatable.rate', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.SERVCATEGORIES]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.PATIENTSTATUSES]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.discount', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
  [PaginationType.UNITS]: [
    { titleKey: 'datatable.name', className: '' },
    { titleKey: 'datatable.actions', className: 'text-right' },
  ],
};
export const InvoiceStatuses = [
  { id: 'new', value: 'new' },
  { id: 'issued', value: 'issued' },
  { id: 'incoming', value: 'incoming' },
  { id: 'outgoing', value: 'outgoing' },
  { id: 'move', value: 'move' },
];

export const SchedulerStatuses = [
  { name: 'planned', color: '#4c95f5' },
  { name: 'confirm', color: '#eb9d17' },
  { name: 'done', color: '#7d17eb' },
  { name: 'missed', color: '#9a8d11' },
  { name: 'postponed', color: '#17abab' },
  { name: 'noanswer', color: '#ff5722' },
  { name: 'late', color: '#ff21ed' },
  { name: 'inclicnic', color: '#2971ba' },
  { name: 'incabinet', color: '#188c0b' },
  { name: 'decline', color: '#222223' },
];

export const excludeToothEffect = [
  'paradont_health',
  'paradont_all_health',
  'parodontit',
  'inflamed_gums',
  'significantly_gums',
  'no_inflammatory_process',
];

export const emptyFormula = {
  tooth18: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,
    psr1: 0,
    psr2: 0,
    psr3: 0,
    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // gums process
    paradont_health: false,
    paradont_all_health: false,
    paradontit: false,
    paradontit_st1: false,
    paradontit_st2: false,
    paradontit_st3: false,
    paradontit_all_st1: false,
    paradontit_all_st2: false,
    paradontit_all_st3: false,
    inflamed_gums: false,
    significantly_gums: false,
    no_inflammatory_process: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth17: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth16: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth15: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth14: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth13: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth12: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth11: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth21: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth22: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth23: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth24: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth25: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth26: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth27: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth28: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth48: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth47: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth46: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth45: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth44: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth43: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth42: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth41: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth31: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth32: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth33: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth34: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth35: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth36: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth37: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth38: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth55: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth54: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth53: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth52: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth51: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth61: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth62: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth63: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth64: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth65: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth85: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth84: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth83: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth82: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth81: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth71: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth72: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth73: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth74: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
  tooth75: {
    active: false,
    show: false,
    change_color: false,
    fissure: false,

    // caries vars
    caries: false,
    caries_top: false,
    caries_bottom: false,
    caries_left: false,
    caries_right: false,
    caries_center: false,

    cervical_caries: false,
    tartar: false,
    pulpit: false,
    // channel not sealed
    channel_not_sealed: false,
    channel_top_sealed: false,
    channel_part_sealed: false,
    channel_class: '',
    // periodontit
    periodontit: false,
    periodontit_stage: '',
    periodontit_st1: false,
    periodontit_st2: false,
    periodontit_st3: false,
    periodontit_class: '',
    inflamed_gums: false,
    significantly_gums: false,

    // seal vars
    seal: false,
    seal_top: false,
    seal_top_color: '',
    seal_bottom: false,
    seal_bottom_color: '',
    seal_left: false,
    seal_left_color: '',
    seal_right: false,
    seal_right_color: '',
    seal_center: false,
    seal_center_color: '',

    // seal cervical vars
    seal_cervical: false,
    seal_cervical_color: '',

    // vinir vars
    vinir: false,
    vinir_color: '',
    // vinir vars
    temporary_crown: false,
    // ceramic crown
    ceramic_crown: false,
    ceramic_crown_color: '',
    // metaloceramic crown
    mceramic_crown: false,
    mceramic_crown_color: '',
    // metalic crown
    metalic_crown: false,
    metalic_crown_color: '',
    // zirconia crown
    zirconia_crown: false,
    zirconia_crown_color: '',
    // pin
    pin: false,
    apex: false,
    absent: false,
    culttab: false,
    abutment: false,
    abutment_implant: false,
    shaper: false,
    implant: false,
    // paradontit
    parodontit: false,
    parodontit_stage: '',
    parodontit_stage_all: false,
  },
};
