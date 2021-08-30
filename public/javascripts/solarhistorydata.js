$(function() {
    $("button").on("click", function () {
        $.ajax('/ExportExcel', {
            type: 'POST',
            contentType: 'text/json',
            data: setTableData,
            complete: function() { /* Do something with the response. */ }
        });
    });
  });