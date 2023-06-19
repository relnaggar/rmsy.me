<!-- offest of 56 pixels for the unexpanded navbar height -->
<body data-bs-spy="scroll" data-bs-target="#sidebarMenu" data-bs-offset="56" tabindex="0" class="position-relative">
  <div class="container-fluid d-flex flex-column p-0">
    <?php require 'body/header.html.php'; ?>
    <?php require 'body/menu.html.php'; ?>    
    <?php require 'body/sidebarCollapsable.html.php'; ?>
    <div class="d-flex flex-row">
      <?php require 'body/sidebarFixed.html.php'; ?>
      <?php require 'body/main.html.php'; ?>
      <a href="#" class="btn btn-primary position-fixed bottom-0 end-0 display-none-lg-up">^</a>
      <?php require 'body/onThisPageSide.html.php'; ?>
    </div>
    <?php require 'body/footer.html.php'; ?>
  </div>
  <script src="/assets/bootstrap.bundle.min.js"></script>
</body>