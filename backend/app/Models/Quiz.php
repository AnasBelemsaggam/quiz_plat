<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Quiz extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'duration_minutes',
        'module_id',
        'group_id',
        'teacher_id',
        'is_published',
    ];

    public function questions()
    {
        return $this->hasMany(Question::class);
    }
    public function teacher()
    {
        return $this->belongsTo(User::class, 'teacher_id');
    }
    public function module()
    {
        return $this->belongsTo(Module::class);
    }
    public function group()
    {
        return $this->belongsTo(Group::class);
    }
    public function assignments()
    {
        return $this->hasMany(QuizAssignment::class);
    }
}
