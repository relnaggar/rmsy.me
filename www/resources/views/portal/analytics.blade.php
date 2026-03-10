@extends('layouts.app')

@section('title', 'Analytics')
@section('heading', 'Analytics')

@section('content')
@if(empty($quarters))
  <p class="mt-3">No complete lessons found.</p>
@else
  @foreach($quarters as $quarter)
    <h2 class="mt-4">{{ $quarter['year'] }} T{{ $quarter['trimestre'] }}</h2>
    <div class="table-responsive">
      <table class="table table-striped">
        <thead>
          <tr>
            <th rowspan="2">Week of</th>
            <th colspan="3" class="text-center border-start">Total</th>
            @foreach($sources as $source)
              <th colspan="3" class="text-center {{ $loop->first ? 'col-group-divider' : 'border-start' }}">{{ $source }}</th>
            @endforeach
          </tr>
          <tr>
            <th class="text-end border-start">Lessons</th>
            <th class="text-end">GBP</th>
            <th class="text-end">EUR</th>
            @foreach($sources as $source)
              <th class="text-end {{ $loop->first ? 'col-group-divider' : 'border-start' }}">Lessons</th>
              <th class="text-end">GBP</th>
              <th class="text-end">EUR</th>
            @endforeach
          </tr>
        </thead>
        <tbody>
          <tr class="fw-bold">
            <td>Total</td>
            <td class="text-end border-start">{{ $quarter['total']['lesson_count'] }}</td>
            <td class="text-end">{{ penceToPounds($quarter['total']['gbp_pence']) }}</td>
            <td class="text-end">{{ penceToPounds($quarter['total']['eur_cents']) }}{{ $quarter['total']['eur_missing'] ? '*' : '' }}</td>
            @include('portal._analytics_source_cells', ['rowData' => $quarter['total'], 'formatAsAvg' => false])
          </tr>
          <tr class="fst-italic">
            <td>Avg/week</td>
            <td class="text-end border-start">{{ number_format($quarter['avg']['lesson_count'], 1) }}</td>
            <td class="text-end">{{ penceToPounds((int) round($quarter['avg']['gbp_pence'])) }}</td>
            <td class="text-end">{{ penceToPounds((int) round($quarter['avg']['eur_cents'])) }}{{ $quarter['avg']['eur_missing'] ? '*' : '' }}</td>
            @include('portal._analytics_source_cells', ['rowData' => $quarter['avg'], 'formatAsAvg' => true])
          </tr>
        </tbody>
        <tbody class="table-group-divider">
          @foreach($quarter['weeks'] as $weekStart => $week)
            <tr>
              <td>{{ $weekStart }}</td>
              <td class="text-end border-start">{{ $week['lesson_count'] }}</td>
              <td class="text-end">{{ penceToPounds($week['gbp_pence']) }}</td>
              <td class="text-end">{{ penceToPounds($week['eur_cents']) }}{{ $week['eur_missing'] ? '*' : '' }}</td>
              @include('portal._analytics_source_cells', ['rowData' => $week, 'formatAsAvg' => false])
            </tr>
          @endforeach
        </tbody>
      </table>
    </div>
    @if($quarter['eur_missing'])
      <p class="text-muted small">* Some exchange rates unavailable.</p>
    @endif
  @endforeach
@endif
@endsection
