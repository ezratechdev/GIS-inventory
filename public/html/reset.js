window.onload = ()=>{
    const passwordResetForm = document.getElementById("passwordResetForm");
    const token = localStorage.getItem("authkey");
    passwordResetForm.addEventListener("submit" , event =>{
        event.preventDefault();
        console.log("hi");
        const { oldPass , newPass , conPass } = passwordResetForm;
        if(newPass.value == conPass.value ){
            fetch("/auth/reset" , {
                method:"POST",
                headers: new Headers({
                    'Content-Type':'application/json',
                    'Authorization':`Bearer ${token}`
                }),
                body:JSON.stringify({
                    newPass:newPass.value,
                    oldPass:oldPass.value,
                }),
            })
            .then(data => data.json())
            .then(result => {
                passwordResetForm.reset();
                if(!result.error){
                    alert(`${result.message}`);
                }else alert(`${result.message}`);
            })
            .catch(error => console.log(error));
        }else alert("New and confirm new password do not match")
    });
    if(!token){
        window.location.href = "../index.html";
    }
}