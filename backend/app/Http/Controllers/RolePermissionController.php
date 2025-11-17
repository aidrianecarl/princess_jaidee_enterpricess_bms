<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\Permission;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class RolePermissionController extends Controller
{
    // Get all roles
    public function getRoles()
    {
        $roles = Role::with('permissions')->paginate(15);
        return response()->json($roles, 200);
    }

    // Get all permissions
    public function getPermissions()
    {
        $permissions = Permission::paginate(15);
        return response()->json($permissions, 200);
    }

    // Assign role to user
    public function assignRoleToUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::find($request->user_id);
        $user->roles()->attach($request->role_id);

        return response()->json([
            'message' => 'Role assigned successfully',
        ], 200);
    }

    // Remove role from user
    public function removeRoleFromUser(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'user_id' => 'required|exists:users,id',
            'role_id' => 'required|exists:roles,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $user = User::find($request->user_id);
        $user->roles()->detach($request->role_id);

        return response()->json([
            'message' => 'Role removed successfully',
        ], 200);
    }

    // Assign permission to role
    public function assignPermissionToRole(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'role_id' => 'required|exists:roles,id',
            'permission_id' => 'required|exists:permissions,id',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $role = Role::find($request->role_id);
        $role->permissions()->attach($request->permission_id);

        return response()->json([
            'message' => 'Permission assigned successfully',
        ], 200);
    }
}
