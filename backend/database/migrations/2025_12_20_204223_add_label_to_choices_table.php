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
        Schema::table('choices', function (Blueprint $table) {
            if (!Schema::hasColumn('choices', 'label')) {
                $table->string('label')->after('question_id');
            }
            if (!Schema::hasColumn('choices', 'is_correct')) {
                $table->boolean('is_correct')->default(false)->after('label');
            }
        });
    }

    public function down(): void
    {
        Schema::table('choices', function (Blueprint $table) {
            if (Schema::hasColumn('choices', 'label')) {
                $table->dropColumn('label');
            }
            if (Schema::hasColumn('choices', 'is_correct')) {
                $table->dropColumn('is_correct');
            }
        });
    }
};
