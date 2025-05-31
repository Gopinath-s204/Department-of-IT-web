$(document).ready(function () {
  let isStaffAuthenticated = false;

  // Toggle upload section with password protection
  $("#upload-btn").click(function () {
    if (!isStaffAuthenticated) {
      let password = prompt("Enter Password to Access Upload Section:");
      if (password === "staff123") {
        isStaffAuthenticated = true;
        $(".upload-section").toggle();
      } else {
        alert("Access Denied!");
        return;
      }
    } else {
      $(".upload-section").toggle();
    }
  });
  $("#upload-file").click(function () {
    const fileInput = $("#file-upload")[0];
    const year = $("#year-select").val();
    const subject = $("#subject-input").val().trim();

    // Clear previous errors
    $(".error-message").remove();

    // Validation
    let isValid = true;
    if (!fileInput.files || fileInput.files.length === 0) {
      $("#file-upload").after(
        '<div class="error-message text-danger">Please select a file</div>'
      );
      isValid = false;
    }
    if (!year) {
      $("#year-select").after(
        '<div class="error-message text-danger">Please select a year</div>'
      );
      isValid = false;
    }
    if (!subject) {
      $("#subject-input").after(
        '<div class="error-message text-danger">Please enter a subject</div>'
      );
      isValid = false;
    }

    if (!isValid) return;

    // Prepare form data
    let formData = new FormData();
    formData.append("file", fileInput.files[0]);
    formData.append("year", year);
    formData.append("subject", subject);

    // UI feedback
    const btn = $(this);
    const originalText = btn.text();
    btn
      .prop("disabled", true)
      .html(
        '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Uploading...'
      );

    // Performance tracking
    const uploadStart = performance.now();
    console.log("formadata", formData);
    let result = storeMaterial(formData);
    console.log("resilt", result);
    //   $.ajax({
    //     url: 'http://127.0.0.1:3000/api/materials',
    //     type: 'POST',
    //     data: formData,
    //     contentType: false,
    //     processData: false,
    //     success: function(response) {
    //       // Success feedback
    //       const uploadTime = ((performance.now() - uploadStart)/1000).toFixed(2);
    //       showAlert('success', `Upload successful (${uploadTime}s): ${response.message}`);

    //       // Reset form
    //       $('#file-upload').val('');
    //       $('#subject-input').val('');
    //     },
    //     error: function(xhr) {
    //       let errorMsg = 'Upload failed';
    //       if (xhr.responseJSON) {
    //         errorMsg = xhr.responseJSON.error || errorMsg;
    //         if (xhr.responseJSON.details) {
    //           errorMsg += `: ${xhr.responseJSON.details}`;
    //         }
    //       }
    //       showAlert('danger', errorMsg);
    //     },
    //     complete: function() {
    //       btn.prop('disabled', false).html(originalText);
    //     }
    //   });
  });

  async function storeMaterial(formData) {
    console.log("i am inn");
    let response = await fetch("http://127.0.0.1:3000/api/materials", {
      method: "POST",
      body: formData,
    });

    let result = await response.json();
    console.log(result);
    return result;
  }

  function showAlert(type, message) {
    const alertHtml = `
  <div class="alert alert-${type} alert-dismissible fade show" role="alert">
    ${message}
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
  </div>
`;
    $("#alerts-container").html(alertHtml);
  }
  // Load subjects and files when year is selected
  $("#year-view-select").change(function () {
    let year = $(this).val();
    if (year) {
      $("#year-view-subject").show();
      loadSubjects(year);
    } else {
      $("#year-view-subject").hide();
    }
  });

  // Function to load subjects for a year
  function loadSubjects(year) {
    $.ajax({
      url: `/api/subjects/${year}`,
      type: "GET",
      success: function (subjects) {
        let subjectList = $("#subject-list");
        subjectList.empty();

        if (subjects.length === 0) {
          $("#year-view-subject-select").append(
            `<option value="">Please select Year</option>`
          );
        } else {
          subjects.forEach(function (subject) {
            $("#year-view-subject-select").append(
              `<option value="${subject}">${subject}</option>`
            );
          });
        }
        $("#subject-section").show();
      },
      error: function (xhr) {
        alert(
          "Failed to load subjects: " +
            (xhr.responseJSON?.error || "Server error")
        );
      },
    });
  }

  $("#view_sub_materials").click(function () {
    let selected_year = $("#year-view-select").find(":selected").val();
    let selected_subject = $("#year-view-subject-select")
      .find(":selected")
      .val();
    loadFilesByYear(selected_year, selected_subject);
  });

  // Function to load files for a selected year
  function loadFilesByYear(year, subject) {
    $.ajax({
      url: `/api/subjects/${year}/${subject}`,
      type: "GET",
      success: function (files) {
        if (files.length === 0) {
          $("#view_list_files").text(
            `<div class="grid-item">No files found for ${year} - ${subject}</div>`
          );
        } else {
          files.forEach(function (file) {
            $(
              "#view_list_files"
            ).append(`<div class="grid-item"><a href="/uploads/materials/${year}/${subject}/${file}" 
                             target="_blank" 
                             class="text-decoration-none">
                              ${file}
                          </a></div>`);
          });
        }
      },
      error: function (xhr) {
        alert(
          "Failed to load files: " + (xhr.responseJSON?.error || "Server error")
        );
      },
    });
  }
});
