window.onload = async event => {
	const token = localStorage.getItem("authkey");
	if (!token) {
		window.location.href = "../index.html";
	}

	// nav bar
	const mobileBtn = document.getElementById('mobile-cta')
	nav = document.querySelector('nav')
	mobileBtnExit = document.getElementById('mobile-exit');

	mobileBtn.addEventListener('click', () => {
		nav.classList.add('menu-btn');
	})

	mobileBtnExit.addEventListener('click', () => {
		nav.classList.remove('menu-btn');
	})
	// end of navbar

	// delete account event listener
	const deleteUserAccount = document.getElementById("deleteUserAccount");
	deleteUserAccount.addEventListener("click", async e => {
		e.preventDefault();
		await fetch("/auth/deleteAccount", {
			method: "DELETE",
			headers: new Headers({
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`
			}),
			body: null,
		})
			.then(data => data.json())
			.then(result => {
				window.location.href = "../index.html";
				localStorage.removeItem("authkey");
				// console.log(result);
			})
			.catch(error => alert(error));
	});
	// end of delete account event listener
	// create boxes

	const listHolder = document.getElementsByClassName("list")[0];
	const BoxCreator = ({ name, description, state, requested, whohas, taken, image }, equipmentID) => {
		// listHolder.innerHTML = ``;
		let newBox = document.createElement("div");
		newBox.setAttribute("id", equipmentID);
		newBox.classList.add("box");
		const div1 = document.createElement('div');
		// div 1
		const h2 = document.createElement("h2");
		h2.classList.add('box-name');
		h2.innerHTML = name;
		// 
		const img = document.createElement("img");
		img.classList.add("img-display")
		img.setAttribute("src", image);
		// 
		const p = document.createElement("p");
		p.classList.add('box-desc');
		p.innerHTML = description;
		div1.appendChild(h2);
		div1.appendChild(p);
		div1.appendChild(img);
		// div2
		const div2 = document.createElement("div");
		div2.classList.add("box-actions");

		const button1 = document.createElement("button");
		// console.log(equipmentID);

		button1.innerHTML = `${((taken == 'true' && whohas.length > 0) ? "Return" : (requested == 'true' ? "Pending Approval" : "Request"))}`;
		button1.addEventListener("click", async event => {
			if ((whohas.length > 0 && taken == 'true')) {
				// user to return
				console.log("return equipment");

			} else if ((!(whohas.length > 0 && taken == 'true') && requested == 'true')) {
				// pending approval -- do nothing
				console.log("Am supposed to do nothing");
			} else if ((!(whohas.length > 0 && taken == 'true') && requested == 'false')) {
				// request for equipment
				console.log("requesting for equipment");
				await fetch(`/client/borrow/${equipmentID}`, {
					method: "GET",
					headers: new Headers({
						'Content-Type': 'application/json',
						'Authorization': `Bearer ${token}`,
					}),
					body: null,
				})
					.then(data => data.json())
					.then(result => {
						console.log(result);
						window.location.href = window.location.href;
					})
					.catch(error => console.log(error, "error found"));
			} else {
				console.log("I am literally supposed to do nothing!!");
			}
		});
		button1.classList.add("genBtn");

		// 
		div2.appendChild(button1)
		// appends
		newBox.appendChild(div1)
		newBox.appendChild(div2)
		// append the box
		listHolder.appendChild(newBox);
	}
	// end of create boxes

	// get available equipments
	const getAvailable = async () => {
		await fetch("/client/getavailable", {
			method: "GET",
			headers: new Headers({
				'Content-Type': 'application/json',
				'Authorization': `Bearer ${token}`,
			}),
			body: null,
		})
			.then(data => data.json())
			.then(result => {
				const { error, message, equipments } = result;
				if (error) {
					console.log("Unable to get available equipments")
				}
				equipments.forEach(equipment => {
					const { description, equipmentID, name, requested, state, taken, whohas, image } = equipment;

					BoxCreator({
						name,
						description,
						state,
						requested,
						whohas,
						taken,
						image,
					}, equipment.equipmentID)
				});
			})
			.catch(error => console.log(error));
	}
	await getAvailable();
	// end of get available equipments


	// start of box animations
	const boxes = document.querySelectorAll('.box');

	window.addEventListener('scroll', checkBoxes);

	checkBoxes();

	function checkBoxes() {
		const triggerBottom = window.innerHeight / 5 * 4;
		boxes.forEach((box, idx) => {
			const boxTop = box.getBoundingClientRect().top;

			if (boxTop < triggerBottom) {
				box.classList.add('show');
			} else {
				box.classList.remove('show');
			}
		});
	}
	// end of box animation
	// logout functionality
	const logOut = document.getElementById("logOut");
	logOut.addEventListener("click", async event => {
		localStorage.removeItem("authkey");
		// ../cs
		window.location.href = "../index.html";
	})
}