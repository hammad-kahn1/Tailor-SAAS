<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderReadyNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public Order $order) {}

    public function via(object $notifiable): array { return ['mail']; }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Order is Ready — '.$this->order->order_number)
            ->greeting('Hello, '.$notifiable->full_name.'!')
            ->line('Great news! Your order **'.$this->order->order_number.'** is ready for pickup.')
            ->line('**Delivery Date:** '.$this->order->delivery_date->format('d M Y'))
            ->line('**Remaining Balance:** PKR '.number_format($this->order->remaining_payment, 2))
            ->action('View Order', url('/orders/'.$this->order->id))
            ->line('Thank you for choosing '.$this->order->tenant->name.'!');
    }
}
