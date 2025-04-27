<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add additional indexes for improved performance
        Schema::table('listings', function (Blueprint $table) {
            $table->index('status', 'idx_listings_status');
            $table->index('category', 'idx_listings_category');
            $table->index('location', 'idx_listings_location');
            $table->index('price', 'idx_listings_price');
        });
        
        Schema::table('bookings', function (Blueprint $table) {
            $table->index('payment_status', 'idx_bookings_payment_status');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->index('role', 'idx_users_role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Drop the added indexes
        Schema::table('listings', function (Blueprint $table) {
            $table->dropIndex('idx_listings_status');
            $table->dropIndex('idx_listings_category');
            $table->dropIndex('idx_listings_location');
            $table->dropIndex('idx_listings_price');
        });
        
        Schema::table('bookings', function (Blueprint $table) {
            $table->dropIndex('idx_bookings_payment_status');
        });
        
        Schema::table('users', function (Blueprint $table) {
            $table->dropIndex('idx_users_role');
        });
    }
};