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
				test('Then it should open a modal and it should display an image', async () => {
					const store = null
					const billsPage = new Bills({
					document, onNavigate, store, localStorage: window.localStorage
					})
					await waitFor(() => screen.getAllByTestId('icon-eye')[0])
					const eye = screen.getAllByTestId('icon-eye')[0]
					const modal = screen.getByTestId('modaleFile')
					const modaleFileBody = screen.getByTestId('modaleFileBody')
					const proofContainer = screen.getByTestId('bill-proof-container')
					const proofImg = screen.getByTestId('bill-proof-img')
					const handleClickIconEye = jest
						.spyOn(billsPage, 'handleClickIconEye')
						.mockImplementation(()=>{
							$.fn.modal = jest.fn()
							const billUrl = eye.getAttribute("data-bill-url")
							// const imgWidth = Math.floor($(modal).width() * 0.5)
							// $(modal).find(modaleFileBody).html(`
							// <div style='text-align: center;' class="bill-proof-container" data-testid="bill-proof-container">
							// <img width=${imgWidth} src=${billUrl} alt="Bill" data-testid="bill-proof-img" />
							// </div>`)
							$(modal).modal('show')
						})
					userEvent.click(eye)
						
					expect(handleClickIconEye).toBeCalled()
					// expect(modal).toHaveClass('show')


					expect(proofContainer).toBeVisible()
					expect(proofImg).not.toHaveAttribute('src', '')
				})
			})
    })
})



/*
class Api {
	async post(url, body)  {
		return fetch(url, { method: 'post', body})
	}
}

class Bills {
	constructor() {
		this.api = new Api()
	}


	async doSomething() {
		const result = await this.api.post('http://www.googl.com', { login: "titi", password: "toto" })
		return result
	}
}

it('blabla', () => {
	const bills = new Bills()
	jest.spyOn(bills.api, 'post').mockResolvedValue({ id: 1234, username: "titi" })
	expect(bills.doSomething()).toEqual({ id: 1234, username: "titi" })
	expect(bills.api.post).toHaveBeenCalled()
})*/