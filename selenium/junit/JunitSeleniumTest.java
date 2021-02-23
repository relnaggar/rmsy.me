import java.util.concurrent.TimeUnit;

import static org.junit.Assert.*;
import org.junit.*;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;

public class JunitSeleniumTest {
  private static WebDriver driver;
  private static String baseUrl;
  
  @BeforeClass
  public static void beforeAll() {
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
  }

  @Before
  public void before() {
    driver.get(baseUrl);
  }

  @Test
  public void testTitle() {
    assertEquals(driver.getTitle(), "Ramsey El-Naggar"); 
  }

  @AfterClass
  public static void afterAll() {
    System.out.println("\nFinishing...");
    driver.quit();
    try {
      TimeUnit.SECONDS.sleep(3);
    } catch (InterruptedException e) {}
  }
}
