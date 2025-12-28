<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Module;
use App\Models\Group;

class ModuleGroupSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $module = Module::create(['name' => 'Informatique']);

        Group::create(['name' => 'Groupe A', 'module_id' => $module->id]);
        Group::create(['name' => 'Groupe B', 'module_id' => $module->id]);   //
    }
}
