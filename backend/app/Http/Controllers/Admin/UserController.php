<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,teacher,student',
            'module_id' => 'nullable|exists:modules,id',
            'group_id' => 'nullable|exists:groups,id',
        ]);

        $data['password'] = Hash::make($data['password']);

        return User::create($data);
    }
    public function index()
    {
        return response()->json(
            User::query()
                ->select('id', 'name', 'email', 'role', 'module_id', 'group_id', 'created_at')
                ->orderByDesc('id')
                ->get()
        );
    }

    public function update(Request $r, User $user)
    {
        $data = $r->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => ['sometimes', 'nullable', 'string', 'min:6'],
            'role' => ['sometimes', Rule::in(['admin', 'teacher', 'student'])],
            'module_id' => ['sometimes', 'nullable', 'exists:modules,id'],
            'group_id' => ['sometimes', 'nullable', 'exists:groups,id'],
        ]);

        if (array_key_exists('password', $data)) {
            if ($data['password']) {
                $data['password'] = bcrypt($data['password']);
            } else {
                unset($data['password']); // if empty string/null don’t overwrite
            }
        }

        $user->update($data);

        return response()->json($user->fresh()->only([
            'id',
            'name',
            'email',
            'role',
            'module_id',
            'group_id',
            'created_at'
        ]));
    }

    public function destroy(Request $r, User $user)
    {
        // prevent deleting yourself
        if ($user->id === $r->user()->id) {
            return response()->json(['message' => "You can't delete your own account"], 422);
        }

        $user->delete();
        return response()->json(['deleted' => true]);
    }
}
