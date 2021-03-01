import java.util.Set;
import java.util.concurrent.TimeUnit;

import java.net.URL;
import java.net.MalformedURLException;

import org.openqa.selenium.*;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.chrome.ChromeOptions;

class Main {
  public static void main(String[] args) throws MalformedURLException, InterruptedException {
      System.out.println("Starting...");

      ChromeOptions chromeOptions = new ChromeOptions();
      chromeOptions.addArguments("--ignore-certificate-errors");
      WebDriver driver = new RemoteWebDriver(new URL("http://selenium-chrome:4444/wd/hub"), chromeOptions);
      driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);

      driver.manage().window().maximize();

      driver.get("https://www.overleaf.com/read/kpqmdmzrsrvn");
      TimeUnit.SECONDS.sleep(10);

      // get href attribute of parent of element with class "fa fa-fw fa-download"
      WebElement i = driver.findElement(By.xpath("//*[@class='fa fa-fw fa-download']"));
      i.click();
      //WebElement a = i.findElement(By.xpath("../."));
      //String downloadLink = a.getAttribute("href");
      //System.out.println("Download link: " + downloadLink);
      //downloadLink = downloadLink.substring(0, downloadLink.length() - "&popupDownload=true".length());
      //System.out.println("Without popup: " + downloadLink);

      // Get All available cookies
      //Set<Cookie> cookies = driver.manage().getCookies();
      //for (Cookie cookie: cookies) {
        //System.out.println(cookie.toJson());
      //}

      TimeUnit.SECONDS.sleep(10);

      driver.quit();
  }
}
