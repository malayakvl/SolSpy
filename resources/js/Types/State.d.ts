declare namespace State {
    interface Root {
        layouts: Layouts;
        validators: Validators;
        user: User;
    }

    type Layouts = Layouts.Root;
    type Validators = Validators.Root;
    type User = User.Root;}
