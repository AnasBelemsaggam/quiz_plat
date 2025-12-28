
<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('groups', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->foreignId('module_id')->constrained('modules')->cascadeOnDelete();
            $table->timestamps();

            $table->unique(['name', 'module_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('groups');
    }
};
