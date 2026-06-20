<?php

namespace Database\Factories;

use App\Models\Customer;
use App\Models\Order;
use App\Models\Tenant;
use Illuminate\Database\Eloquent\Factories\Factory;

class OrderFactory extends Factory
{
    protected $model = Order::class;

    public function definition(): array
    {
        return [
            'tenant_id' => Tenant::factory(),
            'order_number' => 'ORD-' . $this->faker->unique()->numerify('########'),
            'customer_id' => Customer::factory(),
            'status' => Order::STATUS_PENDING,
            'total_price' => 5000,
            'advance_payment' => 1000,
            'remaining_payment' => 4000,
            'delivery_date' => now()->addDays(7),
        ];
    }
}
