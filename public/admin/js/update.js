const token = localStorage.getItem("authkey");
const equipmentID = sessionStorage.getItem("equipmentID")
if(!(token) || !equipmentID){
    alert("error!Equipment id was not passed or you have an invalid token");
    document.getElementsByTagName("body")[0].style.display = "none";
}
const form = document.getElementsByTagName("form")[0];
const message = document.getElementsByClassName("message")[0];

const fetchEquipmentData = async ()=>{
    await fetch(`/admin/getsingle/${equipmentID}`,{
        method:"GET",
        headers: new Headers({
            'Content-Type':'application/json',
            'Authorization':`Bearer ${token}`,
        }),
        body:null,
    })
    .then(data => data.json())
    .then(result =>{
        const {error , message , equipments} = result;
        if(error){
            alert("An error occured",message);
        }
        message.innerHTML = `${message}`;
        const { name , description } = equipments[0];
        form.name.value = name;
        form.description.value = description;
    })
    .catch(error => console.log(error));
}
fetchEquipmentData();
form.addEventListener("submit" , async event =>{
    event.preventDefault();
    const { name , description } = form;
    if(!!(!name.value.length > 0 || !description.value.length > 0)){
        console.log("nothing was passed" , name.value , description.value)
    }else {
        const bodyData = {
            ...name.value && { name : name.value},
            ...description.value && { description : description.value},
        }
        fetch(`/admin/update/${equipmentID}`,{
            method:"PUT",
            headers: new Headers({
                'Content-Type':'application/json',
                'Authorization':`Bearer ${token}`,
            }),
            body:JSON.stringify(bodyData)
        })
        .then(data => data.json())
        .then(result => {
            console.log(result);
            fetchEquipmentData();
        })
        .catch(error => console.log(error));
        
        console.log("something passed",bodyData)
    }
})