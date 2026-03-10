@foreach($sources as $source)
  @php $data = $rowData['sources'][$source] ?? null; @endphp
  <td class="text-end {{ $loop->first ? 'col-group-divider' : 'border-start' }}">{{ $data ? ($formatAsAvg ? number_format($data['lesson_count'], 1) : $data['lesson_count']) : '' }}</td>
  <td class="text-end">{{ $data ? penceToPounds($formatAsAvg ? (int) round($data['gbp_pence']) : $data['gbp_pence']) : '' }}</td>
  <td class="text-end">{{ $data ? penceToPounds($formatAsAvg ? (int) round($data['eur_cents']) : $data['eur_cents']).($data['eur_missing'] ? '*' : '') : '' }}</td>
@endforeach
