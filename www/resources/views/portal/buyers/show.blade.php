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

<table class="table table-striped">
  <thead>
    <tr>
      <th>Date</th>
      <th>Student</th>
      <th>Client</th>
      <th>Duration</th>
      <th>Price</th>
      <th>Paid</th>
    </tr>
  </thead>
  <tbody>
    @forelse($buyer->lessons as $lesson)
      <tr>
        <td><a href="{{ route('portal.lessons.show', $lesson) }}">{{ $lesson->getFormattedDatetime() }}</a></td>
        <td>
          @if($lesson->student)
            <a href="{{ route('portal.students.show', $lesson->student) }}">{{ $lesson->student->name }}</a>
          @else
            -
          @endif
        </td>
        <td>
          @if($lesson->client)
            <a href="{{ route('portal.clients.show', $lesson->client) }}">{{ $lesson->client->name }}</a>
          @else
            -
          @endif
        </td>
        <td>{{ $lesson->duration_minutes }} min</td>
        <td>&pound;{{ $lesson->getFormattedPrice() }}</td>
        <td><x-paid-status :lesson="$lesson" /></td>
      </tr>
    @empty
      <tr>
        <td colspan="6" class="text-center">No lessons found for this buyer.</td>
      </tr>
    @endforelse
  </tbody>
</table>
@endsection
