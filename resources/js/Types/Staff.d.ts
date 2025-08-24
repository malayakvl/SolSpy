declare namespace Staffs {
    interface Root {
        loading: boolean;
        isFetched: boolean;
        count: number;
        items: DataItem[];
        itemsByRoles: any;
        activeTab: string;
        roles: string[];
        suggestionsResult: any[];
        itemsResRoles: any;
    }

    interface DataItem {
        id: number;
        role_id: number | null;
        name: string;
        email: string;
        avatar: string;
        email_verified_at: any | null;
        pivot: any;
        default_clinic_id: number | null;
        photo: string | null;
        created_at: any;
        updated_at: any;
    }

    interface DataRoleItem {
        owner: any;
        staff: any[];
        permissions: any[];
        permissionByRoles: any;
    }
}
