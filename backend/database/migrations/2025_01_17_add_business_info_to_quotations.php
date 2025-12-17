<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->string('business_name')->nullable()->after('logo_url');
            $table->text('business_address')->nullable()->after('business_name');
            $table->string('business_city')->nullable()->after('business_address');
            $table->string('business_state')->nullable()->after('business_city');
            $table->string('business_postal')->nullable()->after('business_state');
            $table->string('business_phone')->nullable()->after('business_postal');
            $table->string('business_email')->nullable()->after('business_phone');
        });
    }

    public function down(): void
    {
        Schema::table('quotations', function (Blueprint $table) {
            $table->dropColumn([
                'business_name',
                'business_address',
                'business_city',
                'business_state',
                'business_postal',
                'business_phone',
                'business_email',
            ]);
        });
    }
};
