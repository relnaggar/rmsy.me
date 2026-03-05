@extends('layouts.app')

@section('title', 'Add Buyer')
@section('heading', 'Add Buyer')

@section('content')
<form method="POST" action="{{ route('portal.buyers.store') }}">
  @csrf

  <x-form-input name="id" label="ID" required maxlength="100" />
  <x-form-input name="name" label="Name" required maxlength="255" />
  <x-form-input name="address1" label="Address Line 1" maxlength="255" />
  <x-form-input name="address2" label="Address Line 2" maxlength="255" />
  <x-form-input name="address3" label="Address Line 3" maxlength="255" />
  <x-form-input name="town_city" label="Town/City" maxlength="100" />
  <x-form-input name="state_province_county" label="State/Province/County" maxlength="100" />
  <x-form-input name="zip_postal_code" label="Postal Code" maxlength="20" />
  <x-form-input name="country" label="Country" type="select" value="GB" :options="$countries" required />
  <x-form-input name="extra" label="Extra Info" maxlength="255" />

  <div class="mb-3 form-check">
    <input type="hidden" name="auto_pay" value="0">
    <input type="checkbox" class="form-check-input" id="auto_pay" name="auto_pay" value="1" {{ old('auto_pay') ? 'checked' : '' }}>
    <label for="auto_pay" class="form-check-label">Automatic Payments</label>
  </div>

  <button type="submit" class="btn btn-primary">Add Buyer</button>
  <a href="{{ route('portal.buyers.index') }}" class="btn btn-secondary">Cancel</a>
</form>
@endsection
