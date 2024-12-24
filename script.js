let currentPage = 1;
let limit = 10;
let totalPages = 1;
let totalCount = 0;

let filterYear = "";
let filterScore = "";
let filterDays = "";
let sortField = "";
let sortOrder = "asc"; // Default sort order

// Fetch CVE Data
async function fetchCVEData(page) {
  filterYear = document.getElementById("year").value;
  filterScore = document.getElementById("score").value;
  filterDays = document.getElementById("days").value;

  let url = `https://securinserver.onrender.com/api/cve?page=${page}&limit=${limit}`;

  if (filterYear) url += `&year=${filterYear}`;
  if (filterScore) url += `&score=${filterScore}`;
  if (filterDays) url += `&days=${filterDays}`;
  if (sortField) url += `&sortField=${sortField}&sortOrder=${sortOrder}`;

  try {
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
  } catch (error) {
    console.error("Error fetching CVEs:", error);
  }
}

// Sort Handlers
function sortData(field) {
  if (sortField === field) {
    sortOrder = sortOrder === "asc" ? "desc" : "asc";
  } else {
    sortField = field;
    sortOrder = "asc";
  }
  currentPage = 1;
  fetchCVEData(currentPage);
}

// Display CVE Data
function displayCVEData(data) {
  const cveList = document.getElementById("cve-list");
  cveList.innerHTML = `
    <tr>
      <th>CVE ID</th>
      <th>IDENTIFIER</th>
      <th>PUBLISHED DATE <button class="sort" onclick="sortData('published')">${
        sortField === "published" ? (sortOrder === "asc" ? "↥" : "↧") : "↥↧"
      }</button></th>
      <th>LAST MODIFIED DATE <button class="sort" onclick="sortData('lastModified')">${
        sortField === "lastModified" ? (sortOrder === "asc" ? "↥" : "↧") : "↥↧"
      }</button></th>
      <th>STATUS</th>
    </tr>
  `;

  const totalresults = document.getElementById("total");
  totalresults.innerHTML = `${data.pagination.totalCount}`;
  totalCount = data.pagination.totalCount;
  currentPage = data.pagination.currentPage;
  totalPages = data.pagination.totalPages;

  if (Array.isArray(data.cves) && data.cves.length > 0) {
    data.cves.forEach((cve) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cve.cveId}</td>
        <td>${cve.sourceIdentifier}</td>
        <td>${new Date(cve.published).toISOString().split("T")[0]}</td>
        <td>${new Date(cve.lastModified).toISOString().split("T")[0]}</td>
        <td>${cve.vulnStatus}</td>
      `;
      row.addEventListener("click", () => {
        window.location.href = `description.html?cveId=${cve.cveId}`;
      });
      cveList.appendChild(row);
    });
  } else {
    cveList.innerHTML = "<tr><td colspan='5'>No data available</td></tr>";
  }

  document.getElementById(
    "pageNumber"
  ).innerText = `Page: ${currentPage}/${totalPages}`;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;
}

// Pagination Handlers
function changePage(direction) {
  if (direction === "prev" && currentPage > 1) currentPage--;
  else if (direction === "next" && currentPage < totalPages) currentPage++;
  fetchCVEData(currentPage);
}

// Apply Filters
async function applyFilters() {
  currentPage = 1;
  fetchCVEData(currentPage);
}

// Records Per Page
document
  .getElementById("recordsPerPageForm")
  .addEventListener("submit", function (e) {
    e.preventDefault();
    const quantity = parseInt(document.getElementById("quantity").value);

    if (quantity >= 1 && quantity <= totalCount) {
      limit = quantity;
      currentPage = 1;
      fetchCVEData(currentPage);
    } else {
      alert(`Please enter a value between 1 and ${totalCount}.`);
    }
  });

// Initial Data Load
fetchCVEData(currentPage);
