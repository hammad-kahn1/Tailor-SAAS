<?php

use Illuminate\Support\Facades\Schedule;

// Send delivery reminders for orders due in 1 day
Schedule::command('app:send-delivery-reminders')->dailyAt('09:00');
