@extends('layouts.app')

@section('title', 'Edit Buyer')
@section('heading', 'Edit Buyer')

@section('content')
<form method="POST" action="{{ route('portal.buyers.update', $buyer) }}">
  @csrf
  @method('PUT')

  <x-form-input name="id" label="ID" :value="$buyer->id" :readonly="true" />
  <x-form-input name="name" label="Name" :value="$buyer->name" :required="true" maxlength="255" />
  <x-form-input name="address1" label="Address Line 1" :value="$buyer->address1" maxlength="255" />
  <x-form-input name="address2" label="Address Line 2" :value="$buyer->address2" maxlength="255" />
  <x-form-input name="address3" label="Address Line 3" :value="$buyer->address3" maxlength="255" />
  <x-form-input name="town_city" label="Town/City" :value="$buyer->town_city" maxlength="100" />
  <x-form-input name="state_province_county" label="State/Province/County" :value="$buyer->state_province_county" maxlength="100" />
  <x-form-input name="zip_postal_code" label="Postal Code" :value="$buyer->zip_postal_code" maxlength="20" />
  <x-form-input name="country" label="Country" type="select" :value="$buyer->country" :options="$countries" :required="true" />
  <x-form-input name="extra" label="Extra Info" :value="$buyer->extra" maxlength="255" />

  <button type="submit" class="btn btn-primary">Update Buyer</button>
  <a href="{{ route('portal.buyers.index') }}" class="btn btn-secondary">Cancel</a>
</form>
@endsection
