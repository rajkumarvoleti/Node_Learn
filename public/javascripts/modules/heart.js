const axios = require("axios");
import { $ } from "./bling";

function ajaxHeart(e) {
  e.preventDefault();
  console.log("Hearted");
  axios
    .post(this.action)
    .then((res) => {
      const isHearted = this.heart.classList.toggle("heart__button--hearted"); // form has a component with name heart
      // res.data return the all the user details
      $(".heart-count").textContent = res.data.hearts.length;
      if (isHearted) {
        this.heart.classList.add("heart__button--float");
        setTimeout(
          () => this.heart.classList.remove("heart__button--float"),
          2000
        );
      }
    })
    .catch(console.error);
}

export default ajaxHeart;
