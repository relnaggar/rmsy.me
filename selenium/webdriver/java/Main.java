import java.util.*;
import java.util.concurrent.*;
import java.io.*;
import java.nio.file.*;
import java.time.*;
import java.net.*;

import org.openqa.selenium.*;
import org.openqa.selenium.support.ui.*;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.chrome.ChromeOptions;

class Main {
  private static WebDriver driver;

  public static void startWebDriver() throws MalformedURLException {
    System.out.println("Starting web driver");

    ChromeOptions chromeOptions = new ChromeOptions();
    chromeOptions.addArguments("--ignore-certificate-errors");
    driver = new RemoteWebDriver(new URL("http://selenium-chrome:4444/wd/hub"), chromeOptions);

    driver.manage().window().maximize();

    System.out.println("Web driver started");
  }

  public static void endWebDriver() {
    System.out.println("Stopping web driver");
    driver.quit();
    System.out.println("Web driver stopped");
  }

  public static void downloadOverleafPdf(String overleafUrl) throws IOException, InterruptedException {
    System.out.println("GET " + overleafUrl);
    driver.get(overleafUrl);
    String xPath = "//*[@class='fa fa-fw fa-download']";

    System.out.println("Waiting for download link to be clickable");
    new FluentWait<WebDriver>(driver)
      .withTimeout(Duration.ofSeconds(10))
      .pollingEvery(Duration.ofSeconds(1))
      .ignoring(StaleElementReferenceException.class)
      .ignoring(org.openqa.selenium.NoSuchElementException.class)
      .until(ExpectedConditions.attributeContains(By.xpath(xPath + "/.."), "href","https://www.overleaf.com/download/project/"));

    System.out.println("Downloading PDF");
    driver.findElement(By.xpath(xPath)).click();

    TimeUnit.SECONDS.sleep(5);
  }
  
  public static void main(String[] args) throws MalformedURLException, IOException, InterruptedException {
    startWebDriver();
    downloadOverleafPdf("https://www.overleaf.com/read/kpqmdmzrsrvn");
    endWebDriver();
  }
}
