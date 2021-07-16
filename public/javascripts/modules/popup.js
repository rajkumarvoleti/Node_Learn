import Swal from "sweetalert2";
import axios from "axios";

function Popup(data) {
  const id = this.getAttribute("data-id");
  const name = this.getAttribute("data-name");
  Swal.fire({
    title: `Deleting the ${name}`,
    text: "Are you sure?",
    icon: "info",
    showCancelButton: true,
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
    confirmButtonText: "Yes",
    cancelButtonText: "No",
  })
    .then((result) => {
      if (result.value) {
        Swal.fire({
          icon: "success",
          title: "Success",
          text: data.confirm,
        }).then(function () {
          post(id, name);
        });
      } else {
        Swal.fire({
          icon: "error",
          title: "Cancel",
          text: data.cancel,
        });
      }
    })
    .catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Opps...",
        text: `Something went wrong!, ${error.message}`,
      });
    });
}

const post = async (id, name) => {
  await axios
    .post(`/delete/${id}/${name}`, name)
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.error(error.msg);
    });
  location.reload();
};

export default Popup;
