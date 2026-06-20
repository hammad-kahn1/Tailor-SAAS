<?php

namespace Database\Seeders;

use App\Models\Customer;
use App\Models\Measurement;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\TailorAssignment;
use App\Models\Tenant;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // ── 1. Super Admin ──────────────────────────────────────────────
        User::updateOrCreate(
            ['email' => 'admin@tailorsaas.com'],
            [
                'name'      => 'TailorSaaS Admin',
                'password'  => Hash::make('password'),
                'role'      => 'super_admin',
                'is_active' => true,
            ]
        );

        // ── 2. Demo Tenant ──────────────────────────────────────────────
        $tenant = Tenant::updateOrCreate(
            ['slug' => 'royal-stitches'],
            [
                'name'               => 'Royal Stitches',
                'email'              => 'info@royalstitches.test',
                'phone'              => '0300-1234567',
                'address'            => 'Shop 12, Main Market, Lahore',
                'subscription_plan'  => 'professional',
                'subscription_status'=> 'active',
                'is_active'          => true,
                'settings'           => ['currency' => 'PKR', 'timezone' => 'Asia/Karachi', 'receipt_footer' => 'Thank you for your business!'],
            ]
        );

        // ── 3. Tenant Users ─────────────────────────────────────────────
        $owner = User::updateOrCreate(['email' => 'owner@royalstitches.test'], [
            'name' => 'Ahmed Khan', 'password' => Hash::make('password'),
            'role' => 'shop_owner', 'tenant_id' => $tenant->id, 'is_active' => true,
        ]);
        $manager = User::updateOrCreate(['email' => 'manager@royalstitches.test'], [
            'name' => 'Sara Malik', 'password' => Hash::make('password'),
            'role' => 'manager', 'tenant_id' => $tenant->id, 'is_active' => true,
        ]);
        $tailor1 = User::updateOrCreate(['email' => 'tailor1@royalstitches.test'], [
            'name' => 'Usman Ali', 'password' => Hash::make('password'),
            'role' => 'tailor', 'tenant_id' => $tenant->id, 'is_active' => true,
        ]);
        $tailor2 = User::updateOrCreate(['email' => 'tailor2@royalstitches.test'], [
            'name' => 'Bilal Raza', 'password' => Hash::make('password'),
            'role' => 'tailor', 'tenant_id' => $tenant->id, 'is_active' => true,
        ]);
        User::updateOrCreate(['email' => 'rec@royalstitches.test'], [
            'name' => 'Fatima Shah', 'password' => Hash::make('password'),
            'role' => 'receptionist', 'tenant_id' => $tenant->id, 'is_active' => true,
        ]);

        // ── 4. Customers ────────────────────────────────────────────────
        $customers = [
            ['full_name' => 'Hassan Raza',   'phone' => '0311-1234567', 'gender' => 'male',   'notes' => 'Prefers slim fit'],
            ['full_name' => 'Zara Ahmed',    'phone' => '0322-2345678', 'gender' => 'female', 'notes' => 'Regular customer'],
            ['full_name' => 'Imran Sheikh',  'phone' => '0333-3456789', 'gender' => 'male',   'notes' => 'Suit orders only'],
            ['full_name' => 'Ayesha Noor',   'phone' => '0344-4567890', 'gender' => 'female', 'notes' => null],
            ['full_name' => 'Kamran Tariq',  'phone' => '0355-5678901', 'gender' => 'male',   'notes' => 'Special fabric supplied by customer'],
        ];

        $createdCustomers = [];
        foreach ($customers as $data) {
            $createdCustomers[] = Customer::updateOrCreate(
                ['phone' => $data['phone'], 'tenant_id' => $tenant->id],
                array_merge($data, ['tenant_id' => $tenant->id, 'created_by' => $owner->id])
            );
        }

        // ── 5. Measurements ─────────────────────────────────────────────
        Measurement::updateOrCreate(
            ['customer_id' => $createdCustomers[0]->id, 'type' => 'shirt', 'version' => 1],
            [
                'tenant_id'   => $tenant->id,
                'data'        => ['chest' => 40, 'waist' => 34, 'shoulder' => 17, 'sleeve' => 26, 'neck' => 15, 'length' => 30],
                'recorded_by' => $owner->id,
            ]
        );

        Measurement::updateOrCreate(
            ['customer_id' => $createdCustomers[2]->id, 'type' => 'suit', 'version' => 1],
            [
                'tenant_id'   => $tenant->id,
                'data'        => ['coat' => ['chest' => 42, 'waist' => 36, 'shoulder' => 18, 'sleeve' => 27, 'neck' => 16, 'length' => 31], 'trouser' => ['waist' => 36, 'hip' => 40, 'length' => 42, 'bottom' => 16]],
                'recorded_by' => $manager->id,
            ]
        );

        // ── 6. Orders ───────────────────────────────────────────────────
        $orderData = [
            ['customer' => $createdCustomers[0], 'status' => 'in_progress', 'advance' => 2000, 'total' => 5000, 'items' => [['Shirt', 2, 1500], ['Pant', 1, 2000]], 'days' => 7,  'tailor' => $tailor1],
            ['customer' => $createdCustomers[1], 'status' => 'ready',       'advance' => 1500, 'total' => 3000, 'items' => [['Shirt', 1, 1500], ['Dupatta', 1, 1500]], 'days' => 3, 'tailor' => $tailor2],
            ['customer' => $createdCustomers[2], 'status' => 'pending',     'advance' => 5000, 'total' => 15000,'items' => [['Suit', 1, 15000]], 'days' => 14, 'tailor' => null],
            ['customer' => $createdCustomers[3], 'status' => 'delivered',   'advance' => 2000, 'total' => 2000, 'items' => [['Shalwar Kameez', 1, 2000]], 'days' => -2, 'tailor' => $tailor1],
            ['customer' => $createdCustomers[4], 'status' => 'assigned',    'advance' => 1000, 'total' => 3500, 'items' => [['Waistcoat', 1, 3500]], 'days' => 5, 'tailor' => $tailor2],
        ];

        foreach ($orderData as $od) {
            $number = Order::generateOrderNumber();
            $order  = Order::updateOrCreate(
                ['tenant_id' => $tenant->id, 'customer_id' => $od['customer']->id],
                [
                    'order_number'      => $number,
                    'status'            => $od['status'],
                    'total_price'       => $od['total'],
                    'advance_payment'   => $od['advance'],
                    'remaining_payment' => $od['total'] - $od['advance'],
                    'delivery_date'     => now()->addDays($od['days'])->format('Y-m-d'),
                    'created_by'        => $owner->id,
                ]
            );

            foreach ($od['items'] as [$name, $qty, $price]) {
                OrderItem::updateOrCreate(
                    ['order_id' => $order->id, 'item_name' => $name],
                    ['tenant_id' => $tenant->id, 'quantity' => $qty, 'unit_price' => $price, 'subtotal' => $qty * $price]
                );
            }

            if ($od['advance'] > 0) {
                Payment::updateOrCreate(
                    ['order_id' => $order->id, 'type' => 'advance'],
                    ['tenant_id' => $tenant->id, 'amount' => $od['advance'], 'method' => 'cash', 'received_by' => $owner->id, 'paid_at' => now()]
                );
            }

            if ($od['tailor']) {
                TailorAssignment::updateOrCreate(
                    ['order_id' => $order->id],
                    ['tenant_id' => $tenant->id, 'tailor_id' => $od['tailor']->id, 'assigned_by' => $owner->id, 'status' => in_array($od['status'], ['in_progress']) ? 'in_progress' : (in_array($od['status'], ['delivered','ready']) ? 'completed' : 'assigned')]
                );
            }
        }

        $this->command->info('✅ Demo data seeded — Royal Stitches tenant with 5 customers & 5 orders.');
    }
}
