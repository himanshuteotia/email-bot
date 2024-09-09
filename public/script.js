document.addEventListener("DOMContentLoaded", () => {
  const uploadForm = document.getElementById("uploadForm");
  const fileInput = document.getElementById("file");
  const uploadBtn = document.getElementById("uploadBtn");
  const openEmailFormButton = document.getElementById("openEmailForm");
  const emailFormContainer = document.getElementById("emailFormContainer");
  const emailForm = document.getElementById("emailForm");

  if (uploadForm) {
    uploadForm.addEventListener("submit", handleUpload);
    uploadForm.addEventListener("reset", resetUploadForm);
  }

  if (fileInput) {
    fileInput.addEventListener("change", showUploadButton);
  }

  if (openEmailFormButton) {
    openEmailFormButton.addEventListener("click", () => {
      if (emailFormContainer) {
        emailFormContainer.style.display = "block";
      }
    });
  }

  if (emailForm) {
    emailForm.addEventListener("submit", handleEmailSend);
  }

  const emailListHeader = document.querySelector(".email-list-header");
  if (emailListHeader) {
    emailListHeader.addEventListener("click", toggleEmailList);
  }
});

async function handleUpload(e) {
  e.preventDefault();
  const formData = new FormData(e.target);
  try {
    const response = await fetch("/upload", {
      method: "POST",
      body: formData,
    });
    if (!response.ok) {
      throw new Error("Server se error aaya");
    }
    const data = await response.json();
    if (data.emails && data.emails.length > 0) {
      displayEmails(data.emails);
    } else {
      alert("Koi valid email nahi mila");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("File upload mein kuch problem hui: " + error.message);
  }
}

function displayEmails(emails) {
  const emailList = document.querySelector(".email-items");
  const emailCount = document.getElementById("emailCount");
  const uploadPrompt = document.getElementById("uploadPrompt");

  if (!emailList || !emailCount) return;

  emailList.innerHTML = "";
  emails.forEach((email) => {
    const div = document.createElement("div");
    div.className = "email-item";
    div.innerHTML = `
            <span>${email}</span>
            <button class="cancel-btn">Cancel</button>
        `;
    div.querySelector(".cancel-btn").addEventListener("click", () => {
      div.remove();
      updateEmailCount();
      updateSendButton();
    });
    emailList.appendChild(div);
  });

  updateEmailCount();
  updateSendButton();

  // Show email list after adding emails
  emailList.classList.add("open");
  const toggleIcon = document.querySelector(".toggle-icon");
  if (toggleIcon) {
    toggleIcon.classList.add("open");
  }

  // Hide upload prompt
  if (uploadPrompt) {
    uploadPrompt.style.display = "none";
  }
}

function updateEmailCount() {
  const emailCount = document.getElementById("emailCount");
  const emailItems = document.querySelectorAll(".email-item");
  if (emailCount) {
    emailCount.textContent = `Total Emails: ${emailItems.length}`;
  }
}

function updateSendButton() {
  const openEmailFormButton = document.getElementById("openEmailForm");
  const emailItems = document.querySelectorAll(".email-item");
  if (!openEmailFormButton) return;

  openEmailFormButton.style.display = emailItems.length > 0 ? "block" : "none";

  // Show/hide upload prompt
  const uploadPrompt = document.getElementById("uploadPrompt");
  if (uploadPrompt) {
    uploadPrompt.style.display = emailItems.length > 0 ? "none" : "block";
  }
}

async function handleEmailSend(e) {
  e.preventDefault();
  const subject = document.getElementById("subject").value;
  const content = document.getElementById("content").value;
  const attachment = document.getElementById("attachment").files[0];
  const emails = Array.from(document.querySelectorAll(".email-item span")).map(
    (span) => span.textContent
  );

  const formData = new FormData();
  formData.append("subject", subject);
  formData.append("content", content);
  formData.append("attachment", attachment);
  formData.append("emails", JSON.stringify(emails));

  try {
    const response = await fetch("/send", {
      method: "POST",
      body: formData,
    });
    const result = await response.text();
    alert(result);
    const emailFormContainer = document.getElementById("emailFormContainer");
    if (emailFormContainer) {
      emailFormContainer.style.display = "none";
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Email bhejne mein kuch problem hui: " + error.message);
  }
}

function showUploadButton() {
  const fileInput = document.getElementById("file");
  const uploadBtn = document.getElementById("uploadBtn");
  const fileLabel = document.querySelector(".file-input-wrapper label span");

  if (fileInput && uploadBtn && fileLabel) {
    if (fileInput.files.length > 0) {
      uploadBtn.style.display = "block";
      fileLabel.textContent = fileInput.files[0].name;
    } else {
      uploadBtn.style.display = "none";
      fileLabel.textContent = "Choose a file";
    }
  }
}

function resetUploadForm() {
  const uploadBtn = document.getElementById("uploadBtn");
  const fileLabel = document.querySelector(".file-input-wrapper label span");

  if (uploadBtn) {
    uploadBtn.style.display = "none";
  }
  if (fileLabel) {
    fileLabel.textContent = "Choose a file";
  }
}

function toggleEmailList() {
  const emailItems = document.querySelector(".email-items");
  const toggleIcon = document.querySelector(".toggle-icon");

  if (emailItems && toggleIcon) {
    emailItems.classList.toggle("open");
    toggleIcon.classList.toggle("open");
  }
}
