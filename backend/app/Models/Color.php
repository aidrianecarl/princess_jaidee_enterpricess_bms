<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Color extends Model
{
    use HasFactory;

    protected $fillable = ['name', 'hex_code'];

    public function products()
    {
        return $this->hasMany(Product::class, 'color_id');
    }
}
