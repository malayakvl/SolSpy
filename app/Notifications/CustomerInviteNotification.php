<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use App\Models\User;

class CustomerInviteNotification extends Notification
{
    use Queueable;

    /**
     * Create a new notification instance.
     */
    public function __construct(User $user, $link, $clinicName, $userPassword)
    {
        $this->link = $link;
        $this->user = $user;
        $this->clinicName = $clinicName;
        $this->password = $userPassword;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Users Invitation')
            ->greeting(__('Hello :name,', ['name' => $this->user->name]))
            ->markdown('mail.customer.invitation', [
                'Users' => $this->user,
                'link' => $this->link,
                'clinicName' => $this->clinicName,
                'password' => $this->password
            ]);
    }

    /**
     * Get the array representation of the notification.
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
