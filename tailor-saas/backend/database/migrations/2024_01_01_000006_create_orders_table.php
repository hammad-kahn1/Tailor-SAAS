<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('tenant_id')->constrained('tenants')->cascadeOnDelete();
            $table->string('order_number')->unique(); // ORD-YYYYMMDD-NNNN
            $table->foreignId('customer_id')->constrained('customers');
            $table->foreignId('measurement_id')->nullable()->constrained('measurements')->nullOnDelete();
            $table->enum('status', ['pending','assigned','in_progress','ready','delivered','cancelled'])
                  ->default('pending');
            $table->decimal('total_price', 12, 2)->default(0);
            $table->decimal('advance_payment', 12, 2)->default(0);
            $table->decimal('remaining_payment', 12, 2)->default(0);
            $table->date('delivery_date');
            $table->text('notes')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();

            $table->index(['tenant_id', 'status']);
            $table->index(['tenant_id', 'delivery_date']);
            $table->index(['tenant_id', 'created_at']);
            $table->index(['tenant_id', 'customer_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
