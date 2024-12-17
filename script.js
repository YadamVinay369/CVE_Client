let currentPage = 1;
let limit = 10;
let totalPages = 1; // Initialize totalPages
let totalCount = 0;

function fetchCVEData(page) {
  fetch(
    `https://securinserver.onrender.com/api/cve?page=${page}&limit=${limit}`
  )
    .then((response) => response.json())
    .then((data) => {
      const cveList = document.getElementById("cve-list");
      cveList.innerHTML = `
        <tr>
          <th>CVE ID</th>
          <th>IDENTIFIER</th>
          <th>PUBLISHED DATE</th>
          <th>LAST MODIFIED DATE</th>
          <th>STATUS</th>
        </tr>
      `; // Clear current table content

      const totalresults = document.getElementById("total");
      totalresults.innerHTML = `${data.pagination.totalCount}`;
      totalCount = data.pagination.totalCount;

      // Populate table with fetched CVE data
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

      // Update pagination controls
      totalPages = data.pagination.totalPages; // Get totalPages from the response
      document.getElementById("pageNumber").innerText = `Page: ${page}`;
      document.getElementById("prevPage").disabled = page === 1;
      document.getElementById("nextPage").disabled = page === totalPages;
    })
    .catch((error) => console.error("Error fetching CVEs:", error));
}

function changePage(direction) {
  if (direction === "prev" && currentPage > 1) {
    currentPage--;
  } else if (direction === "next" && currentPage < totalPages) {
    currentPage++;
  }
  fetchCVEData(currentPage);
}

// Form submission event for updating records per page (limit)
document
  .getElementById("recordsPerPageForm")
  .addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent the form from reloading the page
    const quantity = parseInt(document.getElementById("quantity").value); // Get value from input
    if (quantity >= 1 && quantity <= totalCount) {
      limit = quantity; // Set the limit to the chosen quantity (multiplied by 3 for variety)
      currentPage = 1; // Reset to first page when changing the limit
      fetchCVEData(currentPage); // Fetch new data with the updated limit
    } else {
      alert(`Please enter a value between 1 and ${totalCount}.`);
    }
  });

// Initial data load
fetchCVEData(currentPage);
