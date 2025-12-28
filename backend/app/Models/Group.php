<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Group extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'module_id',
    ];

    public function module()
    {
        return $this->belongsTo(Module::class);
    }
}
