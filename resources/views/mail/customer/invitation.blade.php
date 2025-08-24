<x-mail::message>
# Invitation

Hello, {{$user->name}},<br>
you has been invited into clinic «{{$clinicName}}»<br>
Your registration data:<br>
Login: {{$user->email}}<br>
Password: {{$password}}<br>

<x-mail::button :url="$link">
Confirm Invite
</x-mail::button>

Thanks,<br>
{{ config('app.name') }}
</x-mail::message>
