import java.util.concurrent.TimeUnit;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

import io.cucumber.java.*;

public class Hooks {
  private static boolean initialized = false;

  private WebDriver driver;
  private String baseUrl;

  @Before
  public void beforeAll() {
    if (!initialized) {
      // get environment variable
      baseUrl = System.getenv().get("TEST_URL");
      if (baseUrl == null) {
        System.out.println("TEST_URL not set, aborting all tests");
        System.exit(1);
      } else {
        System.out.println("Running tests for " + baseUrl);
      }

      // open window
      System.setProperty("webdriver.chrome.driver", "/usr/local/bin/chromedriver");
      driver = new ChromeDriver();
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
