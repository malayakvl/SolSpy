declare namespace State {
    interface Root {
        layouts: Layouts;
        staff: Staffs;
    }

    type Layouts = Layouts.Root;
    type Staffs = Staffs.Root
}
