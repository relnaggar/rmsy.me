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
              <th colspan="3" class="text-center border-start">{{ $source }}</th>
            @endforeach
          </tr>
          <tr>
            <th class="text-end border-start">Lessons</th>
            <th class="text-end">GBP</th>
            <th class="text-end">EUR</th>
            @foreach($sources as $source)
              <th class="text-end border-start">Lessons</th>
              <th class="text-end">GBP</th>
              <th class="text-end">EUR</th>
            @endforeach
          </tr>
        </thead>
        <tbody>
          @foreach($quarter['weeks'] as $weekStart => $week)
            <tr>
              <td>{{ $weekStart }}</td>
              <td class="text-end border-start">{{ $week['lesson_count'] }}</td>
              <td class="text-end">{{ penceToPounds($week['gbp_pence']) }}</td>
              <td class="text-end">{{ penceToPounds($week['eur_cents']) }}{{ $week['eur_missing'] ? '*' : '' }}</td>
              @foreach($sources as $source)
                @php $data = $week['sources'][$source] ?? null; @endphp
                <td class="text-end border-start">{{ $data ? $data['lesson_count'] : '' }}</td>
                <td class="text-end">{{ $data ? penceToPounds($data['gbp_pence']) : '' }}</td>
                <td class="text-end">{{ $data ? penceToPounds($data['eur_cents']).($data['eur_missing'] ? '*' : '') : '' }}</td>
              @endforeach
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
