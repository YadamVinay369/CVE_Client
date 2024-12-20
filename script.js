let currentPage = 1;
let limit = 10;
let totalPages = 1;
let totalCount = 0;

function fetchCVEData(page) {
  const year = document.getElementById("year").value;
  const score = document.getElementById("score").value;
  const days = document.getElementById("days").value;

  let url = `https://securinserver.onrender.com/api/cve?page=${page}&limit=${limit}`;

  if (year) {
    url = `https://securinserver.onrender.com/api/cve/year/${year}?page=${page}&limit=${limit}`;
  } else if (score) {
    url = `https://securinserver.onrender.com/api/cve/score/${score}?page=${page}&limit=${limit}`;
  } else if (days) {
    url = `https://securinserver.onrender.com/api/cve/lastModified/${days}?page=${page}&limit=${limit}`;
  }

  fetch(url)
    .then((response) => response.json())
    .then((data) => {
      if (data) {
        displayCVEData(data);
      } else {
        console.error(data.message);
      }
    })
    .catch((error) => console.error("Error fetching CVEs:", error));
}

// Function to display CVE data in the table
function displayCVEData(data) {
  const cveList = document.getElementById("cve-list");
  cveList.innerHTML = `
    <tr>
      <th>CVE ID</th>
      <th>IDENTIFIER</th>
      <th>PUBLISHED DATE</th>
      <th>LAST MODIFIED DATE</th>
      <th>STATUS</th>
    </tr>
  `;

  const totalresults = document.getElementById("total");
  totalresults.innerHTML = `${data.pagination.totalCount}`;
  totalCount = data.pagination.totalCount;
  currentPage = data.pagination.currentPage;
  totalPages = data.pagination.totalPages;

  // Populate table with fetched CVE data
  if (Array.isArray(data.cves) && data.cves.length > 0) {
    data.cves.forEach((cve) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cve.cveId}</td>
        <td>${cve.sourceIdentifier}</td>
        <td>${new Date(cve.published).toLocaleDateString()}</td>
        <td>${new Date(cve.lastModified).toLocaleDateString()}</td>
        <td>${cve.vulnStatus}</td>
      `;
      row.addEventListener("click", () => {
        window.location.href = `description.html?cveId=${cve.cveId}`; // Redirect to description page
      });
      cveList.appendChild(row);
    });
  } else {
    cveList.innerHTML = "<tr><td colspan='5'>No data available</td></tr>";
  }

  // Update pagination controls
  totalPages = data.pagination.totalPages;
  document.getElementById(
    "pageNumber"
  ).innerText = `Page: ${currentPage}/${totalPages}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Function to handle page changes (prev/next)
function changePage(direction) {
  if (direction === "prev" && currentPage > 1) {
    currentPage--;
  } else if (direction === "next" && currentPage < totalPages) {
    currentPage++;
  }
  fetchCVEData(currentPage); // Fetch data for the updated page
}

// Form submission event for updating records per page (limit)
document
  .getElementById("recordsPerPageForm")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the form from reloading the page
    const quantity = parseInt(document.getElementById("quantity").value); // Get value from input

    if (quantity >= 1 && quantity <= totalCount) {
      limit = quantity;
      currentPage = 1;
      fetchCVEData(currentPage);
    } else {
      alert(`Please enter a value between 1 and ${totalCount}.`);
    }
  });

// Function to apply filters
async function applyFilters() {
  const year = document.getElementById("year").value;
  const score = document.getElementById("score").value;
  const days = document.getElementById("days").value;

  currentPage = 1;

  try {
    let url = `https://securinserver.onrender.com/api/cve?page=${currentPage}&limit=${limit}`;

    if (year) {
      url += `&year=${year}`;
    }
    if (score) {
      url += `&score=${score}`;
    }
    if (days) {
      url += `&days=${days}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (response.ok) {
      displayCVEData(data);
    } else {
      console.error(data.message);
      displayCVEData({
        cves: [],
        pagination: { totalCount: 0, totalPages: 0, currentPage: 1 },
      });
    }

    // Optionally clear input fields after applying filters
    document.getElementById("year").value = "";
    document.getElementById("score").value = "";
    document.getElementById("days").value = "";
  } catch (error) {
    console.error("Error applying filters:", error);
    // Handle errors in case of network failure or other issues
    displayCVEData({
      cves: [],
      pagination: { totalCount: 0, totalPages: 0, currentPage: 1 },
    });
  }
}

// Initial data load
fetchCVEData(currentPage);
