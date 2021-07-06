import axios from "axios";
import dompurify from "dompurify";

function searchResultsHTML(stores) {
  return stores
    .map((store) => {
      return `
      <a href="/store/${store.slug}" class = "search__result">
        <strong>${store.name}</strong>
      </a>
    `;
    })
    .join("");
}

function typeAhead(search) {
  if (!search) return;
  const searchInput = search.querySelector(`input[name="search"]`);
  const searchResult = search.querySelector(".search__results");

  searchInput.on("input", function () {
    if (!this.value) {
      searchResult.style.display = "none";
      return;
    }

    searchResult.style.display = "block";

    axios
      .get(`/api/search?q=${this.value}`)
      .then((res) => {
        if (res.data.length) {
          const html = searchResultsHTML(res.data);
          searchResult.innerHTML = dompurify.sanitize(html);
        } else {
          searchResult.innerHTML = dompurify.sanitize(
            `<div class="search__result">No results for ${this.value} found!</div>`
          );
        }
      })
      .catch((err) => {
        console.error(err);
      });
  });

  // handle keyboard inputs
  searchInput.on("keyup", (e) => {
    // if not up down or enter skip
    if (![38, 40, 13].includes(e.keyCode)) {
      return;
    }

    const activeClass = "search__result--active";
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll(".search__result");
    let next;

    if (e.keyCode === 40 && current) {
      console.log(current);
      next = current.nextElementSibling || items[0];
    } // down
    else if (e.keyCode === 40) {
      next = items[0];
    }
    if (e.keyCode === 38 && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } // up
    else if (e.keyCode === 38) {
      next = items[items.length - 1];
    } else if (e.keyCode == 13 && current.href) {
      console.log(current);
      window.location = current.href;
      return;
    } // enter

    // adding and removing the class;
    if (current) current.classList.remove(activeClass);
    next.classList.add(activeClass);
    // console.log(current);
    // console.log(next);
  });
}

export default typeAhead;
