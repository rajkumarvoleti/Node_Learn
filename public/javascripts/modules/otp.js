import { $, $$ } from "./bling";

function otpForm() {
  const inputs = $$(".OTP__input");
  const parent = $(".OTP__input__container");
  var invalidChars = ["-", "+", "e", "."];

  inputs.on("keydown", function (e) {
    // helper variables
    const key = e.key;
    const keyCode = e.keyCode;
    const length = this.value.length;
    const dataPrev = this.dataset.prev;
    const dataNext = this.dataset.next;

    // invalid
    if (invalidChars.includes(key)) {
      e.preventDefault();
    }

    // change focus
    if (keyCode === 37 && dataPrev !== "-1") {
      const prevInput = $(`*[data-name="${dataPrev}"]`);
      prevInput.focus();
      return;
    }

    // only one digit
    if (length >= 0) {
      e.preventDefault();
      this.value = "";
      this.value = key;
    }
    if (keyCode == 8 && dataPrev !== "-1") {
      const prevInput = $(`*[data-name="${dataPrev}"]`);
      prevInput.focus();
      return;
    }
    // change focus
    if (dataNext !== "-1") {
      const nextInput = $(`*[data-name="${dataNext}"]`);
      nextInput.focus();
      return;
    }
  });
}
export default otpForm;
