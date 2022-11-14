/**
 * @jest-environment jsdom
 */

import '@testing-library/jest-dom';
import { fireEvent, screen, waitFor } from '@testing-library/dom';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import mockStore from '../__mocks__/store';
import { ROUTES, ROUTES_PATH } from '../constants/routes.js';
import { localStorageMock } from '../__mocks__/localStorage.js';
import router from '../app/Router.js';

jest.mock('../app/store', () => mockStore);

describe('Given I am connected as an Employee', () => {
  describe('When I am on NewBill Page', () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );
      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
    });

    test('Then bill icon in vertical layout should be highlighted', async () => {
      await waitFor(() => screen.getByTestId('icon-mail'));
      const mailIcon = screen.getByTestId('icon-mail');
      expect(mailIcon).toHaveClass('active-icon');
    });

    describe('When I am selecting a bill proof file', () => {
      test('Then if the extension is JPG, JPEG or PNG without throwing an error message it should upload file ', () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };

        const newBillPage = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        jest.spyOn(window, 'alert').mockImplementation(() => {});
        const input = screen.getByTestId('file');

        const file = new File(['hello'], 'hello.jpg', { type: 'image/jpg' });
        //define the input file value
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        //mock the change event of upload file
        const e = {
          preventDefault: jest.fn(),
          target: {
            value: 'C:\\fake\\path\\to\\file.jpg',
          },
        };
        newBillPage.handleChangeFile(e);

        expect(window.alert).not.toBeCalled();
        expect(input.files[0]).toStrictEqual(file);
      });

      test("Then if the extension type isn't JPG, JPEG or PNG it should throw an error message ", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        };
        const store = mockStore;
        const newBillPage = new NewBill({
          document,
          onNavigate,
          store,
          localStorage: window.localStorage,
        });
        jest.spyOn(window, 'alert').mockImplementation(() => {});
        const input = screen.getByTestId('file');
        const file = new File(['hello'], 'hello.gif', { type: 'image/gif' });
        //define the input file value
        Object.defineProperty(input, 'files', {
          value: [file],
        });
        //mock the change event of upload file
        const e = {
          preventDefault: jest.fn(),
          target: {
            value: 'C:\\fake\\path\\to\\file.gif',
          },
        };
        newBillPage.handleChangeFile(e);

        expect(window.alert).toBeCalled();
      });
    });
  });
});

//Test d'intégration POST
describe('Given I am a user connected as Employee', () => {
  describe('When I submit a NewBill form completed', () => {
    test('Then a new bill should be created on employee Bills page', async () => {
      document.body.innerHTML = NewBillUI();

      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'b@b',
        })
      );

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const mockedNewBill = {
        email: 'b@b',
        type: 'Hôtel et logement',
        name: 'test',
        amount: 400,
        date: '2022-04-04',
        vat: '80',
        pct: 20,
        commentary: 'test billed',
        fileUrl:
          'https://test.storage.tld/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a',
        fileName: 'preview-facture-free-201801-pdf-1.jpg',
        status: 'pending',
      };

      screen.getByTestId('expense-type').value = mockedNewBill.type;
      screen.getByTestId('expense-name').value = mockedNewBill.name;
      screen.getByTestId('datepicker').value = mockedNewBill.date;
      screen.getByTestId('amount').value = mockedNewBill.amount;
      screen.getByTestId('vat').value = mockedNewBill.vat;
      screen.getByTestId('pct').value = mockedNewBill.pct;
      screen.getByTestId('commentary').value = mockedNewBill.commentary;

      newBill.updateBill = jest.fn();
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));

      const form = screen.getByTestId('form-new-bill');
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
      expect(newBill.updateBill).toHaveBeenCalled();
    });
  });

  describe('When an error occurs on API', () => {
    beforeEach(() => {
      jest.spyOn(mockStore, 'bills');

      document.body.innerHTML = NewBillUI();

      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });

      Object.defineProperty(window, 'location', {
        value: { hash: ROUTES_PATH['NewBill'] },
      });

      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
          email: 'b@b',
        })
      );
    });

    // test("fetches bills from an API and fails with 404 message error", async () => {
    //   /**Console.error mock */
    //   const consoleSpy = jest
    //     .spyOn(console, 'error')
    //     .mockImplementation(() => { })

    //   mockStore.bills.mockImplementationOnce(() => {
    //     return {
    //       list: () => {
    //         return Promise.reject(new Error("Erreur 404"))
    //       }
    //     }
    //   })
    //   window.onNavigate = (pathname) => {
    //     document.body.innerHTML = ROUTES({ pathname })
    //   }
    //   await new Promise(process.nextTick);
    //   expect(consoleSpy).toHaveBeenCalled()
    // })

    test('fetches messages from an API and fails with 500 message error', async () => {
      /**Console.error mock */
      const consoleSpy = jest
        .spyOn(console, 'error')
        .mockImplementation(() => {});

      /**Promise reject mock */
      mockStore.bills.mockImplementationOnce(() => {
        return {
          update: () => {
            return Promise.reject(new Error('Erreur 500'));
          },
        };
      });

      /**NewBill submit mock */
      const newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const form = screen.getByTestId('form-new-bill');
      const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
      form.addEventListener('submit', handleSubmit);
      fireEvent.submit(form);

      await new Promise(process.nextTick);
      expect(consoleSpy).toHaveBeenCalled();
    });
  });
});
