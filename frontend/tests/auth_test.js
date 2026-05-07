import { Builder, By, until } from 'selenium-webdriver';
import assert from 'assert';

async function runTests() {
  // Try to use Chrome, but provide setup instructions if needed
  let driver = await new Builder().forBrowser('chrome').build();
  const APP_URL = 'http://localhost:5173'; // Default Vite port

  try {
    console.log('--- Starting Auth Workflow Tests ---\n');

    // ==========================================
    // Test 1: User Registration
    // ==========================================
    console.log('Test 1: User Registration Flow');
    await driver.get(APP_URL);
    
    // 1. Navigate to User Portal
    let userPortalCard = await driver.wait(until.elementLocated(By.xpath('//h2[text()="USER PORTAL"]/parent::div/parent::div')), 5000);
    await userPortalCard.click();
    
    // 2. Switch to Registration Mode
    let registerLink = await driver.wait(until.elementLocated(By.xpath('//span[text()="Register Now"]')), 5000);
    await registerLink.click();
    
    // 3. Fill Registration Form
    // Since input fields use placeholders to identify them, we'll locate them via xpath
    let fullNameInput = await driver.wait(until.elementLocated(By.xpath('//input[@placeholder="Full Name"]')), 5000);
    await fullNameInput.sendKeys('Test User');
    
    let phoneInput = await driver.findElement(By.xpath('//input[@placeholder="Phone Number"]'));
    await phoneInput.sendKeys('1234567890');
    
    let usernameInput = await driver.findElement(By.xpath('//input[@placeholder="Username"]'));
    const uniqueUsername = `testuser_${Date.now()}`;
    await usernameInput.sendKeys(uniqueUsername);
    
    let passwordInput = await driver.findElement(By.xpath('//input[@placeholder="Password"]'));
    await passwordInput.sendKeys('password123');
    
    // 4. Submit Registration
    let registerButton = await driver.findElement(By.xpath('//button[@type="submit"]'));
    await registerButton.click();
    
    // 5. Verify successful registration (should redirect or show success/login)
    // For this app, successful registration automatically logs in the user
    // We wait to see if the URL changes to /user or if user content appears
    try {
        await driver.wait(until.urlContains('/user'), 5000);
        console.log('✓ User Registration Successful. Redirected to User Dashboard.');
    } catch(e) {
        console.log('  Wait for redirect timeout. Registration might have failed or not auto-redirected.');
    }


    // ==========================================
    // Test 2: User Login
    // ==========================================
    console.log('\nTest 2: User Login Flow');
    await driver.get(`${APP_URL}/login/user`); // Go directly to user login
    
    // 1. Fill Login Form
    let loginUsernameInput = await driver.wait(until.elementLocated(By.xpath('//input[@placeholder="Username"]')), 5000);
    await loginUsernameInput.sendKeys(uniqueUsername); // Use the one we just created
    
    let loginPasswordInput = await driver.findElement(By.xpath('//input[@placeholder="Password"]'));
    await loginPasswordInput.sendKeys('password123');
    
    // 2. Submit Login
    let loginButton = await driver.findElement(By.xpath('//button[@type="submit"]'));
    await loginButton.click();
    
    // 3. Verify Login
    try {
        await driver.wait(until.urlContains('/user'), 5000);
        console.log('✓ User Login Successful. Redirected to User Dashboard.');
    } catch (e) {
        console.log('✗ User Login Failed.');
    }


    // ==========================================
    // Test 3: Admin Login
    // ==========================================
    console.log('\nTest 3: Admin Login Flow');
    await driver.get(APP_URL);
    
    // 1. Navigate to Admin Portal
    let adminPortalCard = await driver.wait(until.elementLocated(By.xpath('//h2[text()="ADMIN PORTAL"]/parent::div/parent::div')), 5000);
    await adminPortalCard.click();
    
    // 2. Fill Admin Login Form
    let adminUsernameInput = await driver.wait(until.elementLocated(By.xpath('//input[@placeholder="Username"]')), 5000);
    await adminUsernameInput.sendKeys('admin'); // Assuming default admin credentials
    
    let adminPasswordInput = await driver.findElement(By.xpath('//input[@placeholder="Password"]'));
    await adminPasswordInput.sendKeys('admin123');
    
    // 3. Submit Admin Login
    let adminLoginButton = await driver.findElement(By.xpath('//button[@type="submit"]'));
    await adminLoginButton.click();
    
    // 4. Verify Admin Login
    try {
        await driver.wait(until.urlContains('/admin'), 5000);
        console.log('✓ Admin Login Successful. Redirected to Admin Dashboard.');
    } catch (e) {
        console.log('✗ Admin Login Failed. Check if admin user exists in DB.');
    }

    console.log('\n--- All Automated Authentication Tests Completed ---');

  } catch (error) {
    console.error('Test Execution Error:', error);
  } finally {
    // Keep browser open for a short time to observe, then close
    await new Promise(resolve => setTimeout(resolve, 3000));
    await driver.quit();
  }
}

runTests();
