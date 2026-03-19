@extends('layouts.app')

@section('title', 'Buyer')
@section('heading', 'Buyer')

@section('content')
<table class="table table-bordered mb-4">
  <col style="width: 1%">
  <tr>
    <th class="text-nowrap">ID</th>
    <td>{{ $buyer->id }}</td>
  </tr>
  <tr>
    <th>Name</th>
    <td>
      <x-inline-edit-text name="name" :action="route('portal.buyers.update', $buyer)" :value="$buyer->name" maxlength="255" required>
        {{ $buyer->name }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th class="text-nowrap">Address 1</th>
    <td>
      <x-inline-edit-text name="address1" :action="route('portal.buyers.update', $buyer)" :value="$buyer->address1" maxlength="255">
        {{ $buyer->address1 ?? '-' }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th class="text-nowrap">Address 2</th>
    <td>
      <x-inline-edit-text name="address2" :action="route('portal.buyers.update', $buyer)" :value="$buyer->address2" maxlength="255">
        {{ $buyer->address2 ?? '-' }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th class="text-nowrap">Address 3</th>
    <td>
      <x-inline-edit-text name="address3" :action="route('portal.buyers.update', $buyer)" :value="$buyer->address3" maxlength="255">
        {{ $buyer->address3 ?? '-' }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th class="text-nowrap">Town/City</th>
    <td>
      <x-inline-edit-text name="town_city" :action="route('portal.buyers.update', $buyer)" :value="$buyer->town_city" maxlength="100">
        {{ $buyer->town_city ?? '-' }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th class="text-nowrap">County</th>
    <td>
      <x-inline-edit-text name="state_province_county" :action="route('portal.buyers.update', $buyer)" :value="$buyer->state_province_county" maxlength="100">
        {{ $buyer->state_province_county ?? '-' }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th class="text-nowrap">Postal Code</th>
    <td>
      <x-inline-edit-text name="zip_postal_code" :action="route('portal.buyers.update', $buyer)" :value="$buyer->zip_postal_code" maxlength="20">
        {{ $buyer->zip_postal_code ?? '-' }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th>Country</th>
    <td>
      <x-inline-edit-select name="country" :action="route('portal.buyers.update', $buyer)" :value="$buyer->country" :options="$countries">
        {{ $buyer->getCountryName() }}
      </x-inline-edit-select>
    </td>
  </tr>
  <tr>
    <th>Extra</th>
    <td>
      <x-inline-edit-text name="extra" :action="route('portal.buyers.update', $buyer)" :value="$buyer->extra" maxlength="255">
        {{ $buyer->extra ?? '-' }}
      </x-inline-edit-text>
    </td>
  </tr>
  <tr>
    <th class="text-nowrap">Auto Pay</th>
    <td>
      <x-inline-edit-checkbox name="auto_pay" :action="route('portal.buyers.update', $buyer)" :value="$buyer->auto_pay" />
    </td>
  </tr>
  <tr>
    <th>Actions</th>
    <td>
      <form action="{{ route('portal.buyers.destroy', $buyer) }}" method="POST" class="d-inline"
            data-confirm="Are you sure you want to delete this buyer?">
        @csrf
        @method('DELETE')
        <button type="submit" class="btn btn-danger btn-sm">Delete Buyer</button>
      </form>
    </td>
  </tr>
</table>

<h2>Lessons</h2>

<x-lesson-table
  :lessons="$lessons"
  :filterAction="route('portal.buyers.show', $buyer)"
  :buyerOptions="$buyerOptions"
  :studentOptions="$studentOptions"
  :clientOptions="$clientOptions"
  :completeFilter="$completeFilter"
  :paidFilter="$paidFilter"
  :buyerFilter="$buyerFilter"
  :studentFilter="$studentFilter"
  :clientFilter="$clientFilter"
  :startDateFilter="$startDateFilter"
  :endDateFilter="$endDateFilter"
/>
@endsection
