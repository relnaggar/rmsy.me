@extends('layouts.app')

@section('title', 'Login')
@section('heading', 'Login')

@section('content')
<div class="col-12 col-sm-9 col-md-8 col-lg-7 col-xl-6">
  <form
    method="POST"
    action="{{ route('login') }}"
    class="needs-validation"
    novalidate
  >
    @csrf

    <x-form-input
      name="email"
      label="Email"
      type="email"
      :required="true"
      maxlength="254"
    />

    <x-form-input
      name="password"
      label="Password"
      type="password"
      :required="true"
      maxlength="72"
    />

    <div class="mb-3 form-check">
      <input
        type="checkbox"
        class="form-check-input"
        id="remember"
        name="remember"
      >
      <label class="form-check-label" for="remember">Remember me</label>
    </div>

    <button type="submit" class="btn btn-primary">Login</button>
  </form>
</div>
@endsection
