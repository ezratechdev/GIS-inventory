window.onload = async event => {
    // form getter
    const signUpButton = document.getElementById('signUp');
    const signInButton = document.getElementById('signIn');
    const container = document.getElementById('container');

    signUpButton.addEventListener('click', () => {
        container.classList.add("right-panel-active");
    });

    signInButton.addEventListener('click', () => {
        container.classList.remove("right-panel-active");
    });
    // end of form getter
    // start of redirect
    const whereToRedirect = async (token) => {
        let pageTo;
        let pageError;
        let pageMessage;
        if (!token) {
            // no token passed -- pop an error
            console.log("no token was passed")
        }

        // continue to validate the error from the server so as to get the redirect page
        await fetch("/auth/getpage", {
            method: "POST",
            headers: new Headers({
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
            }),
            // no body data required
            // body:{},
        })
            .then(data => data.json())
            .then(jsonData => {
                const { error, message, page } = jsonData;
                pageTo = page;
                pageError = error;
                pageMessage = message;
                console.log(error, page, message);
            })
            .catch(error => {
                // show modal with error and log
                console.log(error);
            })
        return { pageTo, pageError, pageMessage };
    }
    // end of redirect determine
    const signUpForm = document.getElementById("signUpForm");
    const token = localStorage.getItem("authkey");
    if (token) {
        let { pageError, pageMessage, pageTo } = await whereToRedirect(token);
        // let page = await whereToRedirect(token);
        console.log(pageTo, "man")
        if (!pageError && (pageTo)) {
            window.location.href = `./${pageTo}/index.html`;
        } else {
            // unable to log in to any page
            alert("Unable to redirect you to any page");
        }
        console.log("user is logged in")
    } else console.log("user is not logged in");
    // sign up
    signUpForm.addEventListener("submit", async event => {
        event.preventDefault();
        const { email, username, password, identity, previledge, confirmPassword } = signUpForm;
        if (password.value == confirmPassword.value) {
            fetch("/auth/signup", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.value,
                    username: username.value,
                    identity: identity.value,
                    previledge: previledge.value,
                    password: password.value,
                }),
            })
                .then(response => response.json())
                .then(async data => {
                    const { error, message, token } = data;
                    if (token) {
                        localStorage.setItem("authkey", token);
                        const { pageError, pageMessage, pageTo } = await whereToRedirect(token);
                        if (!pageError && (pageTo)) {
                            window.location.href = `./${pageTo}/index.html`;
                        } else {
                            // unable to log in to any page
                            alert(`Error ${error}:${message}`);
                        }
                    } else {
                        // token not obtained show error
                        alert("token not obtained");
                    }
                })
                .catch(error => {
                    console.log(error);
                })
        } else console.log("Password not the same");
    });
    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit" , async event=>{
        event.preventDefault();
        const { email , password} = loginForm;
        await fetch("/auth/login",{
            method:"POST",
            headers:new Headers({
                'Content-Type':'application/json',
            }),
            body:JSON.stringify({
                email:email.value,
                password:password.value,
            })
            
        })
        .then(data => data.json())
        .then(async ({token}) =>{
            if (token) {
                localStorage.setItem("authkey", token);
                const { pageError, pageMessage, pageTo } = await whereToRedirect(token);
                if (!pageError && (pageTo)) {
                    window.location.href = `./${pageTo}/index.html`;
                } else {
                    // unable to log in to any page
                }
                // console.log(token,"\n",message);
            } else {
                // token not obtained show error
                alert("token not obtained");
            }
        })
        .catch(error => {
            alert(`An error occurred:${error}`);
        })
    });
}