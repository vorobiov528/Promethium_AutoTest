import 'cypress-real-events/support';
import 'cypress-network-idle';
import {mainSteps} from '../../page-steps/main/main.steps';
import { registerSteps } from '../../page-steps/register/register.steps';
import {DATA_CONNECTORS_DATABASE_IMG_COUNT, orientationX_HD, orientationY_HD} from '../../config/setting.config';
import {REGISTER_URL, SOLUTION_FOR_DBT_URL} from '../../config/config';
import {faker} from '@faker-js/faker';
import {dataConnectorsSteps} from "../../page-steps/data-connectors/data-connectors.steps";
import {resourceLibrarySteps} from "../../page-steps/resource-library/resource-library.steps";

/* Disable all uncaught exceptions */
Cypress.on('uncaught:exception', (err, runnable) => {
    return false;
});

/* Before each test */
beforeEach(() => {
    cy.viewport(orientationX_HD, orientationY_HD);
    mainSteps.openHomePage();
    cy.waitForNetworkIdle('+(POST|GET)', '*', 5000);
});

context('1. [MAIN_PAGE] Checking of present elements', () => {
    it('should see [LOGO, TEXT1, TEXT2] Logo, Promethium Collaborative Data Analytics, Never miss an opportunity', () => {
        mainSteps.checkLogoPresence();
        //mainSteps.checkTextOnThePage('Promethium:  Next Generation Data Virtualization');
        mainSteps.checkText('Never miss an opportunity.');
    });

});

context('2. [MESSAGE "IS REQUIRED"] Validate "Sign Up" Form Field Error Messages', () => {
    it('error should appear on each field', () => {
        mainSteps.clickOnTryNowButton();
        registerSteps.clickOnSignUp();
        registerSteps.verifyErrorMessage().should('contain.text', 'is required')
    });
});    

context('2. [MAIN_PAGE] Checking of registration', () => {
    it('Validate Successful Sign Up Flow and Redirection to Confirmation', () => {
        mainSteps.clickOnTryNowButton();
        const email = faker.internet.exampleEmail('test_company_');
        const firstName = faker.name.firstName();
        const lastName = faker.name.lastName();
        const companyName = faker.company.name();
        cy.origin(REGISTER_URL, {
            args: {
                email,
                firstName,
                lastName,
                companyName
            }
        }, ({email, firstName, lastName, companyName}) => {
            cy.get('#UserRegister_root_user').type(email.toLowerCase());
            cy.get('#UserRegister_first_name').type(firstName);
            cy.get('#UserRegister_last_name').type(lastName);
            cy.get('#UserRegister_company_name').type(companyName);
            cy.get('#UserRegister_job_function').click().then(() => {
                cy.get('div[data-inspector-column="28"]').then(listing => {
                    const listingCount = Cypress.$(listing).length;
                    const index = Math.floor(Math.random() * (listingCount + 1));
                    cy.get(listing[index]).click();
                })
            });
            cy.get('button[data-inspector-line="155"]').click();
            cy.get('div[data-inspector-relative-path="src/pages/user/RegisterSuccess/index.tsx"]')
                .should('be.visible')
                .should('contain.text', 'Thank you for signing up.');
        });
    });
});

context('3. [SIGN UP] Product Data Connectors Menu and Database Images Verification ', () => {
    it('should see [PRODUCT MENU ITEM] Data Connectors', () => {
        mainSteps.hoverOnProductMenuItem().then(() => {
            mainSteps.clickOnDataConnectorProductMenuItem();
            cy.url().should('include', '/promethium-data-connectors');
            dataConnectorsSteps.getDatabaseConnectorsImg()
                .should('have.length', DATA_CONNECTORS_DATABASE_IMG_COUNT)
                .then(() => {
                    mainSteps.checkText('Microsoft SQL Server');
                    mainSteps.checkText('MySQL');
                    mainSteps.checkText('PostgreSQL');
                    mainSteps.checkText('Teradata');
                });
        })
    });
});

context('4. [PDF] Download file', () => {
    it('downloaded PDF has 4 pages and include texts', () => {
        const text1 = 'Reimagining data analytics';
        mainSteps.hoverOnResourcesMenuItem().then(() => {
            mainSteps.clickOnCollateralAndWebinarsResourcesMenuItem()
            cy.url().should('include', '/resource-library').then(() => {
                cy.contains('Information Sheets and Solution Briefs').should('be.visible');
                resourceLibrarySteps.clickOnSolutionForDbtDownloadButton().then(() => {
                });
            });
        });
    });

});