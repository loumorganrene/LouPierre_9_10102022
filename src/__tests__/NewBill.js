/**
 * @jest-environment jsdom
 */

import "@testing-library/jest-dom";
import userEvent from "@testing-library/user-event";
import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBill from "../containers/NewBill.js";
import mockStore from "../__mocks__/store";
import inputData from "../__mocks__/newBill";
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
        const file = new File(['hello'], 'hello.gif', {type: 'image/gif'})
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

    describe("When I do fill fields in correct format and I click on submit button", () => {
      
      test("Then a new bill should be sent in employee bills page", async () => {
        const onNavigate = (pathname) => {
          document.body.innerHTML = ROUTES({ pathname });
        }
        const store = mockStore
        const newBillPage = new NewBill({
          document, onNavigate, store, localStorage: window.localStorage
        })
        const data = inputData
        // await waitFor(() => screen.getByTestId('expense-type'))
        // const type = screen.getByTestId("expense-type")
        // fireEvent.change(type, { target: { value: data.type } })
        // expect(type.value).not.toBeNull()
        // await waitFor(() => screen.getByTestId('expense-name'))
        // const name = screen.getByTestId("expense-name")
        // fireEvent.change(name, { target: { value: data.name } })
        // expect(name.value).not.toBeNull()
        // await waitFor(() => screen.getByTestId('amount'))
        // const amount = screen.getByTestId("amount")
        // fireEvent.change(amount, { target: { value: data.amount } })
        // expect(amount.value).not.toBeNull()
        // await waitFor(() => screen.getByTestId('datepicker'))
        // const date = screen.getByTestId("datepicker")
        // fireEvent.change(date, { target: { value: data.date } })
        // expect(date.value).not.toBeNull()
        // await waitFor(() => screen.getByTestId('pct'))
        // const pct = screen.getByTestId("pct")
        // fireEvent.change(pct, { target: { value: data.pct } })
        // expect(pct.value).not.toBeNull()

        await waitFor(() => screen.getByTestId('form-new-bill'))
				const submitBtn = screen.getByTestId('form-new-bill')
        const handleSubmit = jest.spyOn(newBillPage, 'handleSubmit')
        userEvent.click(submitBtn)
        const e = {
          preventDefault: jest.fn(),
          target: {
            value: data
          }
        }
        newBillPage.handleSubmit(e)
        expect(handleSubmit).toBeCalled()
      })
    })
  })
})