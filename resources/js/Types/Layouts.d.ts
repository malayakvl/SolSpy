declare namespace Layouts {
    interface Root {
        pagination: {
            validators: Pagination;
        };
        isSidebarOpen: boolean;
        isMobileDevice: boolean | null;
        isDataLoading: boolean;
        toasts: Toast[];
        checkedIds: checkedIds[];
        modalConfirmationMeta: ModalConfirmationMeta | null;
        modalConfirmationDeletePeriodMeta: ModalDeletePeriodMeta | null;
        modalConfirmationSetupPeriodMeta: ModalConfirmPeriodMeta | null;
        deletePeriod: null;
        setupPeriod: null;
        deletePeriodHidePopup: boolean;
        modalVariantMeta: ModalVariantMeta | null;
        switchHeader: boolean;
        switchToggled: boolean;
        showTextingMenu: boolean;
        showProfileMenu: boolean;
        selectedLng: string;
        showEmailNotification: boolean;
    }

    interface TabTypes {
        tab: string;
    }

    interface Pagination {
        limit: number;
        offset: number;
        sort: string;
        column: string;
        query: string;
        filters?: any;
        meta?: Meta;
    }
    interface checkedIds {
        id: number;
        checked: boolean;
    }

    // interface Filters {
    //     assetCode?: string;
    //     assetcategoryCode?: Type.AssetCategories;
    //     subComponentTypeId?: number | 'unassigned' | null;
    //     year?: string;
    //     startTime?: Type.Moment;
    //     endTime?: Type.Moment;
    //     voltage?: CableVoltages;
    // }

    interface Toast {
        id: number;
        message: ToastMessage;
        type: 'error' | 'success' | 'info';
    }

    type ToastMessage = string | { key: string; options: object };

    interface Meta {
        preWarningSetting?: number;
    }

    interface ModalConfirmationMeta {
        titleKey?: string;
        onConfirm: () => void;
        onCancel?: () => void;
    }
    interface ModalVariantMeta {
        titleKey?: string;
        onConfirm: () => void;
        onCancel?: () => void;
    }
    interface ModalCalendlyMeta {
        titleKey?: string;
        onConfirm: () => void;
        onCancel?: () => void;
    }
    interface ModalConfirmPeriodMeta {
        titleKey?: string;
        onConfirm: () => void;
        onCancel?: () => void;
    }
    interface ModalDeletePeriodMeta {
        titleKey?: string;
        onConfirm: () => void;
        onCancel?: () => void;
    }
}
