function autoFill() {
  const btn = document.querySelector(".OTP__submit__button");

  if (btn) {
    // retreiving from local storage
    const formName = localStorage.getItem("name");
    const formEmail = localStorage.getItem("email");
    const formPass1 = localStorage.getItem("pass1");
    const formPass2 = localStorage.getItem("pass2");

    //  selecting dom elements
    const name = document.querySelector("#name");
    const email = document.querySelector("#email");
    const pass1 = document.querySelector("#pass1");
    const pass2 = document.querySelector("#pass2");

    // adding it to form
    name.value = formName ? formName : "";
    email.value = formEmail ? formEmail : "";
    pass1.value = formPass1 ? formPass1 : "";
    pass2.value = formPass2 ? formPass2 : "";

    // removing from local storage
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("pass1");
    localStorage.removeItem("pass2");

    // storing in local Storage
    btn.addEventListener("click", function () {
      localStorage.setItem("name", name.value);
      localStorage.setItem("email", email.value);
      localStorage.setItem("pass1", pass1.value);
      localStorage.setItem("pass2", pass2.value);
    });
  }
}

export default autoFill;
