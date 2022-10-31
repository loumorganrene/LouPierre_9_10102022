/**
 * @jest-environment jsdom
 */
import $ from 'jquery';
import "@testing-library/jest-dom";
import { screen, waitFor } from "@testing-library/dom";
import userEvent from "@testing-library/user-event";
import Bills from "../containers/Bills.js";
import BillsUI from "../views/BillsUI.js";
import mockStore from "../__mocks__/store";
import { bills } from "../fixtures/bills.js";
import { ROUTES_PATH } from "../constants/routes.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";

jest.mock("../app/store", () => mockStore);


describe("Given I am connected as an employee", () => {
	beforeEach(() => {
		Object.defineProperty(window, 'localStorage', { value: localStorageMock })
		window.localStorage.setItem(
			'user',
			JSON.stringify({
				type: 'Employee'
			})
		)
	})

	describe("When I am on Bills Page", () => {
		beforeEach(() => {
			$.fn.modal = jest.fn();
			const root = document.createElement("div")
			root.setAttribute("id", "root")
			document.body.append(root)
			router()
			window.onNavigate(ROUTES_PATH.Bills)
			document.body.innerHTML = BillsUI({ data: bills })
		})

		test("Then bill icon in vertical layout should be highlighted", async () => {
			await waitFor(() => screen.getByTestId('icon-window'))
			const windowIcon = screen.getByTestId('icon-window')
			expect(windowIcon).toHaveClass("active-icon")
		})

		test("Then bills should be ordered from earliest to latest", () => {
			const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
			const antiChrono = (a, b) => ((a < b) ? 1 : -1)
			const datesSorted = [...dates].sort(antiChrono)
			expect(dates).toEqual(datesSorted)
		})

		describe('When I click on a bill eye icon', () => {
			test('Then it should open a modal', async () => {
				const store = null
				const billsPage = new Bills({
					document, onNavigate, store, localStorage: window.localStorage
				})
				await waitFor(() => screen.getAllByTestId('icon-eye')[0])
				const eye = screen.getAllByTestId('icon-eye')[0]
				const handleClickIconEye = jest.spyOn(billsPage, 'handleClickIconEye')
				userEvent.click(eye)

				expect(handleClickIconEye).toBeCalled()
				expect($.fn.modal).toHaveBeenCalledWith("show")
			})

			test('Then it should display an image', async () => {
				await waitFor(() => screen.getAllByTestId('icon-eye')[0])
				const eye = screen.getAllByTestId('icon-eye')[0]
				const billUrl = eye.getAttribute("data-bill-url")
				const imgWidth = Math.floor($('#modaleFile').width() * 0.5)

				expect($.fn.html).not.toHaveBeenCalledWith(
					`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src="" alt="Bill" /></div>`)
				expect($.fn.html).toHaveBeenCalledWith(
					`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
			})
		})
	})
})