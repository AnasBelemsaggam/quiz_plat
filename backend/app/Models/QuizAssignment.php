<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class QuizAssignment extends Model
{
    protected $fillable = ['quiz_id', 'module_id', 'group_id', 'student_id'];

    public function quiz()
    {
        return $this->belongsTo(Quiz::class);
    }

    public function module()
    {
        return $this->belongsTo(Module::class);
    }

    public function group()
    {
        return $this->belongsTo(Group::class);
    }

    public function student()
    {
        return $this->belongsTo(\App\Models\User::class, 'student_id');
    }
}
