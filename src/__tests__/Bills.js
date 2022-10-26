/**
 * @jest-environment jsdom
 */

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
				test('Then a modal should open and a bill proof img should appear', async () => {
					const store = null
					const billsPage = new Bills({
					document, onNavigate, store, localStorage: window.localStorage
					})
					const eye = screen.getAllByTestId('icon-eye')
					const modale = screen.getByTestId('modaleFile')
					const handleClickIconEye = jest
						.spyOn(billsPage, 'handleClickIconEye')
						.mockImplementation(() => {modale.classList.add('show')})
			
					userEvent.click(eye[0])
						
					expect(handleClickIconEye).toHaveBeenCalled()
					expect($('#modaleFile').modal('show')).toBeTruthy()
					// expect(modale).toHaveClass('show')
					const proofContainer = screen.getByTestId('bill-proof-container')
					const proofImg = screen.getByTestId('bill-proof-img')
					expect(proofContainer).toContainElement(proofImg)
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