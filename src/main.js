document.getElementById('scrapeData').addEventListener('click', async function(){
  try{
    const response = await fetch("http://localhost:3000/api/getData",{
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

      if (response.status === 409) {
        const data = await response.json(); // Get the JSON message from backend
        alertMsg.classList.remove("alert-success");
        alertMsg.classList.add("alert-danger");
        document.querySelector("#errorMsg").textContent = data.message;
      } else if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
  }
    
  catch(e){
    console.log(e)
  }
})
const getUserUrl = "http://localhost:3000/api/users";
const addUserApi = "http://localhost:3000/api/addUser";

function userTableData() {
  fetch(getUserUrl, {
    method: "GET",
  })
    .then((response) => {
      if (!response) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then((data) => {
      const totalHead = document.querySelectorAll('th')
      
      
      console.log(totalHead)
      const tableHead = ["_id", "enrollNo", "email", "sendMail", "courses", "action"]

      for (itm of data) {
        let tr = document.createElement("tr");
        
        for (key of tableHead) {
          let td = document.createElement("td");
          
          if(key==="courses"){
            if(itm[key]){
              td.textContent = itm[key].length;
            }
            else{
              td.textContent = "no data"
            }

          }
          else if(key==="action"){
            td.innerHTML = `
              <div class="d-flex flex-row justify-content-between">
                <a href="http://localhost:3000/api/user/${itm.enrollNo}">View</a>
                <a href="http://localhost:3000/api/user/delete/${itm.enrollNo}">Delete</a>
              </div>
            `
          }
          else {td.textContent = itm[key];}
          tr.appendChild(td);
        }
        document.querySelector(".tbody").appendChild(tr);
      }
      console.log("UI table data insertion");
    })
    .catch((error) => {
      console.error("There was a problem with the fetch operation", error);
    });
}

userTableData();

async function addUser() {
  document
    .getElementById("addUser-btn")
    .addEventListener("click", async (event) => {
      // Prevent the default form submission
      event.preventDefault();
      
      const alertMsg = document.querySelector(".alert");
      const form = document.getElementById("addUserForm");

      // Check if the form is valid based on HTML5 validation
      if (!form.checkValidity()) {
        form.classList.add("was-validated"); // Add Bootstrap validation class for visual feedback
        return;
      }

      // Collect form data
      const formData = {
        username: document.getElementById('addUser_name').value.trim().toLowerCase().replace(/\b\w/g, char => char.toUpperCase()),
        enrollmentNumber: document.getElementById("addUser_enroll").value,
        email: document.getElementById("addUser_email").value,
        password: document.getElementById("addUser_Pw").value,
        sendMail: document.getElementById("addUser-sendMail").checked,
      };

      try {
        const response = await fetch(addUserApi, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        });

        if (response.status === 409) {
          const data = await response.json(); // Get the JSON message from backend
          alertMsg.classList.remove("alert-success");
          alertMsg.classList.add("alert-danger");
          document.querySelector("#errorMsg").textContent = data.message;
        } else if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        } else {
          // Success response (status 200 or 201)
          const data = await response.json(); // Get success message from backend
          alertMsg.classList.remove("alert-danger");
          alertMsg.classList.add("alert-success");
          document.querySelector("#errorMsg").textContent = data.message || "User added successfully";

          // Hide modal and reset form
          const modal = bootstrap.Modal.getInstance(
            document.querySelector(".modal")
          );
          modal.hide();
          form.classList.remove("was-validated"); // Reset validation state
          form.reset(); // Optionally reset the form after submission
        }
      } catch (error) {
        console.error("Error adding user:", error);
        alertMsg.classList.remove("alert-success");
        alertMsg.classList.add("alert-danger");
        document.querySelector("#errorMsg").textContent = "Failed to add user. Please try again.";
      }
    });
}


addUser();
