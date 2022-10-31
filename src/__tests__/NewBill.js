/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);

describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      })
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
        })
      )
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.NewBill)
    })

    test("Then bill icon in vertical layout should be highlighted", async () => {
      await waitFor(() => screen.getByTestId("icon-mail"))
      const mailIcon = screen.getByTestId("icon-mail")
      expect(mailIcon).toHaveClass("active-icon")
    })

    describe("When I am selecting a bill proof file", () => {
      test("Then if the extension is JPG, JPEG or PNG without throwing an error message it should upload file ", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        }
        const store = mockStore
        const newBillPage = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })
        jest.spyOn(window, 'alert').mockImplementation(() => {})
        const input = screen.getByTestId("file")
        const file = new File(['hello'], 'hello.jpg', {type: 'image/jpg'})
        //define the input file value
        Object.defineProperty(input, 'files', {
          value: [file]
        })
        //mock the change event of upload file
        const e = {
          preventDefault: jest.fn(),
          target: {
            value: 'C:\\fake\\path\\to\\file.jpg'
          }
        }
        newBillPage.handleChangeFile(e)

        expect(window.alert).not.toBeCalled()
        expect(input.files[0]).toStrictEqual(file)
      })

      test("Then if the extension type isn't JPG, JPEG or PNG it should throw an error message ", () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        }
        const store = mockStore
        const newBillPage = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })
        jest.spyOn(window, 'alert').mockImplementation(() => {})
        const input = screen.getByTestId("file")
        // const handleChangeFile = jest.fn(newBillPage.handleChangeFile)
        // input.addEventListener('change', (e) => handleChangeFile(e))
        const file = new File(['hello'], 'hello.gif', {type: 'image/gif'})
        // userEvent.upload(input, file)
                //define the input file value
        Object.defineProperty(input, 'files', {
          value: [file]
        })
        //mock the change event of upload file
        const e = {
          preventDefault: jest.fn(),
          target: {
            value: 'C:\\fake\\path\\to\\file.gif'
          }
        }
        newBillPage.handleChangeFile(e)

        expect(window.alert).toBeCalled()
      })
    })
  })
})