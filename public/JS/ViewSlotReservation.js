//ADD
//EDIT
//DELETE 
          //add reservation
          document.getElementById("add-item").addEventListener("click", function () {
              const reserveList = document.querySelector(".reserve-list");
              const clone = reserveList.cloneNode(true);
              
              clone.removeAttribute("id");
              reserveList.parentNode.insertBefore(clone, reserveList.nextSibling);
          });

          //delete reservation
          document.addEventListener("click", function(e) {
              if (e.target.classList.contains("delete-item") || 
                  e.target.parentElement.classList.contains("delete-item")) {
                  
                  const itemToDelete = e.target.closest(".reserve-list"); //remove nearest
                  if (itemToDelete) {
                      itemToDelete.remove();
                  }
              }
          });