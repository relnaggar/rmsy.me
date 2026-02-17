@extends('layouts.app')

@section('title', 'Payments')
@section('heading', 'Payments')

@section('content')
<div class="mb-4">
  <form action="{{ route('portal.payments.import') }}" method="POST" enctype="multipart/form-data" class="row g-3 align-items-end">
    @csrf
    <div class="col-auto">
      <label for="csv_file" class="form-label">Import CSV</label>
      <input type="file" class="form-control" id="csv_file" name="csv_file" accept=".csv" required>
    </div>
    <div class="col-auto">
      <button type="submit" class="btn btn-primary">Import</button>
    </div>
  </form>
</div>

<x-payment-table :payments="$payments" />
@endsection
