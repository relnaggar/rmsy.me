import java.util.concurrent.TimeUnit;
import java.net.URL;
import java.net.MalformedURLException;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.remote.RemoteWebDriver;
import org.openqa.selenium.chrome.ChromeOptions;

import io.cucumber.java.*;

public class Hooks {
  private static boolean initialized = false;

  private WebDriver driver;
  private String baseUrl;

  @Before
  public void beforeAll() throws MalformedURLException {
    if (!initialized) {
      // get environment variable
      baseUrl = System.getenv().get("TEST_URL");
      if (baseUrl == null) {
        System.out.println("TEST_URL not set, aborting all tests");
        System.exit(1);
      } else {
        System.out.println("Running tests for " + baseUrl);
      }

      ChromeOptions chromeOptions = new ChromeOptions();
      driver = new RemoteWebDriver(new URL("http://localhost:4444/wd/hub"), chromeOptions);

      // open window
      driver.manage().timeouts().implicitlyWait(10, TimeUnit.SECONDS);
      driver.manage().window().maximize();

      initialized = true;
    }
  }

  public WebDriver getDriver() {
    return driver;
  }

  public String getBaseUrl() {
    return baseUrl;
  }

  @After()
  public void afterAll() {
    System.out.println("\nFinishing...");
    driver.quit();
    try {
      TimeUnit.SECONDS.sleep(3);
    } catch (InterruptedException e) {}
  }
}
