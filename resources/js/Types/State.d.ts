declare namespace State {
    interface Root {
        layouts: Layouts;
        validators: Validators;
    }

    type Layouts = Layouts.Root;
    type Validators = Validators.Root;
    type Staffs = Staffs.Root
}
