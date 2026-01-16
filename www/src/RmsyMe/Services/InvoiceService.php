<?php

declare(strict_types=1);

namespace RmsyMe\Services;

use PDOException;
use InvalidArgumentException;
use Dompdf\{
  Dompdf,
  Options,
};
use PrinsFrank\Standards\{
  Country\CountryAlpha2,
  Language\LanguageAlpha2,
};
use Relnaggar\Veloz\Views\Page;
use RmsyMe\{
  Repositories\BuyerRepository,
  Repositories\PaymentRepository,
  Repositories\ExchangeRateRepository,
};

class InvoiceService
{
  private SecretsService $secretsService;
  private PaymentRepository $paymentRepository;
  private BuyerRepository $buyerRepository;
  private ExchangeRateRepository $exchangeRateRepository;

  public function __construct(
    SecretsService $secretsService,
    PaymentRepository $paymentRepository,
    BuyerRepository $buyerRepository,
    ExchangeRateRepository $exchangeRateRepository,
  ) {
    $this->secretsService = $secretsService;
    $this->paymentRepository = $paymentRepository;
    $this->buyerRepository = $buyerRepository;
    $this->exchangeRateRepository = $exchangeRateRepository;
  }

  /**
   * Check if an invoice exists based on its invoice number.
   * 
   * @param string $invoiceNumber The invoice number to check.
   * @return bool True if the invoice exists, false otherwise.
   * @throws PDOException If there is a database error.
   */
  public function doesInvoiceExist(string $invoiceNumber): bool
  {
    // basic validation of invoice number format
    if (strlen($invoiceNumber) !== 8 || $invoiceNumber[4] !== '-') {
      return false;
    }
    $yearString = substr($invoiceNumber, 0, 4);
    $sequence_number = substr($invoiceNumber, 5, 3);
    if (!is_numeric($yearString) || !is_numeric($sequence_number)) {
      return false;
    }

    // validate year range
    $year = (int)$yearString;
    if ($year < 2020 || $year > (int)date('Y')) {
      return false;
    }

    // find payments with matching sequence number
    $payments = $this->paymentRepository->selectBySequenceNumber(
      $sequence_number
    );

    // check if any matching payment matches the full invoice number
    foreach ($payments as $payment) {
      if ($payment->getInvoiceNumber() === $invoiceNumber) {
        return true;
      }
    }
    return false;
  }

  public function formatCurrency(int $amountInCents, string $currency): string
  {
    $formattedAmount = number_format($amountInCents / 100, 2, '.', ',');
    if ($currency == 'GBP') {
      return 'GBP £' . $formattedAmount;
    } elseif ($currency == 'EUR') {
      return 'EUR €' . $formattedAmount;
    } else {
      throw new InvalidArgumentException('Unsupported currency: ' . $currency);
    }
  }

  /**
   * Generate a PDF invoice for the given invoice number.
   * 
   * @param string $invoiceNumber The invoice number.
   * @return string The PDF content as a string.
   * @throws PDOException If there is a database error or any invoice data is
   * missing.
   */
  public function generateInvoicePdf(string $invoiceNumber): string
  {
    $sequence_number = substr($invoiceNumber, 5, 3);

    // find payments with matching sequence number
    $payments = $this->paymentRepository->selectBySequenceNumber(
      $sequence_number
    );

    // find the payment with the exact invoice number
    $matchingPayment = null;
    foreach ($payments as $payment) {
      if ($payment->getInvoiceNumber() === $invoiceNumber) {
        // found the payment
        $matchingPayment = $payment;
        break;
      }
    }
    if ($matchingPayment === null) {
      throw new PDOException('Invoice not found');
    }

    // find the buyer
    $buyer = $this->buyerRepository->selectById($matchingPayment->buyer_id);
    if ($buyer === null) {
      throw new PDOException('Buyer not found');
    }

    $sellerAddress = array_map(
      fn($line) => trim($line),
      explode('|', $this->secretsService->getSecret('SELLER_ADDRESS')),
    );
    $sellerAddress[5] = CountryAlpha2::from(
      $sellerAddress[5]
    )?->getNameInLanguage(
      LanguageAlpha2::Spanish_Castilian
    );

    $buyerAddress = array_merge([$buyer->name], array_filter(
      [
        $buyer->address1,
        $buyer->address2,
        $buyer->address3,
        $buyer->town_city,
        $buyer->state_province_county,
        $buyer->zip_postal_code,
        CountryAlpha2::from($buyer->country)?->getNameInLanguage(
          LanguageAlpha2::Spanish_Castilian
        ),
        $buyer->extra,
      ],
      fn($line) => $line !== null && $line !== ''
    ));

    $issue_date = $matchingPayment->getDate();
    $exchange_rate = $this->exchangeRateRepository->selectByDate($issue_date);
    $invoice = [
      'number' => $invoiceNumber,
      'issue_date' => $issue_date,
      'exchange_rate' => $exchange_rate,
      'notes' => "Factura exenta de IVA según artículo 20. Uno. 10º - Ley 37/1992",
    ];

    $qty = 1;
    $items = [
      [
        'date' => $issue_date,
        'service' => 'Clases online de informática',
        // 'student' => 'Example Student',
        // 'client' => 'Example Client',
        'qty' => $qty,
        'unit_price' => intdiv($matchingPayment->amount_gbp_pence, $qty),
      ],
    ];

    $publicPath = dirname(__DIR__, 3) . '/html';

    $options = new Options();
    $options->set('isRemoteEnabled', true); // allow remote assets
    $options->set('defaultFont', 'DejaVu Sans');
    $options->set('chroot', $publicPath); // restrict file access to public path

    $dompdf = new Dompdf($options);
    $page = Page::withTemplate(
      templatePath: 'Client/invoice',
      templateVars: [
        'sellerAddress' => $sellerAddress,
        'buyerAddress' => $buyerAddress,
        'invoice' => $invoice,
        'items' => $items,
        'formatCurrency' => fn($amountInCents, $currency) =>
          $this->formatCurrency($amountInCents, $currency),
        'cssPath' => "file://$publicPath/css/invoice.css",
        // 'cssPath' => "/css/invoice.css",
      ],
    );
    // return $page->getHtmlContent();
    $dompdf->loadHtml($page->getHtmlContent());
    $dompdf->setPaper('A4', 'portrait');
    $dompdf->render();
    $pdfContent = $dompdf->output();

    return $pdfContent;
  }
}
