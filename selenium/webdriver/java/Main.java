import java.util.concurrent.TimeUnit;
import java.time.Duration;
import java.net.URL;

import java.net.MalformedURLException;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.By;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.openqa.selenium.support.ui.FluentWait;
import org.openqa.selenium.support.ui.ExpectedConditions;

import org.openqa.selenium.NoSuchElementException;
import org.openqa.selenium.StaleElementReferenceException;

class Main {
  private static WebDriver driver;

  private static void print(String message) {
    System.out.println("[webdriver] " + message);
    
  }

  public static void startWebDriver() throws MalformedURLException {
    System.out.println("start web driver");

    ChromeOptions chromeOptions = new ChromeOptions();
    chromeOptions.addArguments("--ignore-certificate-errors");
    driver = new RemoteWebDriver(new URL("http://selenium-chrome:4444/wd/hub"), chromeOptions);

    driver.manage().window().maximize();
  }

  public static void endWebDriver() {
    System.out.println("stop web driver");
    driver.quit();
  }

  public static void downloadOverleafPdf(String overleafUrl) throws InterruptedException {
    System.out.println("GET " + overleafUrl);
    driver.get(overleafUrl);
    String xPath = "//*[@class='fa fa-fw fa-download']";

    System.out.println("wait for download link to be clickable");
    new FluentWait<WebDriver>(driver)
      .withTimeout(Duration.ofSeconds(10))
      .pollingEvery(Duration.ofSeconds(1))
      .ignoring(StaleElementReferenceException.class)
      .ignoring(NoSuchElementException.class)
      .until(ExpectedConditions.attributeContains(By.xpath(xPath + "/.."), "href","https://www.overleaf.com/download/project/"));

    System.out.println("download PDF");
    driver.findElement(By.xpath(xPath)).click();
    TimeUnit.SECONDS.sleep(5);
  }
  
  public static void main(String[] args) throws MalformedURLException, InterruptedException {
    startWebDriver();
    downloadOverleafPdf("https://www.overleaf.com/read/kpqmdmzrsrvn");
    endWebDriver();
  }
}
