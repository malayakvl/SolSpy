declare namespace Forumula {
    interface Root {
        teethType: string;
        activeTab: {
            inventory: TabTypes;
        };
        allTeeth: boolean;
        tooth18: boolean;
        teethDiagnozes: {
            tooth18: any,
            tooth17: any,
            tooth16: any,
            tooth15: any
        };
        diagnoze: any;

    }

    interface TabTypes {
        tab: string;
    }
}
